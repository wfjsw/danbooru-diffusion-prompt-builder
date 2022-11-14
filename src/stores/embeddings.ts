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
import type { Embeddings, Embedding, CategoryHierarchy } from '../types/data'
import { EmbeddingFile } from '../types/file'
import { useSettingsStore } from './settings'
import LRU from 'lru-cache'

const searchCache = new LRU<string, (Embedding & { score: number })[]>({
    max: 50,
    allowStale: true,
    updateAgeOnGet: true,
})

export const useEmbeddingStore = defineStore('embeddings', {
    state: (): Embeddings => ({ embeddings: [] }),
    getters: {
        loaded: (state) => {
            return Object.keys(state.embeddings).length > 0
        },
        // categories: (state) => {
        //     const settings = useSettingsStore()
        //     const filtered = new Set(
        //         state.embeddings
        //             .filter((t) => settings.showRestricted || !t.restricted)
        //             .map((t) => t.category)
        //             .sort((a, b) => a.join('/').localeCompare(b.join('/')))
        //     )
        //     return filtered
        // },
        categoryHierarchy: (state) => {
            const settings = useSettingsStore()
            const dedup: Record<string, boolean> = {}
            const filtered = state.embeddings
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
        categorySize: (state) => {
            const size: Record<string, number> = {}
            for (const tag of state.embeddings) {
                const key = tag.category.join('/')
                size[key] = (size[key] ?? 0) + 1
            }
            return size
        },
        count: (state) => {
            const settings = useSettingsStore()
            return state.embeddings.filter(
                (t) => settings.showRestricted || !t.restricted
            ).length
        },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<EmbeddingFile>(
                '../../data/embeddings/**/*.yaml',
                { import: 'default' }
            )

            const result = await Promise.all(
                Object.values(tags).map((f) => f())
            )
            const embeddingData: Embeddings = {
                embeddings: result.map<Embedding>((p) => ({
                    prompt: p.prompt,
                    name: p.name,
                    category: p.category,
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
                })),
            }

            this.$patch(embeddingData)
        },
        resolve(name: string) {
            const prompt = name.slice(0, -7)
            const hash = name.slice(-6)
            const meta = this.embeddings.find(
                (n) => n.prompt === prompt && n.payloadHash.slice(0, 6) === hash
            )
            return meta ?? null
        },
        searchCategory(category: string[], query: string): Embedding[] {
            const settings = useSettingsStore()
            if (query === '')
                return this.embeddings.filter(
                    (n) =>
                        n.category.join('/') === category.join('/') &&
                        (settings.showRestricted || !n.restricted)
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
                .reduce<(Embedding & { score: number })[]>(
                    (a, q) =>
                        a
                            .map((n) => {
                                let score = n.score
                                if (n.payloadHash.toLowerCase() === lcQuery)
                                    score += 1000
                                if (n.prompt.toLowerCase() === lcQuery)
                                    score += 100
                                if (n.prompt.toLowerCase().includes(q))
                                    score += 100
                                if (n.name.toLowerCase() === lcQuery)
                                    score += 50
                                if (n.name.toLowerCase().includes(q))
                                    score += 50
                                if (n.modelName.toLowerCase() === lcQuery)
                                    score += 15
                                if (n.modelName.toLowerCase().includes(q))
                                    score += 15
                                if (n.modelHash.toLowerCase() === lcQuery)
                                    score += 20
                                if (n.modelHash.toLowerCase() === q) score += 20
                                if (n.description?.toLowerCase() === q)
                                    score += 40
                                if (n.description?.toLowerCase().includes(q))
                                    score += 25
                                if (n.author?.toLowerCase() === q) score += 40
                                if (n.author?.toLowerCase().includes(q))
                                    score += 20
                                return { ...n, score }
                            })
                            .filter((n) => n.score > 0),
                    this.embeddings
                        .filter(
                            (n) =>
                                n.category.join('/') === category.join('/') &&
                                (settings.showRestricted || !n.restricted)
                        )
                        .map((n) => ({
                            ...n,
                            score: 0,
                        }))
                )
                .sort(({ score: a }, { score: b }) => b - a)

            searchCache.set(cacheKey, result)
            return result
        },
        searchAll(query: string): (Embedding & { score: number })[] {
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
                .reduce<(Embedding & { score: number })[]>(
                    (a, q) =>
                        a
                            .map((n) => {
                                let score = n.score
                                if (n.payloadHash.toLowerCase() === lcQuery)
                                    score += 1000
                                if (n.prompt.toLowerCase() === lcQuery)
                                    score += 100
                                if (n.prompt.toLowerCase().includes(q))
                                    score += 100
                                if (n.name.toLowerCase() === lcQuery)
                                    score += 50
                                if (n.name.toLowerCase().includes(q))
                                    score += 50
                                if (n.modelName.toLowerCase() === q) score += 15
                                if (n.modelName.toLowerCase().includes(q))
                                    score += 15
                                if (n.modelHash.toLowerCase() === q) score += 20
                                if (n.modelHash.toLowerCase() === q) score += 20
                                if (n.description?.toLowerCase() === q)
                                    score += 40
                                if (n.description?.toLowerCase().includes(q))
                                    score += 25
                                if (n.author?.toLowerCase() === q) score += 40
                                if (n.author?.toLowerCase().includes(q))
                                    score += 20
                                if (
                                    n.category?.some(
                                        (n) => n.toLowerCase() === q
                                    )
                                )
                                    score += 15
                                if (
                                    n.category?.some((n) =>
                                        n.toLowerCase().includes(q)
                                    )
                                )
                                    score += 7

                                return { ...n, score }
                            })
                            .filter((n) => n.score > 0),
                    this.embeddings
                        .filter((n) => settings.showRestricted || !n.restricted)
                        .map((n) => ({ ...n, score: 0 }))
                )
                .sort(({ score: a }, { score: b }) => b - a)

            searchCache.set(cacheKey, result)
            return result
        },
    },
})
