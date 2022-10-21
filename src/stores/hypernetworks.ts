import {Set as ImmutableSet} from 'immutable';
import {defineStore} from 'pinia'
import type {HypernetworkCategories, Hypernetworks, Hypernetwork} from "../datatypes";
import {useSettingsStore} from "./settings";

interface HypernetworkFile {
    prompt: string
    name: string,
    category: string,
    author: string|null,
    description: string|null,
    restricted: boolean|null,
    modelName: string,
    modelHash: string,
    steps: number,
    previewHash: string|null,
    payloadURL: string,
    suggestPositive: string[]|null,
    suggestNegative: string[]|null,
}

export const useHypernetworkStore = defineStore('hypernetwork', {
    state: (): Hypernetworks => ({hypernetworks: {}}),
    getters: {
        loaded: (state) => {
            return Object.keys(state.hypernetworks).length > 0;
        },
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.hypernetworks)
                .filter(([_, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(([k, _]) => k)
            return filtered.sort()
        },
        categorySize: (state) => {
            const settings = useSettingsStore()
            return Object.fromEntries(Object.entries(state.hypernetworks)
                .filter(([_, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(([k, v]) => [k, v.content.filter(e => settings.showRestricted || !e.restricted).length]))
        },
        allHypernetworks: (state) => {
            const settings = useSettingsStore()

            return ImmutableSet<Hypernetwork>(Object.values(state.hypernetworks).reduce((a: Hypernetwork[], b) => {
                return a.concat(b.content.filter(n => settings.showRestricted || !n.restricted))
            }, []))
        },
        count: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.hypernetworks)
                .map(v => v.content.filter(e => settings.showRestricted || !e.restricted).length)
                .reduce((a, b) => a + b, 0)
        }
        // allTagCount: (state) => {
        //     const settings = useSettingsStore()
        //     return Object.values(state.tags)
        //         .filter(a => settings.showRestricted || !a._restricted)
        //         .reduce((a, b) => a + Object.values(b).filter(v => settings.showRestricted || !v.restricted).length, 0);
        // },
        // tagWithPhotosCount: (state) => {
        //     const settings = useSettingsStore()
        //     return Object.values(state.tags)
        //         .filter(a => settings.showRestricted || !a._restricted)
        //         .reduce((a, b) => a + Object.values(b).filter((v) => v.image && (settings.showRestricted || !v.restricted)).length, 0);
        // },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<HypernetworkFile>('../../data/hypernetworks/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(tags).map(f => f()))
            const hnData: Hypernetworks = {
                hypernetworks: result.reduce((a: HypernetworkCategories, p: HypernetworkFile) => {
                    const categoryName = p.category
                    if (!a.hasOwnProperty(categoryName)) {
                        a[categoryName] = {content: []}
                    }
                    a[categoryName].content.push({
                        prompt: p.prompt,
                        name: p.name,
                        category: categoryName,
                        author: p.author,
                        description: p.description,
                        restricted: p.restricted ?? false,
                        modelName: p.modelName,
                        modelHash: p.modelHash,
                        steps: p.steps,
                        previewHash: p.previewHash,
                        payloadURL: p.payloadURL,
                        suggestPositive: p.suggestPositive,
                        suggestNegative: p.suggestNegative,
                    })
                    return a;
                }, {}),
            }

            this.$patch(hnData)
        },
        resolve(name: string) {
            const meta = this.allHypernetworks.find(n => n.prompt === name || n.name === name)
            return meta ?? null
        },
        searchCategory(category: string, query: string): Hypernetwork[] {
            const settings = useSettingsStore()
            if (query === '')
                return this.hypernetworks[category].content.filter(n => settings.showRestricted || !n.restricted)

            return this.hypernetworks[category].content
                .filter(n => settings.showRestricted || !n.restricted)
                .map(n => {
                    let score = 0;
                    if (n.prompt.includes(query)) score += 100;
                    if (n.name.includes(query)) score += 50;
                    if (n.modelName.includes(query)) score += 15;
                    if (n.modelHash === query) score += 20;
                    if (n.description?.includes(query)) score += 25;
                    return {...n, score};
                })
                .filter(n => n.score > 0)
                .sort(({score: a}, {score: b}) => b - a)
        },
        searchAll(query: string): (Hypernetwork & {score: number})[] {
            const settings = useSettingsStore()
            if (query === '') return []

            return this.allHypernetworks
                .filter(n => settings.showRestricted || !n.restricted)
                .map((n) => {
                    let score = 0;
                    if (n.prompt.includes(query)) score += 100;
                    if (n.name.includes(query)) score += 50;
                    if (n.modelName.includes(query)) score += 15;
                    if (n.modelHash === query) score += 20;
                    if (n.description?.includes(query)) score += 25;
                    return {...n, score};
                })
                .filter(n => n.score > 0)
                .toArray()
        }
    }
})
