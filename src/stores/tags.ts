import {Map as ImmutableMap} from 'immutable'
import {defineStore} from 'pinia'
import type {TagCategories, TagMeta, Tags} from '../datatypes'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'

interface TagFile {
    name: string,
    restricted: boolean|null,
    content: TagFileItem[],
}

interface TagFileItem {
    name: string,
    description: string | null,
    image: string | null,
    wikiURL: string | null,
    alias: string[] | null,
    restricted: boolean|null,
}

const searchCache = new LRU < string, Record<string, TagMeta & { score: number }>>({
    max: 30,
    allowStale: true,
    updateAgeOnGet: true
})

export const useTagStore = defineStore('tags', {
    state: (): Tags => ({tags: {}, tagsPostCount: {}}),
    getters: {
        loaded: (state) => {
            return Object.keys(state.tags).length > 0
        },
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.tags)
                .filter(([, v]) => settings.showRestricted || !v._restricted)
                .map(([k]) => k)
            return filtered.sort()
        },
        categorySize: (state) => {
            return Object.fromEntries(Object.entries(state.tags).map(([k, v]) => [k, Object.keys(v).length]))
        },
        allTags: (state) => {
            const settings = useSettingsStore()

            return ImmutableMap(
                Object.entries(state.tags)
                    .reduce((a: {[key: string]: TagMeta & {category: string}}, [k, b]) => {
                        if (!settings.showRestricted && b._restricted) {
                            return a
                        }
                        for (const [tag, meta] of Object.entries(b)) {
                            if (!settings.showRestricted && meta.restricted) {
                                continue
                            }
                            a[tag] = {...meta, category: k}
                        }
                        return a
                    }, {}
                )
            )
        },
        allTagsWithAlias: (state) => {
            const settings = useSettingsStore()

            return ImmutableMap(
                Object.entries(state.tags)
                    .reduce((a: {[key: string]: TagMeta & {category: string, originalName: string}}, [k, b]) => {
                        if (!settings.showRestricted && b._restricted) {
                            return a
                        }

                        for (const [tag, meta] of Object.entries(b)) {
                            if (!settings.showRestricted && meta.restricted) {
                                continue
                            }

                            a[tag] = {...meta, category: k, originalName: tag}
                            if (meta.alias) {
                                for (const alias of meta.alias) {
                                    a[alias] = {...meta, category: k, originalName: tag}
                                }
                            }
                        }
                        return a
                }, {})
            )
        },
        allTagCount: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.tags)
                .filter(a => settings.showRestricted || !a._restricted)
                .reduce((a, b) => a + Object.values(b).filter(v => settings.showRestricted || !v.restricted).length, 0)
        },
        tagWithPhotosCount: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.tags)
                .filter(a => settings.showRestricted || !a._restricted)
                .reduce((a, b) => a + Object.values(b).filter((v) => v.image && (settings.showRestricted || !v.restricted)).length, 0)
        },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<TagFile>('../../data/tags/**/*.yaml', {import: 'default'})
            const result = await Promise.all(Object.values(tags).map(f => f()))
            const tagsPostCount: Record<string, number> = (await import('../../data/danbooru_tag_post_count.json')).default
            const tagData: Tags = {
                tags: result.reduce((a: TagCategories, p: any) => {
                    const name = p.name.replaceAll('_', ' ').toLowerCase()
                    a[name] = p.content
                    if (p.restricted) {
                        Object.defineProperty(a[name], '_restricted', {
                            configurable: false,
                            enumerable: false,
                            value: true,
                            writable: false
                        })
                    }
                    return a
                }, {}),
                tagsPostCount,
            }

            this.$patch(tagData)
        },
        resolve(name: string) {
            name = name.replaceAll('_', ' ').toLowerCase()
            const meta = this.allTagsWithAlias.get(name)
            if (meta) {
                return {name: meta.originalName, meta}
            }
            return null
        },
        searchCategory(category: string, query: string) {
            const settings = useSettingsStore()
            if (!settings.showRestricted && this.tags[category]._restricted) return {}

            if (query === '') return this.tags[category]

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery.split(/_|\s/).filter(n => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify(['ByCategory', category, normalizedLcQuery])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached
            const result = Object.fromEntries(
                normalizedLcQuery.reduce<[string, TagMeta & {score: number}][]>((a, q) =>
                    a
                    .filter(([, v]) => settings.showRestricted || !v.restricted)
                    .map(([key, meta]): [string, TagMeta & {score: number}] => {
                        let score = meta.score
                        if (key.toLowerCase() === lcQuery) score += 300
                        if (key.toLowerCase().includes(q)) score += 100
                        if (meta.name.toLowerCase() === lcQuery) score += 50
                        if (meta.name.toLowerCase().includes(q)) score += 50
                        if (meta.alias?.some(a => a.toLowerCase() === lcQuery)) score += 90
                        if (meta.alias?.some(a => a.toLowerCase().includes(q))) score += 70
                        if (meta.description?.toLowerCase() === q) score += 40
                        if (meta.description?.toLowerCase().includes(q)) score += 25
                        return [key, {...meta, score}]
                    })
                    .filter(([, v]) => v.score > 0)
                    .sort(([, va], [, vb]) => vb.score - va.score)
                , Object.entries(this.tags[category]).map(([k, v]) => [k, {...v, score: 0}]))
            )
            searchCache.set(cacheKey, result)
            return result
        },
        searchAll(query: string) {
            if (query === '') return {}

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery.split(/_|\s/).filter(n => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify(['Global', normalizedLcQuery])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached
            const result = Object.fromEntries(
                normalizedLcQuery.reduce<[string, TagMeta & {category: string, score: number}][]>((a, q) =>
                    a
                    .map(([key, meta]): [string, TagMeta & {category: string, score: number}] => {
                        let score = meta.score
                        if (key.toLowerCase() === lcQuery) score += 300
                        if (key.toLowerCase().includes(q)) score += 100
                        if (meta.name.toLowerCase() === lcQuery) score += 50
                        if (meta.name.toLowerCase().includes(q)) score += 50
                        if (meta.alias?.some(a => a.toLowerCase() === lcQuery)) score += 90
                        if (meta.alias?.some(a => a.toLowerCase().includes(q))) score += 70
                        if (meta.description?.toLowerCase() === q) score += 40
                        if (meta.description?.toLowerCase().includes(q)) score += 25
                        if (meta.category?.toLowerCase() === q) score += 15
                        if (meta.category?.toLowerCase().includes(q)) score += 7
                        return [key, {...meta, score}]
                    })
                    .filter(([, {score}]) => score > 0)
                    .sort(([, { score: a }], [, { score: b }]) => b - a)
                , this.allTags.toArray().map(([k, v]) => [k, {...v, score: 0}]))
            )
            searchCache.set(cacheKey, result)
            return result
        }
    }
})
