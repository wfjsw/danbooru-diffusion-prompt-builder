<script setup lang="ts">
import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {useEmbeddingStore} from "../stores/embeddings";
import EmbeddingView from "./EmbeddingView.vue";
import Masonry from "./Masonry.vue";
import {ClientOnly} from "../ClientOnly";
import {useSettingsStore} from "../stores/settings";
import type {Embedding} from "../datatypes";
import {ElInput, ElScrollbar} from "element-plus";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const embeddingStore = useEmbeddingStore();

const searchTerms = ref('')
const paginationSize = ref(30)
const filteredEmbs = computed<Embedding[]>(() => embeddingStore.searchCategory(props.category, searchTerms.value));
const filteredLength = computed(() => filteredEmbs.value.length);
const paginatedEmbs = computed<Embedding[]>(() => filteredEmbs.value.slice(0, paginationSize.value));

function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 30;
    }
}
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索"/>
    <ElScrollbar class="scrollable">
        <ClientOnly>
            <Masonry :bind="paginatedEmbs" v-infinite-scroll="loadMore" :infinite-scroll-disabled="paginationSize >= filteredLength"
                     :infinite-scroll-distance="512" :infinite-scroll-delay="10">
                <EmbeddingView v-for="emb in paginatedEmbs" :key="emb.payloadHash" v-memo="[emb, settingsStore.showImage]"
                               :blur-image="!settingsStore.showImage" :data="emb"/>
            </Masonry>
        </ClientOnly>
    </ElScrollbar>
</template>

<style scoped lang="scss">
.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem - 32px - 1.15rem);
    overflow-y: auto;
}
</style>
