<script lang="ts" setup>
import Masonry from 'masonry-layout';
import type {Ref} from 'vue';
import {onMounted, onUnmounted, onUpdated, nextTick, ref} from 'vue';

defineProps<{
    bind: any|null
}>();

const container: Ref<HTMLDivElement | null> = ref(null)
const masonry: Ref<Masonry | null> = ref(null)

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
    nextTick(() => {
        masonry.value?.reloadItems?.();
        masonry.value?.layout?.();
    })

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
