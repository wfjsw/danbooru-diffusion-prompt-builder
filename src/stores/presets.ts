import {defineStore} from 'pinia'
import type {PresetCategoryInfo, Presets, Preset} from '../datatypes'
import {useSettingsStore} from "./settings";

interface PresetFile {
    name: string,
    description: string | null,
    restricted: boolean | null,
    content: PresetFileItem,
}

interface PresetFileItem {
    [key: string]: PresetFileSingleItem,
}

interface PresetFileSingleItem {
    description: string | null,
    content: string[],
    preview: string[] | null,
}

export const usePresetStore = defineStore('presets', {
    state: (): Presets => ({presets: []}),
    getters: {
        loaded: (state) => {
            return state.presets.length > 0;
        },
        categories: (state) => {
            const settings = useSettingsStore()
            return state.presets
                .filter(({restricted}) => settings.showRestricted || !restricted)
                .map(({name}) => name)
        },
        categorySize: (state) => {
            return Object.fromEntries(state.presets.map(({name, content}) => [name, content.length]))
        },
        count: (state) => {
            const settings = useSettingsStore()
            return state.presets
                .filter(v => settings.showRestricted || !v.restricted)
                .map(v => Object.keys(v.content).length)
                .reduce((a, b) => a + b, 0)
        }
    },
    actions: {
        async load() {
            const presets = import.meta.glob<PresetFile>('../../data/presets/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(presets).map(f => f()))
            const presetData: Presets = {
                presets: result.map(v => {
                    return {
                        name: v.name,
                        description: v.description,
                        restricted: v.restricted ?? false,
                        content: Object.entries(v.content).map(([k, v]): Preset =>
                            ({
                                name: k,
                                description: v.description,
                                content: v.content,
                                preview: v.preview,
                            })
                        )
                    }
                })
            }
            this.$patch(presetData)
        },
        searchPreset(presetName: string, query: string) {
            const settings = useSettingsStore()
            const presetCategory = this.presets.find(n => n.name === presetName)
            if (!presetCategory) {
                return [];
            }
            if (!settings.showRestricted && presetCategory.restricted) {
                return [];
            }

            return presetCategory.content
                .filter((meta) => {
                    if (meta.name.includes(query)) return true;
                    if (meta.description?.includes(query)) return true;
                    if (meta.content?.some(a => a.includes(query))) return true;
                    return false;
                })
        }
    }
})
