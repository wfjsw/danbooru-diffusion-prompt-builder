<script lang="ts" setup>
import Masonry from 'masonry-layout';
import type {Ref} from 'vue';
import {onMounted, onUnmounted, onUpdated, nextTick, ref, watch, toRef} from 'vue';
import {debounce} from 'lodash-es';

const props = defineProps<{
    bind: any|null
}>();

const container: Ref<HTMLDivElement | null> = ref(null)
const masonry: Ref<Masonry | null> = ref(null)

const reloadLayout = debounce(() => {
    nextTick(() => {
        masonry.value?.reloadItems?.();
        masonry.value?.layout?.();
    })
}, 25)


onMounted(() => {
    masonry.value = new Masonry(container.value!, {
        gutter: 20,
        transitionDuration: 0,
        percentPosition: true,
        initLayout: false,
    })
    reloadLayout()
})

onUnmounted(() => {
    masonry.value?.destroy?.();
})

watch(toRef(props, 'bind'), () => {
    nextTick(() => {
        reloadLayout()
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
