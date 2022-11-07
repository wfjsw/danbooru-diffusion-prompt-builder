/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

import {Set as ImmutableSet, OrderedSet as ImmutableOrderedSet} from 'immutable'
import {defineStore} from 'pinia'
import {useTagStore} from './tags'
import {usePresetStore} from './presets'
import {useSettingsStore} from './settings'
import {useEmbeddingStore} from './embeddings'
import Decimal from 'decimal.js-light'

export interface CartItemPresetChild {
    label: string,
    name: string,
    category: string | null,
    type: 'tag',
    weight: Decimal,
    children: null,
    parent: CartItemPreset,
}

export type CartSimpleType = 'tag' | 'embedding'
export type CartSwitchableType = 'composition' | 'editing' | 'alternate' | 'group'
export type CartCompositeType = 'preset' | CartSwitchableType

export type CartType = CartSimpleType | CartCompositeType

export interface CartItemSimple {
    label: string,
    name: string,
    category: string | null,
    type: CartSimpleType,
    weight: Decimal,
    children: null,
    parent: CartItemComplex|null,
}

export interface CartItemPreset {
    label: string,
    type: 'preset',
    name: string,
    category: string,
    weight: Decimal,
    children: CartItemPresetChild[],
    parent: CartItemComplex|null,
}

// there are 2 weight
export type CartItemCompositionChild = CartItemGroup & {parent: CartItemComposition, weight: Decimal}

export interface CartItemComposition {
    label: '标签混合',
    type: 'composition',
    weight: Decimal, 
    children: CartItemCompositionChild[],
    parent: CartItemComplex|null,
}

export interface CartItemNull {
    label: '无标签',
    type: 'null',
    children: null,
    parent: CartItemComplex|null,
}

export type CartItemEditingChild = (CartItem | CartItemNull) & { parent: CartItemEditing }

export interface CartItemEditing {
    label: '标签替换',
    type: 'editing',
    breakpoint: Decimal,
    weight: Decimal,
    children: [CartItemEditingChild, CartItemEditingChild],
    parent: CartItemComplex|null,
}

export type CartItemAlternateChild = CartItem & {parent: CartItemAlternate}

export interface CartItemAlternate {
    label: '标签轮转',
    type: 'alternate',
    weight: Decimal,
    children: CartItemAlternateChild[],
    parent: CartItemComplex|null,
}

export type CartItemGroupChild = CartItem & {parent: CartItemGroup}

export interface CartItemGroup {
    label: '标签组',
    type: 'group',
    weight: Decimal,
    children: CartItemGroupChild[],
    parent: CartItemComplex|null,
}

export type CartItemComplex = CartItemComposition | CartItemEditing | CartItemAlternate | CartItemGroup

export type CartItem = CartItemSimple | CartItemPreset | CartItemComplex
export type CartChildItem = CartItemPresetChild | CartItemCompositionChild | CartItemEditingChild | CartItemAlternateChild | CartItemGroupChild

export type CartItemNullable = CartItem | CartItemNull

export interface Cart {
    positive: CartItem[],
    negative: CartItem[],
}

function wrapParen(content: string, char: '(' | '{' | '[', length: number) {
    for (let i = 0; i < length; i++) {
        switch (char) {
            case '(':
                content = `(${content})`
                break
            case '{':
                content = `{${content}}`
                break
            case '[':
                content = `[${content}]`
                break
        }
    }
    return content
}

export function wrapParenByWeight(content: string, weight: Decimal, newEmphasis: boolean): string {
    if (newEmphasis) {
        if (!weight.toDecimalPlaces(8).equals(1)) {
            return `(${content}:${weight.toDecimalPlaces(8)})`
        }
    } else {
        const oldWeight = weight.log(1.05).toInteger().toNumber()
        if (oldWeight !== 0) {
            return wrapParen(content, oldWeight > 0 ? '{' : '[', Math.abs(oldWeight))
        }
    }
    return content
}

