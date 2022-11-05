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

import {defineStore} from 'pinia'
import type {Presets, Preset} from '../datatypes'
import {useSettingsStore} from './settings'

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
            return state.presets.length > 0
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
                        content: Object.entries(v.content).map(([k, vs]): Preset =>
                            ({
                                name: k,
                                description: vs.description,
                                content: vs.content.map(vt => {
                                    const [tag, weight] = vt.split('|')
                                    return {tag, weight: weight ? parseFloat(weight) : 1}
                                }),
                                preview: vs.preview,
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
                return []
            }
            if (!settings.showRestricted && presetCategory.restricted) {
                return []
            }

            const normalizedLcQuery = query.toLowerCase().split(/_|\s/).filter(n => !!n)
                .sort((a, b) => b.length - a.length)

            return normalizedLcQuery.reduce((a, q) => a
                .filter((meta) => {
                    if (meta.name.toLowerCase().includes(q)) return true
                    if (meta.description?.toLowerCase().includes(q)) return true
                    if (meta.content?.some(a => a.tag.toLowerCase().includes(q))) return true
                    return false
                }), presetCategory.content)
        }
    }
})
