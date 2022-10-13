import { defineStore } from 'pinia'
// @ts-ignore
import presetData from '../../data/presets.yaml'
import {Presets} from "../datatypes";

export const usePresetStore = defineStore('presets', {
    state: (): Presets => presetData,
    getters: {
        categories: (state) => Object.keys(state.presets),
    },
})
