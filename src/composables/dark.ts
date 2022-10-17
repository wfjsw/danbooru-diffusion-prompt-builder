import {useDark, useToggle, usePreferredDark} from '@vueuse/core'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
