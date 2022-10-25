<script lang="ts" setup>

import type Masonry from 'masonry-layout';
import type {Ref} from 'vue';
import {onMounted, onUnmounted, nextTick, ref, watch, toRef} from 'vue';
import {debounce} from 'lodash-es';

const props = defineProps<{
    bind: any|null
}>();

const container: Ref<HTMLDivElement | null> = ref(null)
const masonry: Ref<Masonry | null> = ref(null)

if (!import.meta.env.SSR) {
    const reloadLayout = debounce(() => {
        nextTick(() => {
            masonry.value?.reloadItems?.();
            masonry.value?.layout?.();
        })
    }, 50)

    const delayedReloadLayout = debounce(() => {
        nextTick(() => {
            masonry.value?.reloadItems?.();
            masonry.value?.layout?.();
        })
    }, 250)

    const delayedReloadLayoutWrapper = () => delayedReloadLayout()

    onMounted(async () => {
        const Masonry = (await import('masonry-layout')).default;
        masonry.value = new Masonry(container.value!, {
            gutter: 20,
            transitionDuration: 0,
            percentPosition: true,
            initLayout: false,
            resize: false,
        })

        window.addEventListener('resize', delayedReloadLayoutWrapper)
        reloadLayout()
    })

    onUnmounted(() => {
        window.removeEventListener('resize', delayedReloadLayoutWrapper)
        masonry.value?.destroy?.();
    })

    watch(toRef(props, 'bind'), () => {
        reloadLayout()
    })
}
</script>

<template>
    <div ref="container" class="masonry">
        <slot/>
    </div>
</template>

<style scoped>
.masonry:deep(> *) {
    margin-bottom: 15px;
}
</style>
