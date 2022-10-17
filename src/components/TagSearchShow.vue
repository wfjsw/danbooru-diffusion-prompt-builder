<script lang="ts" setup>
import {computed} from "vue";
import {ElScrollbar} from "element-plus";
import {useTagStore} from "../stores/tags";
import {useEmbeddingStore} from '../stores/embeddings';
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import type {TagCategory, Embedding} from "../datatypes";
import EmbeddingView from "./EmbeddingView.vue";

const props = defineProps<{
    search: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();
const embeddingStore = useEmbeddingStore();

const filteredTags = computed<TagCategory>(() => tagStore.searchAll(props.search));
const filteredEmbeddings = computed<Embedding[]>(() => embeddingStore.searchAll(props.search));
</script>

<template>
    <h1>搜索结果</h1>
    <ElScrollbar class="scrollable">
        <Masonry :bind="[filteredTags, filteredEmbeddings]">
            <TagView v-for="(meta, tag) in filteredTags" :key="tag" :blur-image="!settingsStore.showImage" :meta="meta"
                     :tag="tag as string"/>
            <EmbeddingView v-for="embed in filteredEmbeddings" :key="embed.prompt" :blur-image="!settingsStore.showImage"
                           :data="embed"/>
        </Masonry>
    </ElScrollbar>
</template>

<style scoped>
.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem);
    overflow-y: auto;
}
</style>
