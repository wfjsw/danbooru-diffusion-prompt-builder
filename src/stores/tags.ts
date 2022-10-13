import { defineStore } from 'pinia'
// @ts-ignore
import tagData from '../../data/tags.yaml'
import {Tags} from "../datatypes";

export const useTagStore = defineStore('tags', {
    state: (): Tags => tagData,
    getters: {
        categories: (state) => Object.keys(state.tags),
    },
    actions: {
        resolve(name: string) {
            for (const categoryTags of Object.values(this.tags)) {
                // search by tags
                if (Object.keys(categoryTags).includes(name)) {
                    return {name, meta: categoryTags[name]}
                }

                // search by alias
                for (const [tagName, tagMeta] of Object.entries(categoryTags)) {
                    const alias = tagMeta?.alias
                    if (Array.isArray(alias)) {
                        if (alias.includes(name)) {
                            return {name: tagName, meta: tagMeta}
                        }
                    }
                }
            }
            return null
        }
    }
})
