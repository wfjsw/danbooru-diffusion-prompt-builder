<script lang="ts" setup>
import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import {TagCategory} from "../datatypes";
import {ElInput, ElScrollbar} from "element-plus";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const searchTerms = ref('')

const filteredTags = computed<TagCategory>(() => tagStore.searchCategory(props.category, searchTerms.value));
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索"/>
    <ElScrollbar class="scrollable">
        <Masonry :bind="filteredTags">
            <TagView v-for="(meta, tag) in filteredTags" :key="tag" :blur-image="!settingsStore.showImage" :meta="meta"
                     :tag="tag as string"/>
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
