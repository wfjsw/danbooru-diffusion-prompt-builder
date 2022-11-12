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

export interface Tag {
    key: string,
    alias: string[] | null
    name: string
    category: string[]
    description: string | null
    image: string | null
    wikiURL: string | null
    restricted: boolean | null
}

export interface Tags {
    tags: Tag[]
    tagsPostCount: Record<string, number>
}

export interface PresetTag {
    tag: string
    weight: number
}

export interface Preset {
    name: string
    categoryInfo: PresetCategoryInfo
    description: string | null
    content: PresetTag[]
    preview: string[] | null
}

export interface PresetCategoryInfo {
    name: string
    category: string[]
    restricted: boolean
    description: string | null
    content: Preset[]
}

export interface Presets {
    presets: PresetCategoryInfo[]
}

export interface Embeddings {
    embeddings: Embedding[]
}

export interface Embedding {
    prompt: string
    name: string
    category: string[]
    author: string | null
    description: string | null
    restricted: boolean | null
    modelName: string
    modelHash: string
    vectorSize: number
    steps: number
    payloadHash: string
    payloadURL: string | null
    suggestPositive: string[] | null
    suggestNegative: string[] | null
}

export interface Hypernetwork {
    prompt: string
    name: string
    category: string[]
    author: string | null
    description: string | null
    restricted: boolean | null
    modelName: string
    modelHash: string
    steps: number
    previewHash: string | null
    payloadURL: string
    suggestPositive: string[] | null
    suggestNegative: string[] | null
}

export interface Hypernetworks {
    hypernetworks: Hypernetwork[]
}

// export type CategoryHierarchy = Record<string, string | CategoryHierarchy>
export interface CategoryHierarchy {
    [key: string]: true | CategoryHierarchy
}
