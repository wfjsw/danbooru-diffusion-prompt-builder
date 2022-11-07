/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

const newEmphasis = useLocalStorage('newEmphasis', true)
const showRestricted = useLocalStorage('showRestricted', false)
const useFixedMultiplier = useLocalStorage('useFixedMultiplier', false)

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        showImage: false,
        newEmphasis: newEmphasis,
        showRestricted: showRestricted,
        useFixedMultiplier: useFixedMultiplier,
    }),
})
