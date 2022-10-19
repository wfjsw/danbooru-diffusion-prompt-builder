import {Map as ImmutableMap} from 'immutable';
import {defineStore} from 'pinia'
import type {TagCategories, TagMeta, Tags} from "../datatypes";
import {useSettingsStore} from "./settings";

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

export const useTagStore = defineStore('tags', {
    state: (): Tags => ({tags: {}}),
    getters: {
        loaded: (state) => {
            return Object.keys(state.tags).length > 0;
        },
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.tags)
                .filter(([_, v]) => settings.showRestricted || !v._restricted)
                .map(([k, _]) => k)
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
                            return a;
                        }
                        for (const [tag, meta] of Object.entries(b)) {
                            if (!settings.showRestricted && meta.restricted) {
                                continue
                            }
                            a[tag] = {...meta, category: k}
                        }
                        return a;
                    }, {}
                )
            )
        },
        allTagsWithAlias: (state) => {
            const settings = useSettingsStore()

            return ImmutableMap(
                Object.entries(state.tags)
                    .reduce((a: {[key: string]: TagMeta & {category: string}}, [k, b]) => {
                        if (!settings.showRestricted && b._restricted) {
                            return a;
                        }

                        for (const [tag, meta] of Object.entries(b)) {
                            if (!settings.showRestricted && meta.restricted) {
                                continue
                            }

                            a[tag] = {...meta, category: k}
                            if (meta.alias) {
                                for (const alias of meta.alias) {
                                    a[alias] = {...meta, category: k}
                                }
                            }
                        }
                        return a;
                }, {})
            )
        },
        allTagCount: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.tags)
                .filter(a => settings.showRestricted || !a._restricted)
                .reduce((a, b) => a + Object.values(b).filter(v => settings.showRestricted || !v.restricted).length, 0);
        },
        tagWithPhotosCount: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.tags)
                .filter(a => settings.showRestricted || !a._restricted)
                .reduce((a, b) => a + Object.values(b).filter((v) => v.image && (settings.showRestricted || !v.restricted)).length, 0);
        },
    },
    actions: {
        async load() {
            const tags = import.meta.glob<TagFile>('../../data/tags/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(tags).map(f => f()))
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
                    return a;
                }, {}),
            }

            this.$patch(tagData)
        },
        resolve(name: string) {
            name = name.replaceAll('_', ' ').toLowerCase()
            const meta = this.allTagsWithAlias.get(name);
            if (meta) {
                return {name: meta.name, meta}
            }
            return null
        },
        searchCategory(category: string, query: string) {
            const settings = useSettingsStore()
            if (!settings.showRestricted && this.tags[category]._restricted) return {};

            if (query === '') return this.tags[category]

            return Object.fromEntries(
                Object
                    .entries(this.tags[category])
                    .filter(([, v]) => settings.showRestricted || !v.restricted)
                    .map(([key, meta]): [string, TagMeta & {score: number}] => {
                        let score = 0;
                        if (key.includes(query)) score += 100;
                        if (meta.name.includes(query)) score += 50;
                        if (meta.alias?.some(a => a.includes(query))) score += 70;
                        if (meta.description?.includes(query)) score += 25;
                        return [key, {...meta, score}]
                    })
                    .filter(([_, v]) => v.score > 0)
                    .sort(([, va], [, vb]) => vb.score - va.score)
            );
        },
        searchAll(query: string) {
            if (query === '') return {}

            return Object.fromEntries(
                this.allTags
                    .map((meta, key) => {
                        let score = 0;
                        if (key.includes(query)) score += 100;
                        if (meta.name.includes(query)) score += 50;
                        if (meta.alias?.some(a => a.includes(query))) score += 70;
                        if (meta.description?.includes(query)) score += 25;
                        return {...meta, score}
                    })
                    .filter(a => a.score > 0)
                    .sort(({score: a}, {score: b}) => b - a)
            );
        }
    }
})