function tagArrayToString(items: (CartItemNullable|CartItemPresetChild)[], newEmphasis: boolean): string {
    return ImmutableOrderedSet.of(...items.reduce((a: string[], t): string[] => {
        if (t.type === 'tag' || t.type === 'embedding') {
            let name = t.name.replaceAll('\\', '\\\\')
            if (newEmphasis) {
                name = name
                    .replaceAll('(', '\\(').replaceAll(')', '\\)')
                    .replaceAll('[', '\\[').replaceAll(']', '\\]')
            } else {
                name = name
                    .replaceAll('{', '\\{').replaceAll('}', '\\}')
                    .replaceAll('[', '\\[').replaceAll(']', '\\]')
            }
            a.push(wrapParenByWeight(name, t.weight, newEmphasis))
        } else if (t.type === 'preset') {
            a.push(tagArrayToString(t.children, newEmphasis))
        } else if (t.type === 'composition') {
            if (newEmphasis) {
                a.push(t.children.map(n => n.weight.eq(1) ? tagArrayToString(n.children, newEmphasis)
                    : `${tagArrayToString(n.children, newEmphasis)} :${n.weight.toDecimalPlaces(3).toNumber()}`).join(' AND '))
            } else {
                a.push(t.children.map(n => n.weight.eq(1) ? tagArrayToString(n.children, newEmphasis)
                    : `${tagArrayToString(n.children, newEmphasis)}:${n.weight.toDecimalPlaces(3).toNumber()}`).join('|'))
            }
        } else if (t.type === 'alternate') {
            if (newEmphasis) {
                a.push(wrapParenByWeight(`[${t.children.map(n => tagArrayToString([n], newEmphasis)).join('|')}]`, t.weight, newEmphasis))
            } else {
                a.push(wrapParenByWeight(tagArrayToString(t.children, newEmphasis), t.weight, newEmphasis))
            }
        } else if (t.type === 'editing') {
            if (newEmphasis) {
                a.push(wrapParenByWeight(`[${t.children[0].type !== 'null' ? tagArrayToString([t.children[0]], newEmphasis) 
                    : ''}:${t.children[1].type !== 'null' ? tagArrayToString([t.children[1]], newEmphasis)
                    : ''}:${t.breakpoint.toDecimalPlaces(3).toNumber()}]`, t.weight, newEmphasis))
            } else {
                a.push(wrapParenByWeight(tagArrayToString(t.children, newEmphasis), t.weight, newEmphasis))
            }
        } else if (t.type === 'group') {
            a.push(wrapParenByWeight(tagArrayToString(t.children, newEmphasis), t.weight, newEmphasis))
        }
        return a
    }, [])).join(', ')
}

function tagNameMapper(n: CartItem|CartItemPresetChild): string|string[] {
    switch (n.type) {
        case 'tag':
        case 'embedding':
            return n.name
        case 'preset':
        case 'composition':
        case 'alternate':
        case 'group':
            return n.children.flatMap(e => tagNameMapper(e))
        case 'editing':
            return n.children.filter((e): e is CartItem & { parent: CartItemEditing } => e.type !== 'null')
                .flatMap(e => tagNameMapper(e))
    }
}

