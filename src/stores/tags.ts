/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

import { defineStore } from 'pinia'
import type { Tag, Tags, CategoryHierarchy } from '../types/data'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'
import type { TagFile } from '../types/file'

const searchCache = new LRU<string, (Tag & { score: number })[]>({
    max: 50,
    allowStale: true,
    updateAgeOnGet: true,
})

export const useTagStore = defineStore('tags', {
    state: (): Tags => ({ tags: [], tagsPostCount: {} }),
    getters: {
        loaded: (state) => {
            return state.tags.length > 0
        },
        // categories: (state) => {
        //     const settings = useSettingsStore()
        //     const filtered = new Set(
        //         state.tags
        //             .filter((t) => settings.showRestricted || !t.restricted)
        //             .map((t) => t.category)
        //             .sort((a, b) => a.join('/').localeCompare(b.join('/')))
        //     )
        //     return filtered
        // },
        categoryHierarchy: (state) => {
            const settings = useSettingsStore()
            const dedup: Record<string, boolean> = {}
            const filtered = state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .map(({ category }) => category.join('/'))
                    .filter(e=>!(dedup[e]=e in dedup))
                    .sort()
                    .map(e => e.split('/'))
            const hierarchy: CategoryHierarchy = {}
            for (const categoryList of filtered) {
                let parent = hierarchy
                for (const [i, category] of categoryList.entries()) {
                    if (i === categoryList.length - 1) {
                        parent[category] = true
                    } else {
                        const newParent = parent[category] ?? {}
                        parent[category] ||= newParent
                        if (typeof newParent === 'object') {
                            parent = newParent
                        }
                    }
                }
            }
            return hierarchy
        },
        tagsByCategory: (state): Record<string, Tag[]> => {
            const settings = useSettingsStore()
            return state.tags
                .filter((t) => settings.showRestricted || !t.restricted)
                .group((t) => t.category.join('/'))
        },
        categorySize: (state) => {
            const size: Record<string, number> = {}
            for (const tag of state.tags) {
                const key = tag.category.join('/')
                size[key] = (size[key] ?? 0) + 1
            }
            return size
        },
        allTags: (state) => {
            const settings = useSettingsStore()

            return Object.fromEntries(
                state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .map((t) => [t.key, t])
            )
        },
        allTagsWithAlias: (state) => {
            const settings = useSettingsStore()

            return Object.fromEntries(
                state.tags
                    .filter((t) => settings.showRestricted || !t.restricted)
                    .flatMap((t) => {
                        if (t.alias) {
                            return [[t.key, t], ...t.alias.map((a) => [a, t])]
                        } else {
                            return [[t.key, t]]
                        }
                    })
            )
        },
        allTagCount: (state) => {
            const settings = useSettingsStore()
            return state.tags.filter(
                (t) => settings.showRestricted || !t.restricted
            ).length
        },
        tagWithPhotosCount: (state) => {
            const settings = useSettingsStore()
            return state.tags
                .filter((t) => settings.showRestricted || !t.restricted)
                .filter((t) => t.image).length
        },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<TagFile>(
                '../../data/tags/**/*.yaml',
                { import: 'default' }
            )
            const result = await Promise.all(
                Object.values(tags).map((f) => f())
            )
            const tagsPostCount: Record<string, number> = (
                await import('../../data/danbooru_tag_post_count.json')
            ).default
            const tagData: Tags = {
                tags: result.flatMap((p) => {
                    return Object.entries(p.content).map<Tag>(([k, t]) => {
                        return {
                            ...t,
                            key: k.replaceAll('_', ' ').toLowerCase(),
                            category: [...p.category, p.name],
                            restricted: t.restricted || p.restricted,
                        }
                    })
                }),
                tagsPostCount,
            }

            this.$patch(tagData)
        },
        resolve(name: string) {
            name = name.replaceAll('_', ' ').toLowerCase()
            const meta = this.allTagsWithAlias[name]
            if (meta) {
                return { name: meta.originalName, meta }
            }
            return null
        },
        searchCategory(category: string[], query: string) {
            const settings = useSettingsStore()
            if (!this.tagsByCategory[category.join('/')]) return []

            if (query === '')
                return this.tagsByCategory[category.join('/')].sort(
                    (k1, k2) =>
                        (this.tagsPostCount[k2.key] ?? 0) -
                        (this.tagsPostCount[k1.key] ?? 0)
                )

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery
                .split(/_|\s/)
                .filter((n) => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify([
                'ByCategory',
                category,
                normalizedLcQuery,
            ])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached
            const result = normalizedLcQuery
                .reduce<(Tag & { score: number })[]>(
                    (a, q) =>
                        a
                            .map((meta): Tag & { score: number } => {
                                let score = meta.score
                                if (meta.key.toLowerCase() === lcQuery)
                                    score += 300
                                if (meta.key.toLowerCase().includes(q))
                                    score += 100
                                if (meta.name.toLowerCase() === lcQuery)
                                    score += 50
                                if (meta.name.toLowerCase().includes(q))
                                    score += 50
                                if (
                                    meta.alias?.some(
                                        (a) => a.toLowerCase() === lcQuery
                                    )
                                )
                                    score += 90
                                if (
                                    meta.alias?.some((a) =>
                                        a.toLowerCase().includes(q)
                                    )
                                )
                                    score += 70
                                if (meta.description?.toLowerCase() === q)
                                    score += 40
                                if (meta.description?.toLowerCase().includes(q))
                                    score += 25
                                return { ...meta, score }
                            })
                            .filter((v) => v.score > 0),
                    this.tags
                        .filter(
                            (v) =>
                                v.category.join('/') === category.join('/') &&
                                (settings.showRestricted || !v.restricted)
                        )
                        .map((v) => ({ ...v, score: 0 }))
                )
                .sort((va, vb) => vb.score - va.score)
            searchCache.set(cacheKey, result)
            return result
        },
        searchAll(query: string) {
            const settings = useSettingsStore()
            if (query === '') return []

            const lcQuery = query.toLowerCase()
            const normalizedLcQuery = lcQuery
                .split(/_|\s/)
                .filter((n) => !!n)
                .sort((a, b) => b.length - a.length)
            const cacheKey = JSON.stringify(['Global', normalizedLcQuery])
            const cached = searchCache.get(cacheKey)
            if (cached) return cached
            const result = normalizedLcQuery
                .reduce<(Tag & { score: number })[]>(
                    (a, q) =>
                        a
                            .map((meta): Tag & { score: number } => {
                                let score = meta.score
                                if (meta.key.toLowerCase() === lcQuery)
                                    score += 300
                                if (meta.key.toLowerCase().includes(q))
                                    score += 100
                                if (meta.name.toLowerCase() === lcQuery)
                                    score += 50
                                if (meta.name.toLowerCase().includes(q))
                                    score += 50
                                if (
                                    meta.alias?.some(
                                        (a) => a.toLowerCase() === lcQuery
                                    )
                                )
                                    score += 90
                                if (
                                    meta.alias?.some((a) =>
                                        a.toLowerCase().includes(q)
                                    )
                                )
                                    score += 70
                                if (meta.description?.toLowerCase() === q)
                                    score += 40
                                if (meta.description?.toLowerCase().includes(q))
                                    score += 25
                                if (
                                    meta.category?.some(
                                        (c) => c.toLowerCase() === q
                                    )
                                )
                                    score += 15
                                if (
                                    meta.category?.some((c) =>
                                        c.toLowerCase().includes(q)
                                    )
                                )
                                    score += 7
                                return { ...meta, score }
                            })
                            .filter(({ score }) => score > 0),
                    this.tags
                        .filter((v) => settings.showRestricted || !v.restricted)
                        .map((t) => ({ ...t, score: 0 }))
                )
                .sort(({ score: a }, { score: b }) => b - a)
            searchCache.set(cacheKey, result)
            return result
        },
    },
})
