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
import { computed, ref } from 'vue'
import { Search as IconSearch } from '@element-plus/icons-vue'
import { ElCollapse, ElInput, ElScrollbar } from 'element-plus'
import { usePresetStore } from '../stores/presets'
import PresetItem from '../components/PresetItem.vue'
import type { Preset } from '../types/data'

const props = defineProps<{
    category: string
}>()

const presetStore = usePresetStore()

const searchTerms = ref('')
const paginationSize = ref(30)
const description = computed(
    () =>
        presetStore.presets.find(({ name }) => name === props.category)
            ?.description
)
const filteredPresets = computed<Preset[]>(() =>
    presetStore.searchPreset(props.category, searchTerms.value)
)
const filteredLength = computed(() => filteredPresets.value.length)
const paginatedPresets = computed<Preset[]>(() =>
    filteredPresets.value.slice(0, paginationSize.value)
)
function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 30
    }
}
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput
        v-model="searchTerms"
        :prefix-icon="IconSearch"
        class="search"
        placeholder="搜索" />
    <ElScrollbar>
        <div v-if="description && searchTerms === ''" class="description">
            <p v-for="(paragraph, i) in description.split('\n')" :key="i">
                {{ paragraph }}
            </p>
        </div>
        <ElCollapse
            v-infinite-scroll="loadMore"
            :infinite-scroll-disabled="paginationSize >= filteredLength"
            :infinite-scroll-distance="128"
            :infinite-scroll-delay="10">
            <PresetItem
                v-for="preset in paginatedPresets"
                :key="preset.name"
                v-memo="[preset]"
                :category="category"
                :meta="preset" />
        </ElCollapse>
    </ElScrollbar>
</template>

<style scoped>
.scrollable {
    /*height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem - 32px - 1.15rem);*/
    height: 100%;
    overflow-y: auto;
}

.description {
    line-height: 1.75;
}
</style>
