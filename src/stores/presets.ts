import {defineStore} from 'pinia'
import type {PresetCategories, Presets} from "../datatypes";
import {PresetCategory} from "../datatypes";
import {useSettingsStore} from "./settings";

const presets = import.meta.glob('../../data/presets/**/*.yaml', {import: 'default', eager: true})

const presetData: Presets = {
    presets: Object.values(presets).reduce((a: PresetCategories, p: any) => {
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

export const usePresetStore = defineStore('presets', {
    state: (): Presets => presetData,
    getters: {
        categories: (state) => {
            const settings = useSettingsStore()
            return Object.entries(state.presets)
                .filter(([_, v]) => settings.showRestricted || !v._restricted)
                .map(([k, _]) => k)
        },
    },
    actions: {
        searchPreset(presetName: string, query: string) {
            const settings = useSettingsStore()
            if (!settings.showRestricted && presetData.presets[presetName]._restricted) {
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
