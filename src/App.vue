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
import { type Component, provide, ref, computed } from 'vue'
import {
    ElAside,
    ElContainer,
    ElHeader,
    ElMain,
    ElScrollbar,
} from 'element-plus'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import TagShow from './views/TagShow.vue'
import PresetShow from './views/PresetShow.vue'
import EmbeddingShow from './views/EmbeddingShow.vue'
import AboutMe from './views/AboutMe.vue'
import Cart from './views/Cart.vue'
import TagSearchShow from './views/TagSearchShow.vue'
import HypernetworkShow from './views/HypernetworkShow.vue'
import { setSearch } from './injections/setSearch'

const activeSelection = ref<string[]>(['aboutme'])

const searchTerms = ref('')

function changeSelection(indexPath: string[]) {
    activeSelection.value = indexPath
    searchTerms.value = ''
}

interface ComponentList {
    [key: string]: Component
}

const asideExpanded = ref<'category' | 'cart' | null>(null)

const mainComponent: ComponentList = {
    tags: TagShow,
    presets: PresetShow,
    embeddings: EmbeddingShow,
    hypernetworks: HypernetworkShow,
    aboutme: AboutMe,
}

const category = computed(() => activeSelection.value?.length > 1 ?
    activeSelection.value[activeSelection.value.length - 1].split('/').slice(1)
    : null)

function switchAsideExpanded(item: 'category' | 'cart' | 'reset') {
    if (asideExpanded.value === item || item === 'reset') {
        asideExpanded.value = null
    } else {
        asideExpanded.value = item
    }
}

function setSearchImpl(criteria: string) {
    searchTerms.value = criteria
}

provide(setSearch, setSearchImpl)
</script>

<template>
    <ElContainer class="container-full-height">
        <ElHeader class="bottom-bordered flex mobile-thin-padding">
            <TopBar
                v-model:search="searchTerms"
                @expand-category="switchAsideExpanded('category')"
                @expand-cart="switchAsideExpanded('cart')" />
        </ElHeader>
        <ElContainer class="p-relative-sm body-inner-full-height">
            <ElAside
                :class="[
                    'container-full-height',
                    'right-bordered',
                    'category-aside',
                    { expanded: asideExpanded === 'category' },
                ]"
                width="284px">
                <ElScrollbar class="body-full-height">
                    <Sidebar @select="changeSelection" />
                </ElScrollbar>
            </ElAside>
            <ElMain
                :class="[
                    'main',
                    'body-full-height',
                    {
                        'left-expanded': asideExpanded === 'category',
                        'right-expanded': asideExpanded === 'cart',
                    },
                ]"
                @click="switchAsideExpanded('reset')">
                <KeepAlive v-if="searchTerms === null || searchTerms === ''">
                    <component
                        :is="mainComponent[activeSelection[0]]"
                        :category="category" />
                </KeepAlive>
                <TagSearchShow v-else :search="searchTerms" />
            </ElMain>
            <ElAside
                :class="[
                    'container-full-height',
                    'left-bordered',
                    'cart-aside',
                    { expanded: asideExpanded === 'cart' },
                ]"
                width="375px">
                <Cart />
            </ElAside>
        </ElContainer>
    </ElContainer>
</template>

<style lang="scss" scoped>
.bottom-bordered {
    border-bottom: solid 1px var(--el-menu-border-color);
}

.left-bordered {
    border-left: solid 1px var(--el-menu-border-color);
}

.right-bordered {
    border-right: solid 1px var(--el-menu-border-color);
}

.body-full-height {
    //height: calc(100vh - 64px);
    height: 100%;
    overflow-y: hidden;
}

.main {
    display: flex;
    flex-flow: column;
}

.body-inner-full-height {
    height: calc(100% - 64px);
}

.container-full-height {
    height: 100%;
}

.flex {
    display: flex;
}

.cart-aside {
    display: flex;
    flex-direction: column;
    //height: calc(100vh - 64px);
}

@media screen and (max-width: 768px) {
    .mobile-thin-padding {
        --el-header-padding: 0 5px;
    }
}

@media screen and (max-width: 1024px) {
    .p-relative-sm {
        position: relative;
    }
    .category-aside {
        position: absolute;
        top: 0;
        left: 0;
        transform: translateX(-284px);
        transition: transform 0.3s ease-in-out, margin 0.3s ease-in-out;
        &.expanded {
            transform: translateX(0);
        }
    }
    .cart-aside {
        position: absolute;
        top: 0;
        right: -375px;
        transform: translateX(0px);
        transition: transform 0.3s ease-in-out, margin 0.3s ease-in-out;
        &.expanded {
            transform: translateX(-375px);
        }
    }
    .body-full-height {
        transition: transform 0.3s ease-in-out, margin 0.3s ease-in-out;
    }
    .left-expanded {
        transform: translateX(284px);
    }
    .right-expanded {
        transform: translateX(-375px);
    }
}
</style>
