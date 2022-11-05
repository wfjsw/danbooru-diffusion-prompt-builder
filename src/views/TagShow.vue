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
import {computed, ref, watch, toRef} from 'vue'
import {Search as IconSearch} from '@element-plus/icons-vue'
import {useTagStore} from '../stores/tags'
import TagItem from '../components/TagItem.vue'
import Masonry from '../components/Masonry.vue'
import {ClientOnly} from '../ClientOnly'
import {useSettingsStore} from '../stores/settings'
import type {TagCategory, TagMeta} from '../datatypes'
import {ElInput, ElScrollbar} from 'element-plus'

const props = defineProps<{
    category: string
}>()

const settingsStore = useSettingsStore()
const tagStore = useTagStore()

const scrollRef = ref<typeof ElScrollbar|null>(null)
const searchTerms = ref('')
const paginationSize = ref(20)
const filteredTags = computed<[string, TagMeta][]>(() => tagStore.searchCategory(props.category, searchTerms.value))
const filteredLength = computed(() => filteredTags.value.length)
const paginatedTags = computed<TagCategory>(() =>
    Object.fromEntries(filteredTags.value.slice(0, paginationSize.value)))

function loadMore() {
    paginationSize.value += 20
}

watch(toRef(props, 'category'), () => {
    paginationSize.value = 20
    scrollRef.value?.scrollTo({top: 0})
})
</script>

<template>
    <h1>{{ category }}</h1>
    <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search" placeholder="搜索" />
    <ElScrollbar ref="scrollRef">
        <ClientOnly>
            <Masonry v-infinite-scroll="loadMore" :bind="[paginatedTags, settingsStore.showImage]"
                     :infinite-scroll-disabled="paginationSize >= filteredLength"
                     :infinite-scroll-distance="512" :infinite-scroll-delay="10">
                <TagItem v-for="(meta, tag) in paginatedTags" :key="tag" v-memo="[tag, settingsStore.showImage]"
                         :show-image="settingsStore.showImage" :meta="meta"
                         :tag="tag as string" />
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
