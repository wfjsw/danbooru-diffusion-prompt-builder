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

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search as IconSearch } from '@element-plus/icons-vue'
import { useHypernetworkStore } from '../stores/hypernetworks'
import HypernetworkItem from '../components/HypernetworkItem.vue'
import Masonry from '../components/Masonry.vue'
import { ClientOnly } from '../ClientOnly'
import { useSettingsStore } from '../stores/settings'
import type { Hypernetwork } from '../types/data'
import { ElInput, ElScrollbar } from 'element-plus'

const props = defineProps<{
    category: string[]
}>()

const settingsStore = useSettingsStore()
const hypernetworkStore = useHypernetworkStore()

const searchTerms = ref('')
const paginationSize = ref(30)
const filteredHns = computed<Hypernetwork[]>(() =>
    hypernetworkStore.searchCategory(props.category, searchTerms.value)
)
const filteredLength = computed(() => filteredHns.value.length)
const paginatedHns = computed<Hypernetwork[]>(() =>
    filteredHns.value.slice(0, paginationSize.value)
)

function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 30
    }
}
</script>

<template>
    <h1>{{ category.join(' / ') }}</h1>
    <ElInput
        v-model="searchTerms"
        :prefix-icon="IconSearch"
        class="search"
        placeholder="搜索" />
    <ElScrollbar>
        <ClientOnly>
            <Masonry
                v-infinite-scroll="loadMore"
                :bind="paginatedHns"
                :infinite-scroll-disabled="paginationSize >= filteredLength"
                :infinite-scroll-distance="512"
                :infinite-scroll-delay="10">
                <HypernetworkItem
                    v-for="hns in paginatedHns"
                    :key="`${hns.prompt}-${hns.name}-${hns.author}-${hns.previewHash}`"
                    v-memo="[hns, settingsStore.showImage]"
                    :data="hns" />
            </Masonry>
        </ClientOnly>
    </ElScrollbar>
</template>

<style scoped lang="scss">
.scrollable {
    //height: calc(100vh - 64px - 20px - 10px - 1.17rem - 4rem - 32px - 1.15rem);
    height: 100%;
    overflow-y: auto;
}
</style>
