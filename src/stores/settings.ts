import {defineStore} from 'pinia'
import {useLocalStorage} from '@vueuse/core'

const newEmphasis = useLocalStorage('newEmphasis', true)
const showRestricted = useLocalStorage('showRestricted', false)
const useFixedMultiplier = useLocalStorage('useFixedMultiplier', false)

export const useSettingsStore = defineStore('settings',  {
    state: () => ({
        showImage: false,
        newEmphasis: newEmphasis,
        showRestricted: showRestricted,
        useFixedMultiplier: useFixedMultiplier,
    }),
})
