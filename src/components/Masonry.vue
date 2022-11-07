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
import type Masonry from 'masonry-layout'
import type { Ref } from 'vue'
import {
    onMounted,
    onUnmounted,
    nextTick,
    ref,
    watch,
    toRef,
    provide,
} from 'vue'
import { MasonryReload } from '../injections/masonryReload'
import { debounce } from 'lodash-es'

const props = defineProps<{
    bind: any | null
}>()

const container: Ref<HTMLDivElement | null> = ref(null)
const masonry: Ref<Masonry | null> = ref(null)

if (!import.meta.env.SSR) {
    const reloadLayout = debounce(() => {
        nextTick(() => {
            masonry.value?.reloadItems?.()
            masonry.value?.layout?.()
        })
    }, 50)

    const delayedReloadLayout = debounce(() => {
        nextTick(() => {
            masonry.value?.reloadItems?.()
            masonry.value?.layout?.()
        })
    }, 250)

    const delayedReloadLayoutWrapper = () =>
        setTimeout(() => nextTick(() => delayedReloadLayout()), 250)

    provide(MasonryReload, () => nextTick(delayedReloadLayout))

    onMounted(async () => {
        const Masonry = (await import('masonry-layout')).default
        masonry.value = new Masonry(container.value!, {
            gutter: 20,
            transitionDuration: 0,
            percentPosition: true,
            initLayout: false,
            resize: false,
        })

        window.addEventListener('resize', delayedReloadLayoutWrapper)
        window.addEventListener('orientationchange', delayedReloadLayoutWrapper)
        window.addEventListener('visibilitychange', delayedReloadLayoutWrapper)
        window.addEventListener('focusin', delayedReloadLayoutWrapper)
        reloadLayout()
    })

    onUnmounted(() => {
        window.removeEventListener('resize', delayedReloadLayoutWrapper)
        window.removeEventListener(
            'orientationchange',
            delayedReloadLayoutWrapper
        )
        window.removeEventListener(
            'visibilitychange',
            delayedReloadLayoutWrapper
        )
        window.removeEventListener('focusin', delayedReloadLayoutWrapper)

        masonry.value?.destroy?.()
    })

    watch(toRef(props, 'bind'), () => {
        reloadLayout()
    })
}
</script>

<template>
    <div ref="container" class="masonry">
        <slot />
    </div>
</template>

<style scoped>
.masonry:deep(> *) {
    margin-bottom: 20px;
}
</style>