function removeTag(ref: CartItem[], tagName: string, type: 'tag'|'embedding' = 'tag') {
    // Direct tags
    const index = ref.findIndex(n => n.type === type && n.name === tagName)
    if (index !== -1) {
        ref.splice(index, 1)
    } else {
        // Complex groups
        for (let i = 0; i < ref.length; i++) {
            if (ref[i].type === 'preset') {
                const preset = ref[i] as CartItemPreset
                const parent = preset.parent
                const idx = preset
                    .children.findIndex(n => n.type === type && n.name === tagName)
                if (idx !== -1) {
                    // Decompose the preset
                    const decomposedTagArray: CartItemSimple[] = preset.children
                        .filter(n => n.name !== tagName).map(n => ({...n, parent}))
                    ref.splice(i, 1, ...decomposedTagArray)
                }
            } else if (
                   ref[i].type === 'editing'
                || ref[i].type === 'composition'
                || ref[i].type === 'alternate' ) {
                const item = ref[i] as CartItemComposition|CartItemAlternate|CartItemEditing
                const idx = item
                    .children.findIndex(n => n.type === type && n.name === tagName)
                item.children.splice(idx, 1)
                // @ts-ignore Stupid Typescript
                if (item.children.every(n => n.type === 'null')) {
                    // No effective item in this mixture
                    ref.splice(i, 1)
                } else if (item.children.length === 1) {
                    // Only one effective item in this mixture
                    const child = item.children[0]
                    const parent = item.parent
                    if (child.type === 'tag' || child.type === 'embedding') {
                        if (item.type === 'editing') {
                            item.children.push({type: 'null', label: '无标签', parent: item, children: null})
                        } else {
                            ref.splice(i, 1, {...child, parent, weight: new Decimal(1)})
                        }
                    }
                }
            }
        }
    }
}

function removePreset(ref: CartItem[], category: string, name: string) {
    const index = ref.findIndex((ci: CartItem) =>
        ci.type === 'preset' && category === ci.category && name === ci.name )
    if (index > -1) ref.splice(index, 1)
}

function appendTag(ref: CartItem[], tagName: string, weight: Decimal,
                   existsFn: (type: 'tag'|'embedding', name: string) => boolean,
                   removeRevFn: (tagName: string, tag?: 'tag'|'embedding') => void) {
    const tagStore = useTagStore()
    const embeddingStore = useEmbeddingStore()

    if (existsFn('tag', tagName)) return
    const tag = tagStore.resolve(tagName)
    if (tag !== null) {
        // if (Array.isArray(ref)) {
        // root
        ref.push({
            label: `${tagName} - ${tag.meta.name}`,
            type: 'tag',
            name: tagName,
            category: tag.meta.category,
            weight,
            children: null,
            parent: null,
        })
        // } else {
        //     // TODO: Unused and broken. forget about this for now

        //     if (ref.type === 'composition') {
        //         const group: CartItemCompositionChild = {
        //             label: '标签组',
        //             parent: ref,
        //             type: 'group',
        //             children: [],
        //             weight: new Decimal(1),
        //         }
        //         group.children.push({
        //             label: `${tagName} - ${tag.meta.name}`,
        //             type: 'tag',
        //             name: tagName,
        //             category: tag.meta.category,
        //             weight,
        //             children: null,
        //             parent: group,
        //         })
        //         ref.children.push(group)
        //     } else if (ref.type === 'alternate') {
        //         ref.children.push({
        //             label: `${tagName} - ${tag.meta.name}`,
        //             type: 'tag',
        //             name: tagName,
        //             category: tag.meta.category,
        //             weight,
        //             parent: ref,
        //             children: null,
        //         })
        //     } else if (ref.type === 'group') {
        //         ref.children.push({
        //             label: `${tagName} - ${tag.meta.name}`,
        //             type: 'tag',
        //             name: tagName,
        //             category: tag.meta.category,
        //             weight,
        //             parent: ref,
        //             children: null,
        //         })
        //     } else if (ref.type === 'editing') {

        //     }
        // }

        removeRevFn(tagName, 'tag')
        return
    }

    const embedding = embeddingStore.resolve(tagName)
    if (embedding !== null) {
        ref.push({
            label: `[E] ${tagName} - ${embedding.name}`,
            type: 'embedding',
            name: tagName,
            category: embedding.category,
            weight,
            parent: null,
            children: null,
        })
        removeRevFn(tagName, 'embedding')
        return
    }

    ref.push({
        label: tagName,
        type: 'tag',
        name: tagName,
        category: null,
        weight,
        parent: null,
        children: null,
    })
    removeRevFn(tagName, 'tag')
}

