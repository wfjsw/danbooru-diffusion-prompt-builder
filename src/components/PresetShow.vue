<script setup lang="ts">
// @ts-nocheck
// error TS2322: Type '{ category: string; title: string; meta: Preset; }' is not assignable to type 'IntrinsicAttributes & Partial<{}> & Omit<Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{ category: string; title: string; meta: Preset; blurImage: boolean; }>>> & VNodeProps & AllowedComponentProps & ComponentCustomProps, never>'.
// Property 'blurImage' is missing in type '{ category: string; title: string; meta: Preset; }' but required in type 'Omit<Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{ category: string; title: string; meta: Preset; blurImage: boolean; }>>> & VNodeProps & AllowedComponentProps & ComponentCustomProps, never>'.

import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import { ElCollapse, ElInput } from "element-plus";
import {usePresetStore} from "../stores/presets";
import PresetView from "./PresetView.vue";
import {PresetCategory, TagCategory} from "../datatypes";

const props = defineProps<{
    category: string
}>();

const presetStore = usePresetStore();

const searchTerms = ref('')

const presets = computed<PresetCategory>(() => presetStore.presets[props.category]);

const filteredPresets = computed<PresetCategory>(() => {
    const presetsRepo = presets.value
    return Object.entries(presetsRepo)
        .filter( ([key, meta]) => {
            if (key.includes(searchTerms.value)) return true;
            if (meta.description?.includes(searchTerms.value)) return true;
            if (meta.content?.some(a => a.includes(searchTerms.value))) return true;
            return false;
        }).reduce( (res: PresetCategory, [key, meta]) => (res[key] = meta, res), {} );
})
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" class="search" placeholder="搜索" :prefix-icon="IconSearch" />
    <ElCollapse accordion>
        <PresetView v-for="(preset, title) in filteredPresets" :category="category" :title="title as string" :meta="preset" />
    </ElCollapse>
</template>

<style scoped>
    .search {
        margin-bottom: 1.5rem;
        padding-right: 1.5rem;
    }
</style>
