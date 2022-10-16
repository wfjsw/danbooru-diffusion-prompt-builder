<script lang="ts" setup>
import Masonry from 'masonry-layout';
import type {Ref} from 'vue';
import {onMounted, onUnmounted, onUpdated, nextTick, ref} from 'vue';
import {debounce} from 'lodash';

defineProps<{
    bind: any|null
}>();

const container: Ref<HTMLDivElement | null> = ref(null)
const masonry: Ref<Masonry | null> = ref(null)

const reloadLayout = debounce(() => {
    console.log('layout reload')
    masonry.value?.reloadItems?.();
    masonry.value?.layout?.();
}, 10)


onMounted(() => {
    masonry.value = new Masonry(container.value!, {
        gutter: 20,
        transitionDuration: 0,
        percentPosition: true,
    })
})

onUnmounted(() => {
    masonry.value?.destroy?.();
})

onUpdated(() => {
    reloadLayout()
})
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
