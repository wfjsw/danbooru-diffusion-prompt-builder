<script lang="ts" setup>
import {computed, watch} from "vue";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import {TagCategory} from "../datatypes";

const props = defineProps<{
    search: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const filteredTags = computed<TagCategory>(() => tagStore.searchAll(props.search));
</script>

<template>
    <h1>搜索结果</h1>
    <Masonry :bind="filteredTags">
        <TagView v-for="(meta, tag) in filteredTags" :key="tag" :blur-image="!settingsStore.showImage" :meta="meta"
                 :tag="tag as string"/>
    </Masonry>
</template>

<style scoped>

</style>
