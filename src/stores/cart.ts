import { defineStore } from 'pinia'
import {useTagStore} from "./tags";
import {usePresetStore} from "./presets";
import {useSettingsStore} from "./settings";

interface CartChild {
    label: string,
    name: string,
    type: 'child-tag',
}

interface CartItem {
    label: string,
    type: 'tag' | 'preset',
    name: string,
    category: string | null,
    children: CartChild[] | null,
    weight: number,
}

interface Cart {
    positive: CartItem[],
    negative: CartItem[],
}

function wrapParen(content: string, char: '('|'{'|'[', length: number) {
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
    if (weight > 0) {
        return wrapParen(content, newEmphasis ? '(':'{', Math.abs(weight))
    } else if (weight < 0) {
        return wrapParen(content, '[', Math.abs(weight))
    }
    return content;
}

function tagArrayToString(items: CartItem[], newEmphasis: boolean): string {
    return items.reduce((a: string[], t: CartItem): string[] => {
        if (t.type === 'tag') {
            a.push(wrapParenByWeight(t.name, t.weight, newEmphasis));
            return a;
        } else if (t.type === 'preset') {
            return a.concat(t.children!.map(n => wrapParenByWeight(n.name, t.weight, newEmphasis)))
        }
        return a;
    }, [] as string[]).join(', ')
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
        }
    },
    actions: {
        existsPositive(type: 'tag'|'preset', name: string, category: string|null = null) {
            return this.positive.some((ci: CartItem) =>
                name === ci.name && type === ci.type && category === ci.category);
        },
        existsNegative(type: 'tag'|'preset', name: string, category: string|null = null) {
            return this.negative.some((ci: CartItem) =>
                name === ci.name && type === ci.type && category === ci.category);
        },
        appendPositiveTag(tagName: string) {
            const tagStore = useTagStore();

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
                this.removeNegativeTag(tagName)
            } else {
                throw new Error(`Tag ${tagName} does not exist.`)
            }
        },
        removePositiveTag(tagName: string) {
            const index = this.positive.findIndex((ci: CartItem) => tagName === ci.name && ci.type === 'tag')
            if (index > -1) this.positive.splice(index, 1);
        },
        appendNegativeTag(tagName: string) {
            const tagStore = useTagStore();

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
                this.removePositiveTag(tagName)
            } else {
                throw new Error(`Tag ${tagName} does not exist.`)
            }
        },
        removeNegativeTag(tagName: string) {
            const index = this.negative.findIndex((ci: CartItem) => tagName === ci.name && ci.type === 'tag')
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
