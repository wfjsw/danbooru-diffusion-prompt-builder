<script setup lang="ts">
// @ts-nocheck
// error TS2322: Type '{ category: string; title: string; meta: Preset; }' is not assignable to type 'IntrinsicAttributes & Partial<{}> & Omit<Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{ category: string; title: string; meta: Preset; blurImage: boolean; }>>> & VNodeProps & AllowedComponentProps & ComponentCustomProps, never>'.
// Property 'blurImage' is missing in type '{ category: string; title: string; meta: Preset; }' but required in type 'Omit<Readonly<ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{ category: string; title: string; meta: Preset; blurImage: boolean; }>>> & VNodeProps & AllowedComponentProps & ComponentCustomProps, never>'.

import {computed, Ref} from "vue";
import { ElCollapse} from "element-plus";
import {usePresetStore} from "../stores/presets";
import PresetView from "./PresetView.vue";
import {PresetCategory} from "../datatypes";

const props = defineProps<{
    category: string
}>();

const presetStore = usePresetStore();

const presets = computed<PresetCategory>(() => presetStore.presets[props.category]);
</script>

<template>
    <h1>{{ category }}</h1>

    <ElCollapse accordion>
        <PresetView v-for="(preset, title) in presets" :category="category" :title="title as string" :meta="preset" />
    </ElCollapse>
</template>

<style scoped>

</style>
