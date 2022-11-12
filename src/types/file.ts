export interface TagFile {
    name: string
    category: string[]
    restricted: boolean | null
    content: Record<string, TagFileItem>
}

export interface TagFileItem {
    name: string
    description: string | null
    image: string | null
    wikiURL: string | null
    alias: string[] | null
    restricted: boolean | null
}

export interface PresetFile {
    name: string
    category: string[]
    description: string | null
    restricted: boolean | null
    content: PresetFileItem
}

export interface PresetFileItem {
    [key: string]: PresetFileSingleItem
}

export interface PresetFileSingleItem {
    description: string | null
    content: string[]
    preview: string[] | null
}

export interface EmbeddingFile {
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

export interface HypernetworkFile {
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
