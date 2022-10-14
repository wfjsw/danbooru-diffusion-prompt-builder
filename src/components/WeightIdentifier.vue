<script setup lang="ts">
import {computed} from "vue";
import {useSettingsStore} from "../stores/settings";
const settingsStore = useSettingsStore();

const props = defineProps<{
    weight: number,
}>()

const computedWeight = computed(() => Math.pow(settingsStore.newEmphasis ? 1.1 : 1.05, props.weight).toFixed(2))
const color = computed(() => props.weight >= 0 ? 'success':'warning')
</script>

<template>
    <span v-if="weight !== 0" :class="color">x{{ computedWeight }}</span>
</template>

<style scoped>
.warning {
    color: var(--el-color-warning);
}
.success {
    color: var(--el-color-success);
}
</style>
