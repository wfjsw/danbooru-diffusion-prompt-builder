<script setup lang="ts">
import {computed} from "vue";
import {ElScrollbar, ElCollapse} from "element-plus";
import {usePresetStore} from "../stores/presets";
import {useSettingsStore} from "../stores/settings";
import PresetView from "./PresetView.vue";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const presetStore = usePresetStore();

const presets = computed(() => presetStore.presets[props.category]);
</script>

<template>
    <h1>{{ category }}</h1>

    <ElCollapse accordion>
        <PresetView v-for="(preset, title) in presets" :category="category" :title="title" :meta="preset" />
    </ElCollapse>
</template>

<style scoped>

</style>
