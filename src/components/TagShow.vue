<script setup lang="ts">
import {computed} from "vue";
import {ElScrollbar} from "element-plus";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const tags = computed(() => tagStore.tags[props.category]);
</script>

<template>
    <h1>{{ category }}</h1>
    <Masonry>
        <TagView v-for="(meta, tag) in tags" :key="tag" :tag="tag" :meta="meta" :blur-image="!settingsStore.showImage"/>
    </Masonry>
</template>

<style scoped>

</style>
