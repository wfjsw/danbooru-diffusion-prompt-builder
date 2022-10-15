<script lang="ts" setup>

import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {ElCollapse, ElInput} from "element-plus";
import {usePresetStore} from "../stores/presets";
import PresetView from "./PresetView.vue";
import {PresetCategory} from "../datatypes";

const props = defineProps<{
    category: string
}>();

const presetStore = usePresetStore();

const searchTerms = ref('');

const filteredPresets = computed<PresetCategory>(() => presetStore.searchPreset(props.category, searchTerms.value));
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索"/>
    <ElCollapse accordion>
        <PresetView v-for="(preset, title) in filteredPresets" :category="category" :meta="preset"
                    :title="title as string"/>
    </ElCollapse>
</template>

<style scoped>
.search {
    margin-bottom: 1.5rem;
    padding-right: 1.5rem;
}
</style>
