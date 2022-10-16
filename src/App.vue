<script lang="ts" setup>
import type {Component} from 'vue'
import {ref} from 'vue'
import {ElAside, ElContainer, ElHeader, ElMain, ElScrollbar} from "element-plus";
import Sidebar from "./components/Sidebar.vue";
import TopBar from "./components/TopBar.vue";
import TagShow from "./components/TagShow.vue";
import PresetShow from "./components/PresetShow.vue";
import AboutMe from "./components/AboutMe.vue";
import Cart from "./components/Cart.vue";
import BadMobileDialog from "./components/BadMobileDialog.vue";
import TagSearchShow from "./components/TagSearchShow.vue";

const activeSelection = ref<string[]>(['aboutme']);

const searchTerms = ref('');

function changeSelection(indexPath: string[]) {
    activeSelection.value = indexPath;
    searchTerms.value = '';
}

interface ComponentList {
    [key: string]: Component
}

const mainComponent: ComponentList = {
    'tags': TagShow,
    'presets': PresetShow,
    'aboutme': AboutMe,
}
</script>

<template>
    <ElContainer>
        <ElHeader class="bottom-bordered">
            <TopBar v-model:search="searchTerms"/>
        </ElHeader>
        <ElContainer>
            <ElAside class="right-bordered" width="256px">
                <ElScrollbar class="body-scrollable">
                    <Sidebar @select="changeSelection"/>
                </ElScrollbar>
            </ElAside>
            <ElMain class="body-full-height">
                <KeepAlive v-if="searchTerms === null || searchTerms === ''">
                    <component :is="mainComponent[activeSelection[0]]" :category="activeSelection[1]"/>
                </KeepAlive>
                <TagSearchShow v-else :search="searchTerms"/>
            </ElMain>
            <ElAside class="left-bordered" width="380px">
                <Cart/>
            </ElAside>
        </ElContainer>
    </ElContainer>
    <BadMobileDialog/>
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
</style>