function appendPreset(ref: CartItem[], presetCategory: string, presetName: string,
                      existsFn: (type: 'preset', name: string, category: string) => boolean,
                      removeRevFn: (category: string, name: string) => void) {
    const tagStore = useTagStore()
    const presetStore = usePresetStore()

    if (existsFn('preset', presetName, presetCategory)) return
    const preset = presetStore.presets
        .find(n => n.name === presetCategory)?.content
        .find(n => n.name === presetName)
    if (preset) {
        const item: CartItemPreset = {
            label: `${presetCategory}/${presetName}`,
            type: 'preset',
            name: presetName,
            category: presetCategory,
            weight: new Decimal(1),
            children: [],
            parent: null,
        }
        item.children = preset.content.map(({ tag, weight }) => {
            const resolved = tagStore.resolve(tag)
            if (resolved) {
                return {
                    label: `${tag} - ${resolved.meta.name}`,
                    name: tag,
                    type: 'tag',
                    category: resolved.meta.category,
                    weight: new Decimal(weight),
                    parent: item,
                    children: null,
                }
            } else {
                return {
                    label: tag,
                    name: tag,
                    type: 'tag',
                    category: null,
                    weight: new Decimal(weight),
                    parent: item,
                    children: null,
                }
            }
        })
        ref.push(item),
        removeRevFn(presetCategory, presetName)
    } else {
        throw new Error(`Preset ${presetCategory}/${presetName} does not exist.`)
    }
}

