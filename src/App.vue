<script setup lang="ts">
import type {Component} from 'vue'
import {ref} from 'vue'
import {ElContainer, ElHeader, ElAside, ElMain, ElScrollbar} from "element-plus";
import Sidebar from "./components/Sidebar.vue";
import TopBar from "./components/TopBar.vue";
import TagShow from "./components/TagShow.vue";
import PresetShow from "./components/PresetShow.vue";
import AboutMe from "./components/AboutMe.vue";
import Cart from "./components/Cart.vue";

const activeSelection = ref<string[]>(['aboutme']);

function changeSelection(indexPath: string[]) {
    activeSelection.value = indexPath;
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
            <TopBar/>
        </ElHeader>
        <ElContainer>
            <ElAside width="256px" class="right-bordered">
                <ElScrollbar class="body-scrollable">
                    <Sidebar @select="changeSelection"/>
                </ElScrollbar>
            </ElAside>
            <ElMain>
                <ElScrollbar class="body-scrollable">
                    <component :is="mainComponent[activeSelection[0]]" :category="activeSelection[1]"/>
                </ElScrollbar>
            </ElMain>
            <ElAside class="left-bordered" width="320px">
                <Cart/>
            </ElAside>
        </ElContainer>
    </ElContainer>
</template>

<style scoped lang="scss">
    .bottom-bordered {
        border-bottom: solid 1px var(--el-menu-border-color);
    }
    .left-bordered {
        border-left: solid 1px var(--el-menu-border-color);
    }
    .right-bordered {
        border-right: solid 1px var(--el-menu-border-color);
    }
    .body-scrollable {
        height: calc(100vh - 64px);
        overflow-y: auto;

        :deep(.el-scrollbar__view) {
            margin-bottom: 2.5rem;
        }

    }
</style>
