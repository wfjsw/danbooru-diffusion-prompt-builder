<script setup lang="ts">
import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {useEmbeddingStore} from "../stores/embeddings";
import EmbeddingView from "./EmbeddingView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import type {Embedding} from "../datatypes";
import {ElInput, ElScrollbar} from "element-plus";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const embeddingStore = useEmbeddingStore();

const searchTerms = ref('')

const filteredEmbs = computed<Embedding[]>(() => embeddingStore.searchCategory(props.category, searchTerms.value));
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索"/>
    <ElScrollbar class="scrollable">
        <Masonry :bind="filteredEmbs">
            <EmbeddingView v-for="emb in filteredEmbs" :key="emb.prompt" :blur-image="!settingsStore.showImage"
                     :data="emb"/>
        </Masonry>
    </ElScrollbar>
</template>

<style scoped lang="scss">
.search {
    margin-bottom: 1.5rem;
    padding-right: 1.5rem;
}

.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem - 32px - 1.15rem);
    overflow-y: auto;
}
</style>
