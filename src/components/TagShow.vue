<script setup lang="ts">
import {computed, Ref} from "vue";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import {TagCategory} from "../datatypes";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const tags = computed<TagCategory>(() => tagStore.tags[props.category]);
</script>

<template>
    <h1>{{ category }}</h1>
    <Masonry>
        <TagView v-for="(meta, tag) in tags" :key="tag" :tag="tag as string" :meta="meta" :blur-image="!settingsStore.showImage"/>
    </Masonry>
</template>

<style scoped>

</style>
