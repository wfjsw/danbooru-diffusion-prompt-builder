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
    level: 'presetChild'
    weight: Decimal,
    parent: CartItemPreset,
}

export type CartSimpleType = 'tag' | 'embedding'
export type CartCompositeType = 'preset' | 'composition' | 'editing' | 'alternate'

export type CartType = CartSimpleType | CartCompositeType

export interface CartItemSimple {
    label: string,
    type: 'tag' | 'embedding',
    category: string | null,
    name: string,
    level: 'free',
    weight: Decimal,
    parent: null,
}

export interface CartItemPreset {
    label: string,
    type: 'preset',
    name: string,
    level: 'free',
    category: string,
    children: CartItemPresetChild[],
    parent: null,
}

export interface CartItemCompositionChild {
    label: string,
    name: string,
    category: string | null,
    type: 'tag' | 'embedding',
    level: 'compositionChild',
    weight: Decimal,
    parent: CartItemComposition,
}

export interface CartItemComposition {
    label: '标签混合',
    type: 'composition',
    level: 'free',
    children: CartItemCompositionChild[],
    parent: null,
}

export interface CartItemEditingChildTag {
    label: string,
    name: string,
    category: string | null,
    level: 'editingChild',
    type: 'tag' | 'embedding',
    parent: CartItemEditing,
}

export interface CartItemEditingChildNull {
    label: '无标签',
    type: 'null',
    level: 'editingChild',
    parent: CartItemEditing,
}

export type CartItemEditingChild = CartItemEditingChildTag | CartItemEditingChildNull

export interface CartItemEditing {
    label: '标签替换',
    type: 'editing',
    level: 'free',
    breakpoint: Decimal,
    children: [CartItemEditingChild, CartItemEditingChild],
    parent: null,
}

export interface CartItemAlternateChild {
    label: string,
    name: string,
    category: string | null,
    type: 'tag'|'embedding',
    level: 'alternateChild',
    parent: CartItemAlternate,
}

export interface CartItemAlternate {
    label: '标签轮转',
    type: 'alternate',
    level: 'free',
    children: CartItemAlternateChild[],
    parent: null,
}

export type CartItemComplex = CartItemComposition | CartItemEditing | CartItemAlternate

export type CartItem = CartItemSimple | CartItemPreset | CartItemComplex
export type CartChildItem = CartItemPresetChild | CartItemCompositionChild | CartItemEditingChild | CartItemAlternateChild

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
        content = content
            .replaceAll('(', '\\(').replaceAll(')', '\\)')
            .replaceAll('[', '\\[').replaceAll(']', '\\]')
    } else {
        content = content
            .replaceAll('{', '\\{').replaceAll('}', '\\}')
            .replaceAll('[', '\\[').replaceAll(']', '\\]')
    }
    if (newEmphasis) {
        if (!weight.equals(1)) {
            return `(${content}:${weight.toFixed(3)})`
        }
    } else {
        const oldWeight = weight.log(1.05).toInteger().toNumber()
        if (oldWeight !== 0) {
            return wrapParen(content, oldWeight > 0 ? '{' : '[', Math.abs(oldWeight))
        }
    }
    return content
}

function tagArrayToString(items: CartItem[], newEmphasis: boolean): string {
    return ImmutableOrderedSet.of(...items.reduce((a: string[], t: CartItem): string[] => {
        if (t.type === 'tag' || t.type === 'embedding') {
            a.push(wrapParenByWeight(t.name, t.weight, newEmphasis))
        } else if (t.type === 'preset') {
            return a.concat(t.children.map(n => wrapParenByWeight(n.name, n.weight, newEmphasis)))
        } else if (t.type === 'composition') {
            if (newEmphasis) {
                a.push(t.children.map(n => n.weight.eq(1) ? n.name : `${n.name} :${n.weight.toDecimalPlaces(3).toNumber()}`).join(' AND '))
            } else {
                a.push(t.children.map(n => n.weight.eq(1) ? n.name : `${n.name}:${n.weight.toDecimalPlaces(3).toNumber()}`).join('|'))
            }
        } else if (t.type === 'alternate') {
            if (newEmphasis) {
                a.push(`[${t.children.map(n => n.name).join('|')}]`)
            } else {
                return a.concat(t.children.map(n => n.name))
            }
        } else if (t.type === 'editing') {
            if (newEmphasis) {
                a.push(`[${t.children[0].type !== 'null' ? t.children[0].name : ''}:${t.children[1].type !== 'null' ? t.children[1].name : ''}:${t.breakpoint.toDecimalPlaces(3).toNumber()}]`)
            } else {
                a.push(...t.children.filter((n): n is CartItemEditingChildTag => n.type !== 'null').map(n => n.name))
            }
        }
        return a
    }, [] as string[])).join(', ')
}

