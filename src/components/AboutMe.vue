<script lang="ts" setup>
import {useTagStore} from "../stores/tags";

defineProps<{
    category: undefined
}>()

const tagStore = useTagStore();

</script>

<template>
    <h1>关于</h1>
    <p>这是一个用于构建 Danbooru 标签组合的网站。</p>
    <p>目前共收录 {{ tagStore.allTagCount }} 个标签，共 {{ tagStore.tagWithPhotosCount }} 个标签有配图。</p>
</template>

<style scoped>

</style>
