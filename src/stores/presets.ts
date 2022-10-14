import {defineStore} from 'pinia'
import type {PresetCategories, Presets} from "../datatypes";

const presets = import.meta.glob('../../data/presets/*.yaml', {import: 'default', eager: true})

const presetData: Presets = {
    presets: Object.values(presets).reduce((a: PresetCategories, p: any) => {
        a[p.name] = p.content
        return a;
    }, {}),
}

export const usePresetStore = defineStore('presets', {
    state: (): Presets => presetData,
    getters: {
        categories: (state) => Object.keys(state.presets),
    },
})
