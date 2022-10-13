<script lang="ts" setup>
import {ElIcon, ElMenu, ElMenuItem, ElMenuItemGroup, ElScrollbar, ElSubMenu} from "element-plus";
import {Document as IconDocument, Folder as IconFolder, Guide as IconGuide} from '@element-plus/icons-vue';
import {useTagStore} from "../stores/tags";
import {usePresetStore} from "../stores/presets";

const emit = defineEmits(['select'])

const tagStore = useTagStore();
const presetStore = usePresetStore();

function select(index: string, indexPath: string[]) {
    emit('select', indexPath)
}
</script>

<template>
    <ElMenu :default-openeds="['tags', 'presets']" default-active="aboutme" @select="select" class="borderless">
        <ElMenuItem index="aboutme">
            <ElIcon>
                <IconGuide/>
            </ElIcon>
            关于
        </ElMenuItem>

        <ElSubMenu index="tags">
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
        <ElSubMenu index="presets">
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
</style>
