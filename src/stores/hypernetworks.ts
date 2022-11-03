import {Set as ImmutableSet} from 'immutable'
import {defineStore} from 'pinia'
import type {HypernetworkCategories, Hypernetworks, Hypernetwork} from '../datatypes'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'

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

const searchCache = new LRU < string, (Hypernetwork & { score: number })[]>({
    max: 30,
    allowStale: true,
    updateAgeOnGet: true
})

export const useHypernetworkStore = defineStore('hypernetwork', {
    state: (): Hypernetworks => ({hypernetworks: {}}),
    getters: {
        loaded: (state) => {
            return Object.keys(state.hypernetworks).length > 0
        },
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.hypernetworks)
                .filter(([, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
                .map(([k]) => k)
            return filtered.sort()
        },
        categorySize: (state) => {
            const settings = useSettingsStore()
            return Object.fromEntries(Object.entries(state.hypernetworks)
                .filter(([, v]) => settings.showRestricted || v.content.some((e) => !e.restricted))
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
    },
    actions: {
        async load() {
            const tags = import.meta.glob<HypernetworkFile>('../../data/hypernetworks/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(tags).map(f => f()))
            const hnData: Hypernetworks = {
                hypernetworks: result.reduce((a: HypernetworkCategories, p: HypernetworkFile) => {
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
                        steps: p.steps,
                        previewHash: p.previewHash,
                        payloadURL: p.payloadURL,
                        suggestPositive: p.suggestPositive,
                        suggestNegative: p.suggestNegative,
                    })
                    return a
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

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery.split(/_|\s/).filter(n => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify(['ByCategory', category, normalizedLcQuery])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const result = normalizedLcQuery.reduce<(Hypernetwork & {score: number})[]>((a, q) =>
                a
                .filter(n => settings.showRestricted || !n.restricted)
                .map(n => {
                    let score = n.score
                    if (n.prompt.toLowerCase() === lcQuery) score += 100
                    if (n.prompt.toLowerCase().includes(q)) score += 100
                    if (n.name.toLowerCase() === lcQuery) score += 50
                    if (n.name.toLowerCase().includes(q)) score += 50
                    if (n.modelName.toLowerCase() === q) score += 15
                    if (n.modelName.toLowerCase().includes(q)) score += 15
                    if (n.modelHash.toLowerCase() === q) score += 20
                    if (n.modelHash.toLowerCase() === q) score += 20
                    if (n.description?.toLowerCase() === q) score += 40
                    if (n.description?.toLowerCase().includes(q)) score += 25
                    if (n.author?.toLowerCase() === q) score += 40
                    if (n.author?.toLowerCase().includes(q)) score += 20
                    return {...n, score}
                })
                .filter(n => n.score > 0)
                .sort(({ score: a }, { score: b }) => b - a)
            , this.hypernetworks[category].content.map(n => ({...n, score: 0})))
            searchCache.set(cacheKey, result)
            return result
        },
        searchAll(query: string): (Hypernetwork & {score: number})[] {
            const settings = useSettingsStore()
            if (query === '') return []

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery.split(/_|\s/).filter(n => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify(['Global', normalizedLcQuery])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached

            const result = normalizedLcQuery.reduce<(Hypernetwork & {score: number})[]>((a, q) =>
                a
                .filter(n => settings.showRestricted || !n.restricted)
                .map((n) => {
                    let score = 0
                    if (n.prompt.toLowerCase() === lcQuery) score += 100
                    if (n.prompt.toLowerCase().includes(q)) score += 100
                    if (n.name.toLowerCase() === lcQuery) score += 50
                    if (n.name.toLowerCase().includes(q)) score += 50
                    if (n.modelName.toLowerCase() === q) score += 15
                    if (n.modelName.toLowerCase().includes(q)) score += 15
                    if (n.modelHash.toLowerCase() === q) score += 20
                    if (n.modelHash.toLowerCase() === q) score += 20
                    if (n.description?.toLowerCase() === q) score += 40
                    if (n.description?.toLowerCase().includes(q)) score += 25
                    if (n.author?.toLowerCase() === q) score += 40
                    if (n.author?.toLowerCase().includes(q)) score += 20
                    if (n.category?.toLowerCase() === q) score += 12
                    if (n.category?.toLowerCase().includes(q)) score += 5

                    return {...n, score}
                })
                .filter(n => n.score > 0)
                .sort(({ score: a }, { score: b }) => b - a)
            , this.allHypernetworks.toArray().map(n => ({...n, score: 0})))
            searchCache.set(cacheKey, result)
            return result
        }
    }
})
