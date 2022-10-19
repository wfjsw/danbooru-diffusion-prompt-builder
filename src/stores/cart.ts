import {Set as ImmutableSet, OrderedSet as ImmutableOrderedSet} from 'immutable'
import {defineStore} from 'pinia'
import {useTagStore} from "./tags";
import {usePresetStore} from "./presets";
import {useSettingsStore} from "./settings";
import {useEmbeddingStore} from "./embeddings";

interface CartChild {
    label: string,
    name: string,
    type: 'child-tag',
}

interface CartItem {
    label: string,
    type: 'tag' | 'preset' | 'embedding',
    name: string,
    category: string | null,
    children: CartChild[] | null,
    weight: number,
}

interface Cart {
    positive: CartItem[],
    negative: CartItem[],
}

function wrapParen(content: string, char: '(' | '{' | '[', length: number) {
    for (let i = 0; i < length; i++) {
        switch (char) {
            case '(':
                content = `(${content})`
                break;
            case '{':
                content = `{${content}}`
                break;
            case '[':
                content = `[${content}]`
                break;
        }
    }
    return content;
}

function wrapParenByWeight(content: string, weight: number, newEmphasis: boolean): string {
    if (newEmphasis) {
        content = content
            .replaceAll('(', '\\(').replaceAll(')', '\\)')
            .replaceAll('[', '\\[').replaceAll(']', '\\]')
    } else {
        content = content
            .replaceAll('{', '\\{').replaceAll('}', '\\}')
            .replaceAll('[', '\\[').replaceAll(']', '\\]')
    }
    if (weight > 0) {
        return wrapParen(content, newEmphasis ? '(' : '{', Math.abs(weight))
    } else if (weight < 0) {
        return wrapParen(content, '[', Math.abs(weight))
    }
    return content;
}

function tagArrayToString(items: CartItem[], newEmphasis: boolean): string {
    return ImmutableOrderedSet.of(...items.reduce((a: string[], t: CartItem): string[] => {
        if (t.type === 'tag' || t.type === 'embedding') {
            a.push(wrapParenByWeight(t.name, t.weight, newEmphasis));
            return a;
        } else if (t.type === 'preset') {
            return a.concat(t.children!.map(n => wrapParenByWeight(n.name, t.weight, newEmphasis)))
        }
        return a;
    }, [] as string[])).join(', ')
}

