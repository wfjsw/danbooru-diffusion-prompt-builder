export interface TagMeta {
    alias: string[] | null,
    name: string,
    description: string | null,
    image: string | null,
    wikiUrl: string | null,
    restricted: boolean|null,
}

export interface TagCategory {
    [key: string]: TagMeta
}

export interface TagCategories {
    [key: string]: TagCategory
}

export interface Tags {
    tags: TagCategories
}

export interface Preset {
    description: string | null,
    content: string[],
}

export interface PresetCategory {
    [key: string]: Preset
}

export interface PresetCategories {
    [key: string]: PresetCategory
}

export interface Presets {
    presets: PresetCategories
}

export interface Embeddings {
    embeddings: EmbeddingCategories
}

export interface EmbeddingCategories {
    [key: string]: EmbeddingCategory,
}

export interface EmbeddingCategory {
    content: Embedding[],
}

export interface Embedding {
    prompt: string,
    name: string,
    author: string|null,
    description: string|null,
    restricted: boolean|null,
    modelName: string,
    modelHash: string,
    vectorSize: number,
    steps: number,
    payloadHash: string,
    suggestPositive: string[]|null,
    suggestNegative: string[]|null,
}
