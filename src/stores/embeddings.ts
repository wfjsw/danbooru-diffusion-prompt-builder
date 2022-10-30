import {Set as ImmutableSet} from 'immutable'
import {defineStore} from 'pinia'
import type {EmbeddingCategories, Embeddings, Embedding} from '../datatypes'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'

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
    payloadHash: string,
    payloadURL: string|null,
    suggestPositive: string[]|null,
    suggestNegative: string[]|null,
}

const searchCache = new LRU < string, (Embedding & { score: number })[]>({
    max: 30,
    allowStale: true,
    updateAgeOnGet: true
})

export const useEmbeddingStore = defineStore('embeddings', {
    state: (): Embeddings => ({embeddings: {}}),
    getters: {
        loaded: (state) => {
            return Object.keys(state.embeddings).length > 0
        },
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.embeddings)
                .filter(([, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(([k]) => k)
            return filtered.sort()
        },
        categorySize: (state) => {
            const settings = useSettingsStore()
            return Object.fromEntries(Object.entries(state.embeddings)
                .map(([k, v]) => [k, v.content.filter(e => settings.showRestricted || !e.restricted).length]))
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
                    if (!(categoryName in a)) {
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
                        vectorSize: p.vectorSize,
                        steps: p.steps,
                        payloadHash: p.payloadHash,
                        payloadURL: p.payloadURL,
                        suggestPositive: p.suggestPositive,
                        suggestNegative: p.suggestNegative,
                    })
                    return a
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
            if (query === '')
                return this.embeddings[category].content
                    .filter(n => settings.showRestricted || !n.restricted)

            const cacheKey = JSON.stringify(['ByCategory', category, query])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const result = this.embeddings[category].content
                .filter(n => settings.showRestricted || !n.restricted)
                .map(n => {
                    let score = 0
                    if (n.payloadHash === query) score += 1000
                    if (n.prompt === query) score += 100
                    if (n.prompt.includes(query)) score += 100
                    if (n.name === query) score += 50
                    if (n.name.includes(query)) score += 50
                    if (n.modelName === query) score += 15
                    if (n.modelName.includes(query)) score += 15
                    if (n.modelHash === query) score += 20
                    if (n.modelHash === query) score += 20
                    if (n.description === query) score += 40
                    if (n.description?.includes(query)) score += 25
                    if (n.author === query) score += 40
                    if (n.author?.includes(query)) score += 20
                    return {...n, score}
                })
                .filter(n => n.score > 0)
                .sort(({ score: a }, { score: b }) => b - a)

            searchCache.set(cacheKey, result)
            return result
        },
        searchAll(query: string): (Embedding & {score: number})[] {
            const settings = useSettingsStore()
            if (query === '') return []

            const cacheKey = JSON.stringify(['Global', query])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const result = this.allEmbeddings
                .filter(n => settings.showRestricted || !n.restricted)
                .map((n) => {
                    let score = 0
                    if (n.payloadHash === query) score += 1000
                    if (n.prompt.includes(query)) score += 100
                    if (n.name.includes(query)) score += 50
                    if (n.modelName.includes(query)) score += 15
                    if (n.modelHash === query) score += 20
                    if (n.description?.includes(query)) score += 25
                    if (n.author === query) score += 40
                    if (n.author?.includes(query)) score += 20
                    return {...n, score}
                })
                .filter(n => n.score > 0)
                .toArray()
                .sort(({ score: a }, { score: b }) => b - a)
                
            searchCache.set(cacheKey, result)
            return result
        }
    }
})