export const useCartStore = defineStore('cart', {
    state: (): Cart => ({
        positive: [],
        negative: [],
    }),
    getters: {
        positiveToString: (state) => {
            const settingsStore = useSettingsStore()
            return tagArrayToString(state.positive, settingsStore.newEmphasis)
        },
        negativeToString: (state) => {
            const settingsStore = useSettingsStore()
            return tagArrayToString(state.negative, settingsStore.newEmphasis)
        },
        positiveTags: (state) => ImmutableSet.of<string>(...state.positive.flatMap(tagNameMapper)),
        positiveTagsShallow: (state) => ImmutableSet.of<string>(...state.positive
            .filter(({ type }) => ['tag', 'embedding', 'preset'].includes(type)).flatMap(tagNameMapper)),
        negativeTags: (state) => ImmutableSet.of<string>(...state.negative.flatMap(tagNameMapper)),
        negativeTagsShallow: (state) => ImmutableSet.of<string>(...state.negative
            .filter(({ type }) => ['tag', 'embedding', 'preset'].includes(type)).flatMap(tagNameMapper)),
        positivePresets: (state) => ImmutableSet.of<string>(...state.positive
            .filter((t): t is CartItemPreset => t.type === 'preset').map(({category, name}) => JSON.stringify([category, name]))),
        negativePresets: (state) => ImmutableSet.of<string>(...state.negative
            .filter((t): t is CartItemPreset => t.type === 'preset').map(({category, name}) => JSON.stringify([category, name]))),

    },
    actions: {

        existsPositive(type: 'tag' | 'preset'| 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.positiveTagsShallow.includes(name)
            } else if (type === 'preset') {
                return this.positivePresets.includes(JSON.stringify([category, name]))
            }
            return false
        },

        existsNegative(type: 'tag' | 'preset' | 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.negativeTagsShallow.includes(name)
            } else if (type === 'preset') {
                return this.negativePresets.includes(JSON.stringify([category, name]))
            }
            return false
        },

        appendPositiveTag(tagName: string, weight: Decimal = new Decimal(1)) {
            appendTag(this.positive, tagName, weight, this.existsPositive, this.removeNegativeTag)
        },

        removePositiveTag(tagName: string, type: 'tag'|'embedding' = 'tag') {
            removeTag(this.positive, tagName, type)
        },

        appendNegativeTag(tagName: string, weight: Decimal = new Decimal(1)) {
            appendTag(this.negative, tagName, weight, this.existsNegative, this.removePositiveTag)
        },

        removeNegativeTag(tagName: string, type: 'tag'|'embedding' = 'tag') {
            removeTag(this.negative, tagName, type)
        },

        appendPositivePreset(presetCategory: string, presetName: string) {
            appendPreset(this.positive, presetCategory, presetName, this.existsPositive, this.removeNegativePreset)
        },

        removePositivePreset(presetCategory: string, presetName: string) {
            removePreset(this.positive, presetCategory, presetName)
        },

        appendNegativePreset(presetCategory: string, presetName: string) {
            appendPreset(this.negative, presetCategory, presetName, this.existsNegative, this.removePositivePreset)
        },

        removeNegativePreset(presetCategory: string, presetName: string) {
            removePreset(this.negative, presetCategory, presetName)
        },

        appendCartItem(direction: 'positive'|'negative', item: CartItem) {
            this[direction].push(item)
        },

        removeCartItem(direction: 'positive' | 'negative', item: CartItem|CartChildItem) {
            const root = item.parent?.children ?? this[direction]
            // @ts-ignore sometimes caused by ElTree
            root.splice(root.indexOf(item), 1)
            if (item.parent !== null) {
                this.convergeToFit(item.parent.parent?.children ?? this[direction])
            }
        },

        dismissCartItem(direction: 'positive' | 'negative', item: CartItemPreset | CartItemComplex) {
            const parent = item.parent
            const children: CartItemSimple[] = item.children
                // @ts-ignore why no filter
                .filter((n): n is Exclude<CartChildItem, CartItemNull> => n.type !== 'null')
                .map((n: Exclude<CartChildItem, CartItemNull>): CartItem =>
                    ({ ...n, parent, ...n.type !== 'group' && { weight: new Decimal(1) } }))
            this[direction].splice(this[direction].indexOf(item), 1, ...children)
        },

        clear() {
            this.$patch({
                positive: [],
                negative: [],
            })
        },

        import(positive: string, negative: string) {
            const tagStore = useTagStore()
            // as per https://github.com/wfjsw/danbooru-diffusion-prompt-builder/issues/6
            // this.clear()
            const run = (text: string, appendFn: (tagName: string, weight: Decimal) => void) => {
                let weight = new Decimal(1)
                let guessNew = true
                const trimmedText = text.trim()
                if (trimmedText === '') return
                const textList = trimmedText
                    .replaceAll('_', ' ').split(/\s*,\s*|\s*，\s*/)
                for (const token of textList) {
                    let text = null

                    // TODO: parse alternate/composition/editing

                    // check numeric emphasis
                    const numericalEmphasis = token.match(/\(([^:]+):(\d+(?:.\d+)?)\)/)
                    if (numericalEmphasis) {
                        const [content, emphasis] = numericalEmphasis.slice(1)
                        text = content
                        weight = new Decimal(emphasis)
                    } else {
                        for (const char of token) {
                            if (char === '(') {
                                guessNew = true
                                weight = weight.times(1.1)
                            } else if (char === '{') {
                                guessNew = false
                                weight = weight.times(1.05)
                            } else if (char === '[') {
                                weight = weight.times(guessNew ? 1.1:1.05)
                            } else {
                                break
                            }
                        }
                        const name = token.match(/^[([{]*(.*?)[)\]}]*$/)
                        if (name) {
                            text = name[1]
                            if (text.endsWith('\\')) {
                                text += name[name.lastIndexOf(text) + name.length]
                            }
                        }
                    }
                    if (text) {
                        text = text.replaceAll('\\(', '(')
                            .replaceAll('\\)', ')')
                            .replaceAll('\\[', '[')
                            .replaceAll('\\]', ']')
                            .replaceAll('\\{', '{')
                            .replaceAll('\\}', '}')
                            .toLowerCase()
                        let matchText = text
                        let resolvedTag = tagStore.resolve(text)
                        if (!resolvedTag) {
                            matchText = text + 's'
                            resolvedTag = tagStore.resolve(matchText)
                        }
                        if (!resolvedTag) {
                            matchText = text + 'es'
                            resolvedTag = tagStore.resolve(matchText)
                        }
                        if (!resolvedTag && text.endsWith('s')) {
                            matchText = text.slice(0, -1)
                            resolvedTag = tagStore.resolve(matchText)
                        }
                        if (!resolvedTag && text.endsWith('es')) {
                            matchText = text.slice(0, -2)
                            resolvedTag = tagStore.resolve(matchText)
                        }
                        matchText = resolvedTag ? matchText : text
                        appendFn(matchText, weight)
                    }
                    if (!numericalEmphasis) {
                        const reversed = Array.from(token).reverse()
                        for (let i = 0; i < reversed.length; i++) {
                            const char = reversed[i]
                            const nextChar = reversed[i + 1]
                            if (nextChar !== '\\') {
                                if (char === ')' && nextChar !== '\\') {
                                    guessNew = true
                                    weight = weight.div(1.1)
                                } else if (char === '}') {
                                    guessNew = false
                                    weight = weight.div(1.05)
                                } else if (char === ']') {
                                    weight = weight.div(guessNew ? 1.1:1.05)
                                } else {
                                    break
                                }
                            } else {
                                break
                            }
                        }
                    }
                }
            }
            // console.log('import', positive, negative)
            run(positive, this.appendPositiveTag)
            run(negative, this.appendNegativeTag)
        },

        createMixtureFromTag(direction: 'positive' | 'negative', item: Omit<CartItemSimple, 'children'> & { children: (CartItemSimple | CartChildItem)[] | null }) {
            const root = item.parent?.children ?? this[direction]
            // @ts-expect-error caused by ElTree
            const idx = root.indexOf(item)
            if (idx !== -1) {
                const composition: CartItemEditing = {
                    type: 'editing',
                    label: '标签替换',
                    breakpoint: new Decimal(0),
                    // @ts-expect-error Circular reference here
                    children: null,
                    weight: new Decimal(1),
                    parent: item.parent ?? null,
                }

                const {children: oldChildren, ...rest} = item

                composition.children  = [
                    {...rest, parent: composition, children: null},
                    Array.isArray(oldChildren) ?
                        { ...oldChildren[0], parent: composition }
                        : { type: 'null', label: '无标签', parent: composition, children: null },
                ]
                root.splice(idx, 1, composition)
            }
        },

        wrapCompositionChild(item: CartItem) {
            const root = item?.parent?.children
            // @ts-expect-error caused by ElTree
            const idx = root.indexOf(item)
            if (root && idx !== -1) {
                const composition: CartItemCompositionChild = {
                    type: 'group',
                    label: '标签组',
                    weight: new Decimal(1),
                    // @ts-expect-error Circular reference here
                    children: null,
                    parent: item.parent as CartItemComposition,
                }
                composition.children = [{ ...item, parent: composition }]
                root.splice(idx, 1, composition)
            }
        },

        determineNextSwitchableMixture(item: CartItemComplex) {
            if (item.type === 'editing') {
                const effectiveChildren = item.children.filter((child) => child.type !== 'null')
                if (effectiveChildren.length < 2) return 'group'
                else return 'alternate'
            } else if (item.type === 'alternate') {
                return 'composition'
            } else if (item.type === 'composition') {
                return 'group'
            } else if (item.type === 'group') {
                if (item.children.length < 3) {
                    return 'editing'
                } else {
                    return 'alternate'
                }
            }
            return null
        },

        isMixtureSwitchable(item: CartItemComplex, to: CartSwitchableType|null = null) {
            if (to === null) {
                return this.determineNextSwitchableMixture(item)
            } else if (to === item.type) {
                return false
            } else if (to === 'group' && item.type !== 'group') {
                return item.children
                    .some((child: CartItemNullable):
                        child is CartItem => child.type !== 'null')
            } else if (to === 'editing' && item.type !== 'editing') {
                return item.children.length < 3
            } else if (to === 'alternate' && item.type !== 'alternate'
                || to === 'composition' && item.type !== 'composition') {
                const effectiveChildren = item.children
                    // @ts-ignore ts somewhat broken
                    .filter((child: CartItemNullable):
                        child is CartItem => child.type !== 'null')
                return effectiveChildren.length > 1
            } else {
                return false
            }
        },

        switchMixtureType(direction: 'positive' | 'negative' | null, item: CartItemComplex, to: CartSwitchableType | null = null) {
            const root = item?.parent?.children ?? (direction !== null ? this[direction] : null)
            if (root === null) {
                throw new Error('Switching mixture type on null')
            }
            
            const dest = to ?? this.determineNextSwitchableMixture(item)
            if (!dest) return
            const switchable = this.isMixtureSwitchable(item, dest)
            if (switchable) {
                if (dest === 'editing' && item.type !== 'editing') {
                    const newMixture: CartItemEditing = {
                        type: 'editing',
                        label: '标签替换',
                        breakpoint: new Decimal(0),
                        // @ts-expect-error Circular reference here
                        children: null,
                        weight: new Decimal(1),
                        parent: item?.parent ?? null,
                    }

                    const children: CartItemEditingChild[] = item.children
                        .map((child): Exclude<CartItemEditingChild, CartItemNull> => {
                        if (child.parent.type === 'composition') {
                            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                            const { ...rest } = child as CartItemCompositionChild
                            if (rest.children.length === 1) {
                                return {
                                    ...rest.children[0],
                                    parent: newMixture,
                                }
                            } else {
                                return {
                                    ...rest,
                                    parent: newMixture
                                }
                            }
                        } else if (child.type === 'group' && child.children.length === 1) { 
                            return {...child.children[0], parent: newMixture}
                        } else {
                            return {
                                ...child,
                                parent: newMixture,
                            }
                        }
                    }).slice(0, 2)
                    if (children.length === 1) {
                        children.push({ type: 'null', label: '无标签', parent: newMixture, children: null })
                    } else if (children.length !== 2) {
                        throw new Error('Invalid state')
                    }
                    newMixture.children = children as [CartItemEditingChild, CartItemEditingChild]

                    const idx = root.indexOf(item as any)
                    root.splice(idx, 1, newMixture)
                } else if (dest === 'alternate' && item.type !== 'alternate') {
                    const newMixture: CartItemAlternate = {
                        type: 'alternate',
                        label: '标签轮转',
                        parent: item?.parent ?? null,
                        // @ts-expect-error Circular reference here
                        children: null,
                        weight: new Decimal(1),
                    }
                    newMixture.children = item.children
                        // @ts-ignore Stupid Typescript
                        .filter((child): child is CartItemCompositionChild | CartItem => child.type !== 'null')
                        .map((child: CartItemCompositionChild | CartItem): CartItemAlternateChild => {
                            if (child.parent?.type === 'composition') {
                                const { ...rest } = child as CartItemCompositionChild
                                if (rest.children.length === 1) {
                                    return {
                                        ...rest.children[0],
                                        parent: newMixture,
                                    }
                                } else {
                                    return {
                                        ...rest,
                                        parent: newMixture
                                    }
                                }
                            } else if (child.type === 'group' && child.children.length === 1) {
                                return {...child.children[0], parent: newMixture}
                            } else {
                                return {
                                    ...child,
                                    parent: newMixture,
                                }
                            }
                        })

                    const idx = root.indexOf(item as any)
                    root.splice(idx, 1, newMixture)
                } else if (dest === 'composition' && item.type !== 'composition') {
                    const newMixture: CartItemComposition = {
                        type: 'composition',
                        label: '标签混合',
                        parent: item?.parent ?? null,
                        // @ts-expect-error Circular reference here
                        children: null,
                        weight: new Decimal(1),
                    }
                    newMixture.children = item.children
                        // @ts-ignore Stupid Typescript
                        .filter((child): child is CartItemCompositionChild|CartItem => child.type !== 'null')
                        .map((child: CartItemCompositionChild | CartItem): CartItemCompositionChild => {
                            if (child.type !== 'group') {
                                const group: CartItemCompositionChild = {
                                    label: '标签组',
                                    type: 'group',
                                    children: [],
                                    parent: newMixture,
                                    weight: new Decimal(1),
                                }

                                group.children.push({ ...child, parent: group })
                                return group
                            } else {
                                return {
                                    ...child,
                                    parent: newMixture,
                                    weight: new Decimal(1),
                                }
                            }
                        })
                    const idx = root.indexOf(item as any)
                    root.splice(idx, 1, newMixture)
                } else if (dest === 'group' && item.type !== 'group') {
                    const newMixture: CartItemGroup = {
                        type: 'group',
                        label: '标签组',
                        parent: item?.parent ?? null,
                        // @ts-expect-error Circular reference here
                        children: null,
                        weight: new Decimal(1),
                    }
                    newMixture.children = item.children
                        // @ts-ignore Stupid Typescript
                        .filter((child): child is CartItem => child.type !== 'null')
                        .map((child: CartItem): CartItemGroupChild => {
                            if (child.parent?.type === 'composition') {
                                const { ...rest } = child as CartItemCompositionChild
                                if (rest.children.length === 1) {
                                    return {
                                        ...rest.children[0],
                                        parent: newMixture,
                                    }
                                } else {
                                    return {
                                        ...rest,
                                        parent: newMixture
                                    }
                                }
                            } else if (child.type === 'group' && child.children.length === 1) { 
                                return {...child.children[0], parent: newMixture}
                            } else {
                                return {
                                    ...child,
                                    parent: newMixture,
                                }
                            }
                        })
                    const idx = root.indexOf(item as any)
                    root.splice(idx, 1, newMixture)
                }

                this.convergeToFit(root)
            }
        },

        convergeToFit(root: CartItem[] | CartChildItem[]) {
            const isRoot = root === this.positive || root === this.negative
            let changed = true
            while (changed) {
                changed = false
                for (let i = 0; i < root.length; i++) {
                    const { type, children, parent } = root[i]
                    if (isRoot && parent !== null) {
                        root[i].parent = null
                        changed = true
                    }
                    if (children) {
                        for (let j = 0; j < children.length; j++) {
                            if (children[j].parent !== root[i]) {
                                children[j].parent = root[i] as CartItemComplex
                                changed = true
                            }
                        }
                        this.convergeToFit(children)
                    }
                    if (type === 'editing') {
                        const valid = children?.some((child) => child.type !== 'null') ?? false
                        // @ts-ignore whatever
                        const singular = children?.length === 1
                        // @ts-ignore also whatever
                        const tooMany = children?.length > 2
                        if (!valid) {
                            root.splice(i, 1)
                            changed = true
                            i--
                        } else if (singular) {
                            children.push({ type: 'null', label: '无标签', parent: root[i] as CartItemEditing, children: null })
                            changed = true
                            i--
                        } else if (tooMany) {
                            this.switchMixtureType(null, root[i] as CartItemEditing, 'alternate')
                            changed = true
                            i--
                        }
                    } else if (type === 'alternate' || type === 'composition' || type === 'group') {
                        const valid = children?.length > 0
                        const singular = children?.length === 1
                        if (!valid) {
                            root.splice(i, 1)
                            changed = true
                            i--
                        } else if (singular && type !== 'group') {
                            const child = children[0]
                            // @ts-ignore well
                            root.splice(i, 1, {...child, parent: root[i]})
                            changed = true
                            i--
                        }
                    }
                }
            }
        }
    }

})