export const useCartStore = defineStore('cart', {
    state: (): Cart => ({
        positive: [],
        negative: [],
    }),
    getters: {
        positiveToString: (state) => {
            const settingsStore = useSettingsStore();
            return tagArrayToString(state.positive, settingsStore.newEmphasis)
        },
        negativeToString: (state) => {
            const settingsStore = useSettingsStore();
            return tagArrayToString(state.negative, settingsStore.newEmphasis)
        },
        positiveTags: (state) => ImmutableSet.of<string>(...state.positive
            .filter(t => t.type === 'tag' || t.type === 'embedding').map(n => n.name)),
        negativeTags: (state) => ImmutableSet.of<string>(...state.negative
            .filter(t => t.type === 'tag' || t.type === 'embedding').map(n => n.name)),
        positivePresets: (state) => ImmutableSet.of<string>(...state.positive
            .filter(t => t.type === 'preset').map(({category, name}) => `${category}//${name}`)),
        negativePresets: (state) => ImmutableSet.of<string>(...state.negative
            .filter(t => t.type === 'preset').map(({category, name}) => `${category}//${name}`)),

    },
    actions: {
        existsPositive(type: 'tag' | 'preset'| 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.positiveTags.includes(name);
            } else if (type === 'preset') {
                return this.positivePresets.includes(`${category}//${name}`);
            }
            return false
        },
        existsNegative(type: 'tag' | 'preset' | 'embedding', name: string, category: string | null = null) {
            if (type === 'tag' || type === 'embedding') {
                return this.negativeTags.includes(name);
            } else if (type === 'preset') {
                return this.negativePresets.includes(`${category}//${name}`);
            }
            return false
        },
        appendPositiveTag(tagName: string, weight: number = 0) {
            const tagStore = useTagStore();
            const embeddingStore = useEmbeddingStore();

            if (this.existsPositive('tag', tagName)) return
            const tag = tagStore.resolve(tagName)
            if (tag !== null) {
                this.positive.push({
                    label: `${tagName} - ${tag.meta.name}`,
                    type: 'tag',
                    name: tagName,
                    category: null,
                    children: null,
                    weight,
                })
                this.removeNegativeTag(tagName, 'tag')
                return
            }

            const embedding = embeddingStore.resolve(tagName)
            if (embedding !== null) {
                this.positive.push({
                    label: `[E] ${tagName} - ${embedding.name}`,
                    type: 'embedding',
                    name: tagName,
                    category: null,
                    children: null,
                    weight: 0,
                })
                this.removeNegativeTag(tagName, 'embedding')
                return
            }

            this.positive.push({
                label: `${tagName} - (未知)`,
                type: 'tag',
                name: tagName,
                category: null,
                children: null,
                weight: 0,
            })
            this.removeNegativeTag(tagName, 'tag')
            return
            // throw new Error(`Tag ${tagName} does not exist.`)

        },
        removePositiveTag(tagName: string, type: 'tag'|'embedding' = 'tag') {
            const index = this.positive.findIndex((ci: CartItem) => tagName === ci.name && ci.type === type)
            if (index > -1) this.positive.splice(index, 1);
        },
        appendNegativeTag(tagName: string, weight: number = 0) {
            const tagStore = useTagStore();
            const embeddingStore = useEmbeddingStore();

            if (this.existsNegative('tag', tagName)) return
            const tag = tagStore.resolve(tagName)
            if (tag !== null) {
                this.negative.push({
                    label: `${tagName} - ${tag.meta.name}`,
                    type: 'tag',
                    name: tagName,
                    category: null,
                    children: null,
                    weight,
                })
                this.removePositiveTag(tagName, 'tag')
                return
            }

            const embedding = embeddingStore.resolve(tagName)
            if (embedding !== null) {
                this.negative.push({
                    label: `[E] ${tagName} - ${embedding.name}`,
                    type: 'embedding',
                    name: tagName,
                    category: null,
                    children: null,
                    weight: 0,
                })
                this.removePositiveTag(tagName, 'embedding')
                return
            }

            this.negative.push({
                label: `${tagName} - (未知)`,
                type: 'tag',
                name: tagName,
                category: null,
                children: null,
                weight: 0,
            })
            this.removePositiveTag(tagName, 'tag')
            return
            // throw new Error(`Tag ${tagName} does not exist.`)

        },
        removeNegativeTag(tagName: string, type: 'tag'|'embedding' = 'tag') {
            const index = this.negative.findIndex((ci: CartItem) => tagName === ci.name && ci.type === type)
            if (index > -1) this.negative.splice(index, 1);
        },
        appendPositivePreset(presetCategory: string, presetName: string) {
            const tagStore = useTagStore();
            const presetStore = usePresetStore();

            if (this.existsPositive('tag', presetName, presetCategory)) return
            const preset = presetStore.presets[presetCategory][presetName]
            if (preset !== null) {
                this.positive.push({
                    label: `${presetCategory}/${presetName}`,
                    type: 'preset',
                    name: presetName,
                    category: presetCategory,
                    weight: 0,
                    children: preset.content.map((n: string) => {
                        const tag = tagStore.resolve(n)
                        if (tag) {
                            return {
                                label: `${n} - ${tag.meta.name}`,
                                name: n,
                                type: 'child-tag',
                            }
                        } else {
                            return {
                                label: n,
                                name: n,
                                type: 'child-tag',
                            }
                        }
                    }),
                })
                this.removeNegativePreset(presetCategory, presetName)
            } else {
                throw new Error(`Preset ${presetCategory}/${presetName} does not exist.`)
            }
        },
        removePositivePreset(presetCategory: string, presetName: string) {
            const index = this.positive.findIndex((ci: CartItem) =>
                presetCategory === ci.category && presetName === ci.name && ci.type === 'preset')
            if (index > -1) this.positive.splice(index, 1);
        },
        appendNegativePreset(presetCategory: string, presetName: string) {
            const tagStore = useTagStore();
            const presetStore = usePresetStore();

            if (this.existsPositive('tag', presetName, presetCategory)) return
            const preset = presetStore.presets[presetCategory][presetName]
            if (preset !== null) {
                this.negative.push({
                    label: `${presetCategory}/${presetName}`,
                    type: 'preset',
                    name: presetName,
                    category: presetCategory,
                    weight: 0,
                    children: preset.content.map((n: string) => {
                        const tag = tagStore.resolve(n)
                        if (tag) {
                            return {
                                label: `${n} - ${tag.meta.name}`,
                                name: n,
                                type: 'child-tag',
                            }
                        } else {
                            return {
                                label: n,
                                name: n,
                                type: 'child-tag',
                            }
                        }
                    }),
                })
                this.removePositivePreset(presetCategory, presetName)
            } else {
                throw new Error(`Preset ${presetCategory}/${presetName} does not exist.`)
            }
        },
        removeNegativePreset(presetCategory: string, presetName: string) {
            const index = this.negative.findIndex((ci: CartItem) =>
                presetCategory === ci.category && presetName === ci.name && ci.type === 'preset')
            if (index > -1) this.negative.splice(index, 1);
        },
        clear() {
            this.$patch({
                positive: [],
                negative: [],
            })
        },
        import: function (positive: string, negative: string) {
            const settingsStore = useSettingsStore();
            this.clear()
            const run = (text: string, appendFn: (tagName: string, weight: number) => void) => {
                let weight = 0
                const trimmedText = text.trim()
                if (trimmedText === '') return
                const textList = trimmedText
                    .replaceAll('_', ' ').split(/\s*,\s*|\s*，\s*/)
                // console.log('tokens', textList)
                for (const token of textList) {
                    for (const char of token) {
                        if (char === '(') {
                            settingsStore.newEmphasis = true
                            weight += 1;
                        } else if (char === '{') {
                            settingsStore.newEmphasis = false
                            weight += 1;
                        } else if (char === '[') {
                            weight -= 1;
                        } else {
                            break;
                        }
                    }
                    // console.log('weight', weight)
                    const name = token.match(/^[\(\[\{]*(.*?)[\)\]\}]*$/)
                    // console.log('match name', name)
                    if (name) {
                        let matched = name[1]
                        if (matched.endsWith('\\')) {
                            matched += name[name.lastIndexOf(matched) + name.length]
                        }
                        matched = matched.replaceAll('\\(', '(')
                            .replaceAll('\\)', ')')
                            .replaceAll('\\[', '[')
                            .replaceAll('\\]', ']')
                            .replaceAll('\\{', '{')
                            .replaceAll('\\}', '}')
                            .toLowerCase()
                        // console.log('append', matched)
                        appendFn(matched, weight)
                    }
                    const reversed = Array.from(token).reverse()
                    for (let i = 0; i < reversed.length; i++) {
                        const char = reversed[i]
                        const nextChar = reversed[i + 1]
                        if (nextChar !== '\\') {
                            if (char === ')' && nextChar !== '\\') {
                                settingsStore.newEmphasis = true
                                weight -= 1;
                            } else if (char === '}') {
                                settingsStore.newEmphasis = false
                                weight -= 1;
                            } else if (char === ']') {
                                weight += 1;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    // console.log('weight', weight)
                }
            }
            // console.log('import', positive, negative)
            run(positive, this.appendPositiveTag)
            run(negative, this.appendNegativeTag)
        }
    }

})
