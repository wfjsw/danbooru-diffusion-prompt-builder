<script setup lang="ts">
import {computed, ref} from "vue";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {useTagStore} from "../stores/tags";
import TagView from "./TagView.vue";
import Masonry from "./Masonry.vue";
import {useSettingsStore} from "../stores/settings";
import {TagCategory} from "../datatypes";
import {ElInput} from "element-plus";

const props = defineProps<{
    category: string
}>();

const settingsStore = useSettingsStore();
const tagStore = useTagStore();

const searchTerms = ref('')

const tags = computed<TagCategory>(() => tagStore.tags[props.category]);
const filteredTags = computed<TagCategory>(() => {
    const tagsRepo = tags.value
    return Object.entries(tagsRepo)
        .filter( ([key, meta]) => {
            if (key.includes(searchTerms.value)) return true;
            if (meta.name.includes(searchTerms.value)) return true;
            if (meta.alias?.some(a => a.includes(searchTerms.value))) return true;
            return false;
        }).reduce( (res: TagCategory, [key, meta]) => (res[key] = meta, res), {} );
})
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" class="search" placeholder="搜索" :prefix-icon="IconSearch" />
    <Masonry>
        <TagView v-for="(meta, tag) in filteredTags" :key="tag" :tag="tag as string" :meta="meta" :blur-image="!settingsStore.showImage"/>
    </Masonry>
</template>

<style scoped>
    .search {
        margin-bottom: 1.5rem;
        padding-right: 1.5rem;
    }
</style>
