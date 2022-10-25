<script lang="ts" setup>
import {computed, ref, watch, toRef} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {ClientOnly} from "../ClientOnly";
import {useSettingsStore} from "../stores/settings";
import type {TagCategory, TagMeta} from "../datatypes";
import {ElInput, ElScrollbar} from "element-plus";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const scrollRef = ref<typeof ElScrollbar|null>(null)
const searchTerms = ref('')
const paginationSize = ref(20)
const filteredTags = computed<[string, TagMeta][]>(() => Object.entries(tagStore.searchCategory(props.category, searchTerms.value)));
const filteredLength = computed(() => filteredTags.value.length);
const paginatedTags = computed<TagCategory>(() =>
    Object.fromEntries(filteredTags.value.slice(0, paginationSize.value)));

function loadMore() {
    paginationSize.value += 20;
}

watch(toRef(props, 'category'), () => {
    paginationSize.value = 20;
    scrollRef.value?.scrollTo({top: 0})
})
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索"/>
    <ElScrollbar class="scrollable" ref="scrollRef">
        <ClientOnly>
            <Masonry :bind="[paginatedTags, settingsStore.showImage]" v-infinite-scroll="loadMore"
                     :infinite-scroll-disabled="paginationSize >= filteredLength"
                     :infinite-scroll-distance="512" :infinite-scroll-delay="10">
                <TagView v-for="(meta, tag) in paginatedTags" v-memo="[tag, settingsStore.showImage]" :key="tag"
                         :show-image="settingsStore.showImage" :meta="meta"
                         :tag="tag as string"/>
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
