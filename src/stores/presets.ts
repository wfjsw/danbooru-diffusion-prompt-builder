import {defineStore} from 'pinia'
import type {PresetCategories, Presets} from "../datatypes";
import {PresetCategory} from "../datatypes";
import {useSettingsStore} from "./settings";

interface PresetFile {
    name: string,
    restricted: boolean|null,
    content: PresetFileItem[],
}

interface PresetFileItem {
    [key: string]: PresetFileSingleItem,
}

interface PresetFileSingleItem {
    name: string,
    description: string | null,
    content: string[],
}

export const usePresetStore = defineStore('presets', {
    state: (): Presets => ({presets: {}}),
    getters: {
        categories: (state) => {
            const settings = useSettingsStore()
            return Object.entries(state.presets)
                .filter(([_, v]) => settings.showRestricted || !v._restricted)
                .map(([k, _]) => k)
        },
        count: (state) => {
            const settings = useSettingsStore()
            return Object.values(state.presets)
                .filter(v => settings.showRestricted || !v._restricted)
                .map(v => Object.keys(v).length)
                .reduce((a, b) => a + b, 0)
        }
    },
    actions: {
        async load() {
            const presets = import.meta.glob<PresetFile>('../../data/presets/**/*.yaml', {import: 'default'})

            const result = await Promise.all(Object.values(presets).map(f => f()))
            const presetData: Presets = {
                presets: result.reduce((a: PresetCategories, p: any) => {
                    a[p.name] = p.content
                    if (p.restricted) {
                        Object.defineProperty(a[p.name], '_restricted', {
                            configurable: false,
                            enumerable: false,
                            value: true,
                            writable: false
                        })
                    }
                    return a;
                }, {}),
            }
            this.$patch(presetData)
        },
        searchPreset(presetName: string, query: string) {
            const settings = useSettingsStore()
            if (!settings.showRestricted && this.presets[presetName]._restricted) {
                return {};
            }

            return Object.entries(this.presets[presetName])
                .filter(([key, meta]) => {
                    if (key.includes(query)) return true;
                    if (meta.description?.includes(query)) return true;
                    if (meta.content?.some(a => a.includes(query))) return true;
                    return false;
                }).reduce((res: PresetCategory, [key, meta]) => (res[key] = meta, res), {});
        }
    }
})
