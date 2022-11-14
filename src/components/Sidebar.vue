<!------------------------------------------------------------------------------
  - Danbooru Diffusion Prompt Builder
  - Copyright (C) 2022  Jabasukuriputo Wang
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -
  ----------------------------------------------------------------------------->

<script lang="ts" setup>
import { ElIcon, ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'
import {
    Document as IconDocument,
    Folder as IconFolder,
    Guide as IconGuide,
    Picture as IconPicture,
    Box as IconBox,
} from '@element-plus/icons-vue'
import { useTagStore } from '../stores/tags'
import { usePresetStore } from '../stores/presets'
import { useEmbeddingStore } from '../stores/embeddings'
import { useHypernetworkStore } from '../stores/hypernetworks'
import ExtLinks from './ExtLinks.vue'
import SidebarItem from './SidebarItem.vue'

const emit = defineEmits(['select'])

const tagStore = useTagStore()
const presetStore = usePresetStore()
const embeddingStore = useEmbeddingStore()
const hypernetworkStore = useHypernetworkStore()

function select(index: string, indexPath: string[]) {
    emit('select', indexPath)
}
</script>

<template>
    <div class="mobile-topbar-el">
        <ExtLinks />
    </div>
    <ElMenu
        :default-openeds="['tags']"
        class="borderless pb-2 fw"
        default-active="aboutme"
        @select="select">
        <ElMenuItem index="aboutme">
            <ElIcon>
                <IconGuide />
            </ElIcon>
            关于
        </ElMenuItem>

        <ElSubMenu v-loading="!tagStore.loaded" index="tags">
            <template #title>
                <ElIcon>
                    <IconDocument />
                </ElIcon>
                标签
            </template>
            <SidebarItem type="tags"
                :hierarchy="tagStore.categoryHierarchy"
                :category-size="tagStore.categorySize" />
        </ElSubMenu>

        <ElSubMenu v-loading="!presetStore.loaded" index="presets">
            <template #title>
                <ElIcon>
                    <IconFolder />
                </ElIcon>
                预设
            </template>
            <SidebarItem type="presets"
                :hierarchy="presetStore.categoryHierarchy"
                :category-size="presetStore.categorySize" />
        </ElSubMenu>

        <ElSubMenu v-loading="!embeddingStore.loaded" index="embeddings">
            <template #title>
                <ElIcon>
                    <IconPicture />
                </ElIcon>
                嵌入模型
            </template>
            <SidebarItem type="embeddings"
                :hierarchy="embeddingStore.categoryHierarchy"
                :category-size="embeddingStore.categorySize" />
        </ElSubMenu>

        <ElSubMenu v-loading="!hypernetworkStore.loaded" index="hypernetworks">
            <template #title>
                <ElIcon>
                    <IconBox />
                </ElIcon>
                超网络模型
            </template>
            <SidebarItem type="hypernetworks"
                :hierarchy="hypernetworkStore.categoryHierarchy"
                :category-size="hypernetworkStore.categorySize" />
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
