import {Map as ImmutableMap} from 'immutable';
import {defineStore} from 'pinia'
// @ts-ignore
import tagData from '../../data/tags.yaml'
import type {TagCategory, Tags} from "../datatypes";

export const useTagStore = defineStore('tags', {
    state: (): Tags => tagData,
    getters: {
        categories: (state) => Object.keys(state.tags),
        allTags: (state) =>
            ImmutableMap(Object.values(state.tags).reduce((a, b) => {
                for (const [tag, meta] of Object.entries(b)) {
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
    actions: {
        resolve(name: string) {
            const meta = this.allTags.get(name);
            if (meta) {
                return {name: meta.name, meta}
            }
            return null
        },
        searchCategory(category: string, query: string) {
            if (query === '') return this.tags[category]

            return Object.entries(this.tags[category])
                .filter(([key, meta]) => {
                    if (key.includes(query)) return true;
                    if (meta.name.includes(query)) return true;
                    if (meta.alias?.some(a => a.includes(query))) return true;
                    return false;
                }).reduce((res: TagCategory, [key, meta]) => (res[key] = meta, res), {});
        },
        searchAll(query: string) {
            if (query === '') return {}

            return this.allTags
                .filter((meta, key) => {
                    if (key.includes(query)) return true;
                    if (meta.name.includes(query)) return true;
                    if (meta.alias?.some(a => a.includes(query))) return true;
                    return false;
                }).reduce((res: TagCategory, meta, key) => (res[key] = meta, res), {});
        }
    }
})
