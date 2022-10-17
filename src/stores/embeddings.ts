import {Set as ImmutableSet} from 'immutable';
import {defineStore} from 'pinia'
import type {EmbeddingCategories, Embeddings, Embedding} from "../datatypes";
import {useSettingsStore} from "./settings";

interface EmbeddingFile {
    prompt: string,
    name: string,
    category: string,
    author: string|null,
    description: string|null,
    restricted: boolean|null,
    modelName: string,
    modelHash: string,
    vectorSize: number,
    steps: number,
    payloadHash: string
}

export const useEmbeddingStore = defineStore('embeddings', {
    state: (): Embeddings => ({embeddings: {}}),
    getters: {
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.embeddings)
                .filter(([_, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(([k, _]) => k)
            return filtered.sort()
        },
        allEmbeddings: (state) => {
            const settings = useSettingsStore()

            return ImmutableSet<Embedding>(Object.values(state.embeddings).reduce((a: Embedding[], b) => {
                return a.concat(b.content.filter(n => settings.showRestricted || !n.restricted))
            }, []))
        },
        count: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.embeddings)
                .filter(v => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(v => v.content.length)
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
            const tags = import.meta.glob<EmbeddingFile>('../../data/embeddings/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(tags).map(f => f()))
            const embeddingData: Embeddings = {
                embeddings: result.reduce((a: EmbeddingCategories, p: EmbeddingFile) => {
                    const categoryName = p.category
                    if (!a.hasOwnProperty(categoryName)) {
                        a[categoryName] = {content: []}
                    }
                    a[categoryName].content.push({
                        prompt: p.prompt,
                        name: p.name,
                        author: p.author,
                        description: p.description,
                        restricted: p.restricted ?? false,
                        modelName: p.modelName,
                        modelHash: p.modelHash,
                        vectorSize: p.vectorSize,
                        steps: p.steps,
                        payloadHash: p.payloadHash,
                    })
                    return a;
                }, {}),
            }

            this.$patch(embeddingData)
        },
        resolve(name: string) {
            const prompt = name.slice(0, -7)
            const hash = name.slice(-6)
            const meta = this.allEmbeddings.find(n => n.prompt === prompt && n.payloadHash.slice(0, 6) === hash)
            return meta ?? null
        },
        searchCategory(category: string, query: string): Embedding[] {
            const settings = useSettingsStore()
            if (query === '') return this.embeddings[category].content

            return this.embeddings[category].content
                .filter((n) => {
                    if (!settings.showRestricted && n.restricted) return false;
                    if (n.payloadHash === query) return true;
                    if (n.prompt.includes(query)) return true;
                    if (n.name.includes(query)) return true;
                    if (n.modelName.includes(query)) return true;
                    if (n.modelHash.includes(query)) return true;
                    return false;
                })
                .sort(({prompt: a}, {prompt: b}) => a.localeCompare(b))
        },
        searchAll(query: string, limit: number = 25): Embedding[] {
            const settings = useSettingsStore()
            if (query === '') return []

            return this.allEmbeddings
                .filter((n) => {
                    if (!settings.showRestricted && n.restricted) return false;
                    if (n.payloadHash === query) return true;
                    if (n.prompt.includes(query)) return true;
                    if (n.name.includes(query)) return true;
                    if (n.modelName.includes(query)) return true;
                    if (n.modelHash.includes(query)) return true;
                    return false;
                })
                .slice(0, limit)
                .toArray()
        }
    }
})
