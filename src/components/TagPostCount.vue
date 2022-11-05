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
import {computed, useCssModule} from 'vue'
import {useTagStore} from '../stores/tags'

const tagStore = useTagStore()
const $style = useCssModule()

const props = defineProps<{
    tag: string
}>()

const rawCount = computed(() => tagStore.tagsPostCount[props.tag] ?? 0)
const humanizedCount = computed(() => {
    if (rawCount.value === 0) {
        return 'N/A'
    } else if (rawCount.value < 10000) {
        return rawCount.value
    } else if (rawCount.value < 10000000) {
        return `${Math.floor(rawCount.value / 1000)}k`
    } else if (rawCount.value < 10000000000) {
        return `${Math.floor(rawCount.value / 1000000)}m`
    } else {
        return `${Math.floor(rawCount.value / 1000000000)}b`
    }
})

const className = computed(() => {
    if (rawCount.value < 100) {
        return [$style.tag_post_count]
    } else if (rawCount.value < 10000) {
        return [$style.tag_post_count, $style.kilo]
    } else if (rawCount.value < 1000000) {
        return [$style.tag_post_count, $style.mil]
    } else {
        return [$style.tag_post_count, $style.bil]
    }
})
</script>

<template>
    <div :class="className">&lt;{{ humanizedCount }}&gt;</div>
</template>

<style lang="scss" module>
    .tag_post_count {
        display: inline-block;
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-weight: 200;
        user-select: none;
    }

    .tag_post_count {
        color: #495057;
        &.kilo {
            color: #997404;
        }
        &.mil {
            color: #984c0c;
        }
        &.bil {
            color: #842029;
        }
    }

    :global(html.dark) .tag_post_count {
        color: #dee2e6;
        &.kilo {
            color: #ffda6a;
        }
        &.mil {
            color: #feb272;
        }
        &.bil {
            color: #ea868f;
        }
    }

</style>
