<script lang="ts" setup>
import {ref, computed, watch, toRef, type Ref} from "vue";
import {ElScrollbar} from "element-plus";
import {useTagStore} from "../stores/tags";
import {useEmbeddingStore} from '../stores/embeddings';
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {ClientOnly} from "../ClientOnly";
import {useSettingsStore} from "../stores/settings";
import type {TagMeta, Embedding} from "../datatypes";
import EmbeddingView from "./EmbeddingView.vue";

const props = defineProps<{
    search: string
}>();

interface SearchResultTag {
    type: 'tag',
    key: string,
    score: number,
    data: [string, TagMeta]
}

interface SearchResultEmbedding {
    type: 'embedding',
    key: string,
    score: number,
    data: Embedding
}

type SearchResult = SearchResultTag | SearchResultEmbedding

const settingsStore = useSettingsStore();
const tagStore = useTagStore();
const embeddingStore = useEmbeddingStore();

const scrollRef: Ref<typeof ElScrollbar|null> = ref(null)
const paginationSize = ref(20)
const filteredTags = computed(() => tagStore.searchAll(props.search));
const filteredEmbeddings = computed(() => embeddingStore.searchAll(props.search));
const combinedResult = computed(() => {
    const resultTag: SearchResult[] = Object.entries(filteredTags.value)
        .map(n => ({type: 'tag', data: n, key: n[0], score: n[1].score}))
    const resultEmbedding: SearchResult[] = filteredEmbeddings.value
        .map(n => ({type: 'embedding', data: n, key: n.payloadHash, score: n.score}))
    return resultTag.concat(resultEmbedding).sort(({score: a}, {score: b}) => b - a)
})
const filteredLength = computed(() => combinedResult.value.length);
const paginatedResult = computed(() => combinedResult.value.slice(0, paginationSize.value))
function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 20;
    }
}
watch(toRef(props, 'search'), () => {
    paginationSize.value = 20;
    scrollRef.value?.scrollTo({top: 0})
})
</script>

<template>
    <h1>搜索结果</h1>
    <ElScrollbar class="scrollable" ref="scrollRef">
        <ClientOnly>
            <Masonry :bind="[filteredTags, filteredEmbeddings]" v-infinite-scroll="loadMore" :infinite-scroll-disabled="paginationSize >= filteredLength"
                     :infinite-scroll-distance="128" :infinite-scroll-delay="10">
                <template v-for="item in paginatedResult" :key="item.key">
                    <TagView v-if="item.type === 'tag'" :blur-image="!settingsStore.showImage"
                             :meta="(item as SearchResultTag).data[1]" :tag="(item as SearchResultTag).data[0]"/>
                    <EmbeddingView v-if="item.type === 'embedding'" :blur-image="!settingsStore.showImage"
                                   :data="(item as SearchResultEmbedding).data" show-category/>
                </template>
            </Masonry>
        </ClientOnly>
    </ElScrollbar>
</template>

<style scoped>
.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem);
    overflow-y: auto;
}
</style>
