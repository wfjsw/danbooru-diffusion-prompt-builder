export interface TagMeta {
    alias: string[] | null,
    name: string,
    description: string | null,
    image: string | null,
    wikiUrl: string | null,
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