function tagNameMapper(n: CartItem): string|string[] {
    switch (n.type) {
        case 'tag':
        case 'embedding':
            return n.name
        case 'preset':
        case 'composition':
        case 'alternate':
            return n.children.map(e => e.name)
        case 'editing':
            return n.children.filter((e): e is CartItemEditingChildTag => e.type === 'tag').map(e => e.name)
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
                const idx = preset
                    .children.findIndex(n => n.type === type && n.name === tagName)
                if (idx !== -1) {
                    // Decompose the preset
                    const decomposedTagArray: CartItemSimple[] = preset.children
                        .filter(n => n.name !== tagName).map(n => ({...n, level: 'free', parent: null}))
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
                    if (child.type === 'tag' || child.type === 'embedding') {
                        if (item.type === 'editing') {
                            item.children.push({level: 'editingChild', type: 'null', label: '无标签', parent: item})
                        } else {
                            ref.splice(i, 1, {...child, level: 'free', parent: null, weight: new Decimal(1)})
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
        ref.push({
            label: `${tagName} - ${tag.meta.name}`,
            type: 'tag',
            name: tagName,
            level: 'free',
            category: tag.meta.category,
            weight,
            parent: null,
        })
        removeRevFn(tagName, 'tag')
        return
    }

    const embedding = embeddingStore.resolve(tagName)
    if (embedding !== null) {
        ref.push({
            label: `[E] ${tagName} - ${embedding.name}`,
            type: 'embedding',
            name: tagName,
            level: 'free',
            category: embedding.category,
            weight,
            parent: null,
        })
        removeRevFn(tagName, 'embedding')
        return
    }

    ref.push({
        label: `${tagName} - (未知)`,
        type: 'tag',
        name: tagName,
        level: 'free',
        category: null,
        weight,
        parent: null,
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
            level: 'free',
            category: presetCategory,
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
                    level: 'presetChild',
                    category: resolved.meta.category,
                    weight: new Decimal(weight),
                    parent: item,
                }
            } else {
                return {
                    label: tag,
                    name: tag,
                    type: 'tag',
                    level: 'presetChild',
                    category: null,
                    weight: new Decimal(weight),
                    parent: item,
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
        negativeTags: (state) => ImmutableSet.of<string>(...state.negative.flatMap(tagNameMapper)),
        positivePresets: (state) => ImmutableSet.of<string>(...state.positive
            .filter((t): t is CartItemPreset => t.type === 'preset').map(({category, name}) => JSON.stringify([category, name]))),
        negativePresets: (state) => ImmutableSet.of<string>(...state.negative
            .filter((t): t is CartItemPreset => t.type === 'preset').map(({category, name}) => JSON.stringify([category, name]))),

    },
    actions: {
        existsPositive(type: 'tag' | 'preset'| 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.positiveTags.includes(name)
            } else if (type === 'preset') {
                return this.positivePresets.includes(JSON.stringify([category, name]))
            }
            return false
        },
        existsNegative(type: 'tag' | 'preset' | 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.negativeTags.includes(name)
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
        removeCartItem(direction: 'positive'|'negative', item: CartItem) {
            this[direction].splice(this[direction].indexOf(item), 1)
        },
        dismissCartItem(direction: 'positive' | 'negative', item: CartItemPreset|CartItemComplex) {
            const children: CartItemSimple[] = item.children
                // @ts-ignore why no filter
                .filter((n): n is Exclude<CartChildItem, CartItemEditingChildNull> => n.type !== 'null')
                .map((n: Exclude<CartChildItem, CartItemEditingChildNull>): CartItemSimple => ({ ...n, level: 'free', parent: null, weight: new Decimal(1) }))
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
                    // console.log('weight', weight)
                    // console.log('match name', name)
                    if (text) {
                        text = text.replaceAll('\\(', '(')
                            .replaceAll('\\)', ')')
                            .replaceAll('\\[', '[')
                            .replaceAll('\\]', ']')
                            .replaceAll('\\{', '{')
                            .replaceAll('\\}', '}')
                            .toLowerCase()
                        // console.log('append', matched)
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
        createMixtureFromTag(direction: 'positive'|'negative', item: CartItemSimple) {
            const idx = this[direction].indexOf(item)
            if (idx !== -1) {
                const composition: CartItemEditing = {
                    level: 'free',
                    type: 'editing',
                    label: '标签替换',
                    breakpoint: new Decimal(0),
                    // @ts-expect-error Circular reference here
                    children: null
                }

                const {children: oldChildren, ...rest}: CartItemSimple&{children?: (CartItemSimple|CartChildItem)[]} = item

                composition.children  = [
                    {...rest, level: 'editingChild', parent: composition},
                    oldChildren ?
                        { ...oldChildren[0], level: 'editingChild', parent: composition }
                        : { level: 'editingChild', type: 'null', label: '无标签', parent: composition },
                ]
                this[direction].splice(idx, 1, composition)
            }
        },
        determineNextSwitchableMixture(item: CartItemComplex) {
            if (item.type === 'editing') {
                const effectiveChildren = item.children.filter((child) => child.type !== 'null')
                if (effectiveChildren.length < 2) return null
                else return 'alternate'
            } else if (item.type === 'alternate') {
                return 'composition'
            } else if (item.type === 'composition') {
                if (item.children.length < 3) {
                    return 'editing'
                } else {
                    return 'alternate'
                }
            }
            return null
        },
        isMixtureSwitchable(item: CartItemComplex, to: 'editing'|'alternate'|'composition'|null = null) {
            if (to === null) {
                return this.determineNextSwitchableMixture(item)
            } else if (to === item.type) {
                return false
            } else if (to === 'editing' && item.type !== 'editing') {
                return item.children.length < 3
            } else if (to === 'alternate' && item.type !== 'alternate' || to === 'composition' && item.type !== 'composition') {
                // @ts-ignore
                const effectiveChildren = item.children.filter((child: CartItemCompositionChild|CartItemEditingChild): child is CartItemCompositionChild|CartItemEditingChildTag => child.type !== 'null')
                return effectiveChildren.length > 1
            } else {
                return false
            }
        },
        switchMixtureType(direction: 'positive'|'negative', item: CartItemComplex, to: 'editing'|'alternate'|'composition'|null = null) {
            const dest = to ?? this.determineNextSwitchableMixture(item)
            if (!dest) return
            const switchable = this.isMixtureSwitchable(item, dest)
            if (switchable) {
                if (dest === 'editing' && item.type !== 'editing') {
                    const newMixture: CartItemEditing = {
                        level: 'free',
                        type: 'editing',
                        label: '标签替换',
                        breakpoint: new Decimal(0),
                        // @ts-expect-error Circular reference here
                        children: null,
                        parent: null,
                    }

                    const children: CartItemEditingChild[] = item.children.map((child): CartItemEditingChildTag => ({
                        label: child.label,
                        name: child.name,
                        category: child.category,
                        type: child.type,
                        level: 'editingChild',
                        parent: newMixture,
                    })).slice(0, 2)
                    if (children.length === 1) {
                        children.push({level: 'editingChild', type: 'null', label: '无标签', parent: newMixture})
                    } else if (children.length !== 2) {
                        throw new Error('Invalid state')
                    }
                    newMixture.children = children as [CartItemEditingChild, CartItemEditingChild]

                    const idx = this[direction].indexOf(item)
                    this[direction].splice(idx, 1, newMixture)
                }
                else if (dest === 'alternate' && item.type !== 'alternate') {
                    const newMixture: CartItemAlternate = {
                        level: 'free',
                        type: 'alternate',
                        label: '标签轮转',
                        // @ts-expect-error Circular reference here
                        children: null,
                    }
                    newMixture.children = item.children
                            // @ts-ignore Stupid Typescript
                            .filter((child): child is CartItemCompositionChild|CartItemEditingChildTag => child.type !== 'null')
                            .map((child: CartItemCompositionChild|CartItemEditingChildTag): CartItemAlternateChild => ({
                                label: child.label,
                                name: child.name,
                                category: child.category,
                                type: child.type,
                                level: 'alternateChild',
                                parent: newMixture,
                            }))

                    const idx = this[direction].indexOf(item)
                    this[direction].splice(idx, 1, newMixture)
                }
                else if (dest === 'composition' && item.type !== 'composition') {
                    const newMixture: CartItemComposition = {
                        level: 'free',
                        type: 'composition',
                        label: '标签混合',
                        // @ts-expect-error Circular reference here
                        children: null,
                    }
                    newMixture.children = item.children
                        // @ts-ignore Stupid Typescript
                        .filter((child): child is CartItemCompositionChild|CartItemEditingChildTag => child.type !== 'null')
                        .map((child: CartItemCompositionChild|CartItemEditingChildTag): CartItemCompositionChild => ({
                            label: child.label,
                            name: child.name,
                            category: child.category,
                            type: child.type,
                            level: 'compositionChild',
                            weight: new Decimal(1),
                            parent: newMixture,
                        }))
                    const idx = this[direction].indexOf(item)
                    this[direction].splice(idx, 1, newMixture)
                }
            }
        },
    }

})
