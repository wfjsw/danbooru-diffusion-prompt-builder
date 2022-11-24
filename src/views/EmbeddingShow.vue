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
import { useEmbeddingStore } from '../stores/embeddings'
import EmbeddingItem from '../components/EmbeddingItem.vue'
import Masonry from '../components/Masonry.vue'
import { ClientOnly } from '../ClientOnly'
import { useSettingsStore } from '../stores/settings'
import type { Embedding } from '../types/data'
import { ElInput, ElScrollbar } from 'element-plus'

const props = defineProps<{
    category: string[],
}>()

const settingsStore = useSettingsStore()
const embeddingStore = useEmbeddingStore()

const searchTerms = ref('')
const paginationSize = ref(30)
const filteredEmbs = computed<Embedding[]>(() =>
    embeddingStore.searchCategory(props.category, searchTerms.value)
)
const filteredLength = computed(() => filteredEmbs.value.length)
const paginatedEmbs = computed<Embedding[]>(() =>
    filteredEmbs.value.slice(0, paginationSize.value)
)

function loadMore() {
    if (paginationSize.value < filteredLength.value) {
        paginationSize.value += 30
    }
}
</script>

<template>
    <h1>{{ category.join(' > ') }}</h1>
    <ElInput
        v-model="searchTerms"
        :prefix-icon="IconSearch"
        class="search"
        placeholder="搜索" />
    <ElScrollbar>
        <ClientOnly>
            <Masonry
                v-infinite-scroll="loadMore"
                :bind="[paginatedEmbs, settingsStore.showImage]"
                :infinite-scroll-disabled="paginationSize >= filteredLength"
                :infinite-scroll-distance="512"
                :infinite-scroll-delay="10">
                <EmbeddingItem
                    v-for="emb in paginatedEmbs"
                    :key="emb.payloadHash"
                    v-memo="[emb, settingsStore.showImage]"
                    :show-image="settingsStore.showImage"
                    :data="emb" />
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
