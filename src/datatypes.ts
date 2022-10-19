export interface TagMeta {
    alias: string[] | null,
    name: string,
    description: string | null,
    image: string | null,
    wikiURL: string | null,
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
    preview: string[] | null,
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
    category: string,
    author: string|null,
    description: string|null,
    restricted: boolean|null,
    modelName: string,
    modelHash: string,
    vectorSize: number,
    steps: number,
    payloadHash: string,
    payloadURL: string|null,
    suggestPositive: string[]|null,
    suggestNegative: string[]|null,
}
