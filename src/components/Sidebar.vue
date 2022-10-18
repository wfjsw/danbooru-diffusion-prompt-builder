<script lang="ts" setup>
import {ElIcon, ElMenu, ElMenuItem, ElSubMenu} from "element-plus";
import {Document as IconDocument, Folder as IconFolder, Guide as IconGuide, Picture as IconPicture} from '@element-plus/icons-vue';
import {useTagStore} from "../stores/tags";
import {usePresetStore} from "../stores/presets";
import {useEmbeddingStore} from "../stores/embeddings";

const emit = defineEmits(['select'])

const tagStore = useTagStore();
const presetStore = usePresetStore();
const embeddingStore = useEmbeddingStore();

function select(index: string, indexPath: string[]) {
    emit('select', indexPath)
}
</script>

<template>
    <ElMenu :default-openeds="['tags']" class="borderless pb-2"
            default-active="aboutme" @select="select">
        <ElMenuItem index="aboutme">
            <ElIcon>
                <IconGuide/>
            </ElIcon>
            关于
        </ElMenuItem>

        <ElSubMenu index="tags" v-loading="!tagStore.loaded">
            <template #title>
                <ElIcon>
                    <IconDocument/>
                </ElIcon>
                标签
            </template>
            <ElMenuItem
                v-for="category in tagStore.categories"
                :index="category">
                {{ category }}
            </ElMenuItem>
        </ElSubMenu>

        <ElSubMenu index="presets" v-loading="!presetStore.loaded">
            <template #title>
                <ElIcon>
                    <IconFolder/>
                </ElIcon>
                预设
            </template>
            <ElMenuItem
                v-for="category in presetStore.categories"
                :index="category">
                {{ category }}
            </ElMenuItem>
        </ElSubMenu>

        <ElSubMenu index="embeddings" v-loading="!embeddingStore.loaded">
            <template #title>
                <ElIcon>
                    <IconPicture/>
                </ElIcon>
                精修模型
            </template>
            <ElMenuItem
                v-for="category in embeddingStore.categories"
                :index="category">
                {{ category }}
            </ElMenuItem>
        </ElSubMenu>
    </ElMenu>
</template>

<style scoped>
.borderless {
    border-right: unset;
}

.scrollable {
    height: calc(100vh - 64px);
    overflow-y: auto;
}

.pb-2 {
    padding-bottom: 1.5rem;
}
</style>
