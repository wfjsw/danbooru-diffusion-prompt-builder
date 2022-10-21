<script lang="ts" setup>
import {type Component, ref} from 'vue'
import {ElAside, ElContainer, ElHeader, ElMain, ElScrollbar} from 'element-plus'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import TagShow from './components/TagShow.vue'
import PresetShow from './components/PresetShow.vue'
import EmbeddingShow from './components/EmbeddingShow.vue'
import AboutMe from './components/AboutMe.vue'
import Cart from './components/Cart.vue'
import BadMobileDialog from './components/BadMobileDialog.vue'
import TagSearchShow from './components/TagSearchShow.vue'
import HypernetworkShow from './components/HypernetworkShow.vue'

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
    'tags': TagShow,
    'presets': PresetShow,
    'embeddings': EmbeddingShow,
    'hypernetworks': HypernetworkShow,
    'aboutme': AboutMe,
}

function switchAsideExpanded(item: 'category' | 'cart' | 'reset') {
    if (asideExpanded.value === item || item === 'reset') {
        asideExpanded.value = null
    } else {
        asideExpanded.value = item
    }
}
</script>

<template>
    <ElContainer>
        <ElHeader class="bottom-bordered flex mobile-thin-padding">
            <TopBar v-model:search="searchTerms"
                    @expand-category="switchAsideExpanded('category')"
                    @expand-cart="switchAsideExpanded('cart')"
            />
        </ElHeader>
        <ElContainer class="p-relative-sm">
            <ElAside :class="['right-bordered', 'category-aside', {'expanded': asideExpanded === 'category'}]"
                     width="256px"
            >
                <ElScrollbar class="body-full-height">
                    <Sidebar @select="changeSelection"/>
                </ElScrollbar>
            </ElAside>
            <ElMain :class="['body-full-height',
                {'left-expanded': asideExpanded === 'category', 'right-expanded': asideExpanded === 'cart'}]"
                @click="switchAsideExpanded('reset')"
            >
                <KeepAlive v-if="searchTerms === null || searchTerms === ''">
                    <component :is="mainComponent[activeSelection[0]]" :category="activeSelection[1]"/>
                </KeepAlive>
                <TagSearchShow v-else :search="searchTerms"/>
            </ElMain>
            <ElAside :class="['left-bordered', 'cart-aside', {'expanded': asideExpanded === 'cart'}]"
                     width="380px">
                <Cart/>
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
    height: calc(100vh - 64px);
    overflow-y: hidden
}

.flex {
    display: flex;
}

.cart-aside {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px);
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
        transform: translateX(-256px);
        transition: transform .3s ease-in-out,margin .3s ease-in-out;
        &.expanded {
            transform: translateX(0);
        }
    }
    .cart-aside {
        position: absolute;
        top: 0;
        right: -380px;
        transform: translateX(0px);
        transition: transform .3s ease-in-out,margin .3s ease-in-out;
        &.expanded {
            transform: translateX(-380px);
        }
    }
    .body-full-height {
        transition: transform .3s ease-in-out,margin .3s ease-in-out;
    }
    .left-expanded {
        transform: translateX(256px);
    }
    .right-expanded {
        transform: translateX(-380px);
    }
}
</style>
