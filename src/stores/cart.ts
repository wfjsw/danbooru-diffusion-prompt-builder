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
        appendPositiveTag(tagName: string) {
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
                    weight: 0,
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

            throw new Error(`Tag ${tagName} does not exist.`)

        },
        removePositiveTag(tagName: string, type: 'tag'|'embedding' = 'tag') {
            const index = this.positive.findIndex((ci: CartItem) => tagName === ci.name && ci.type === type)
            if (index > -1) this.positive.splice(index, 1);
        },
        appendNegativeTag(tagName: string) {
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
                    weight: 0,
                })
                this.removePositiveTag(tagName, 'tag')
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

            throw new Error(`Tag ${tagName} does not exist.`)

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
    }
})
