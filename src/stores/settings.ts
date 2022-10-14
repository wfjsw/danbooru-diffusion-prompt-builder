import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        showImage: false,
        newEmphasis: true,
    }),
})
