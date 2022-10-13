import { defineStore } from 'pinia'
import {useTagStore} from "./tags";
import {usePresetStore} from "./presets";

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
}

interface Cart {
    positive: CartItem[],
    negative: CartItem[],
}

export const useCartStore = defineStore('cart', {
    state: (): Cart => ({
        positive: [],
        negative: [],
    }),
    getters: {
        positiveToString: (state) => {
            // @ts-ignore
            const tags: string[] = state.positive.reduce((a: string[], t: CartItem) => {
                if (t.type === 'tag') {
                    a.push(t.name);
                    return a;
                } else if (t.type === 'preset') {
                    return a.concat(t.children!.map(n => n.name))
                }
            }, [] as string[])
            return tags.join(', ');
        },
        negativeToString: (state) => {
            // @ts-ignore
            const tags: string[] = state.negative.reduce((a: string[], t: CartItem) => {
                if (t.type === 'tag') {
                    a.push(t.name);
                    return a;
                } else if (t.type === 'preset') {
                    return a.concat(t.children!.map(n => n.name))
                }
            }, [] as string[])
            return tags.join(', ');
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
                })
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
                })
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
