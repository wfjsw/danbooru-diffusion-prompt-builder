import {Map as ImmutableMap} from 'immutable';
import {defineStore} from 'pinia'
import type {TagCategories, TagCategory, Tags} from "../datatypes";
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
    wikiUrl: string | null,
    alias: string[] | null,
    restricted: boolean|null,
}

export const useTagStore = defineStore('tags', {
    state: (): Tags => ({tags: {}}),
    getters: {
        categories: (state) => {
            const settings = useSettingsStore()
            const filtered = Object.entries(state.tags)
                .filter(([_, v]) => settings.showRestricted || !v._restricted)
                .map(([k, _]) => k)
            return filtered.sort()
        },
        allTags: (state) => {
            const settings = useSettingsStore()

            return ImmutableMap(Object.values(state.tags).reduce((a, b) => {
                if (!settings.showRestricted && b._restricted) {
                    return a;
                }
                for (const [tag, meta] of Object.entries(b)) {
                    if (!settings.showRestricted && meta.restricted) {
                        continue
                    }
                    a[tag] = meta
                }
                return a;
            }, {}))
        },
        allTagsWithAlias: (state) => {
            const settings = useSettingsStore()

            return ImmutableMap(Object.values(state.tags).reduce((a, b) => {
                if (!settings.showRestricted && b._restricted) {
                    return a;
                }

                for (const [tag, meta] of Object.entries(b)) {
                    if (!settings.showRestricted && meta.restricted) {
                        continue
                    }

                    a[tag] = meta
                    if (meta.alias) {
                        for (const alias of meta.alias) {
                            a[alias] = meta
                        }
                    }
                }
                return a;
            }, {}))
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

            return Object.entries(this.tags[category])
                .filter(([key, meta]) => {
                    if (!settings.showRestricted && meta.restricted) return false;
                    if (key.includes(query)) return true;
                    if (meta.name.includes(query)) return true;
                    if (meta.alias?.some(a => a.includes(query))) return true;
                    return false;
                })
                .sort(([a], [b]) => a.localeCompare(b))
                .reduce((res: TagCategory, [key, meta]) => (res[key] = meta, res), {});
        },
        searchAll(query: string, limit: number = 25) {
            if (query === '') return {}

            return this.allTags
                .filter((meta, key) => {
                    if (key.includes(query)) return true;
                    if (meta.name.includes(query)) return true;
                    if (meta.alias?.some(a => a.includes(query))) return true;
                    return false;
                })
                .slice(0, limit)
                .reduce((res: TagCategory, meta, key) => (res[key] = meta, res), {});
        }
    }
})
