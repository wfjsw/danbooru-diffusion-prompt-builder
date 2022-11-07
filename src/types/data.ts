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

export interface TagMeta {
    alias: string[] | null
    name: string
    description: string | null
    image: string | null
    wikiURL: string | null
    restricted: boolean | null
}

export interface TagCategory {
    [key: string]: TagMeta
}

export interface TagCategories {
    [key: string]: TagCategory
}

export interface Tags {
    tags: TagCategories
    tagsPostCount: Record<string, number>
}

export interface PresetTag {
    tag: string
    weight: number
}

export interface Preset {
    name: string
    description: string | null
    content: PresetTag[]
    preview: string[] | null
}

export interface PresetCategoryInfo {
    name: string
    restricted: boolean
    description: string | null
    content: Preset[]
}

export interface Presets {
    presets: PresetCategoryInfo[]
}

export interface Embeddings {
    embeddings: EmbeddingCategories
}

export interface EmbeddingCategories {
    [key: string]: EmbeddingCategory
}

export interface EmbeddingCategory {
    content: Embedding[]
}

export interface Embedding {
    prompt: string
    name: string
    category: string
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

export interface Embeddings {
    embeddings: EmbeddingCategories
}

export interface HypernetworkCategories {
    [key: string]: HypernetworkCategory
}

export interface HypernetworkCategory {
    content: Hypernetwork[]
}

export interface Hypernetwork {
    prompt: string
    name: string
    category: string
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
    hypernetworks: HypernetworkCategories
}
