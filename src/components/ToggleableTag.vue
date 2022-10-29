<script setup lang="ts">
import {computed} from 'vue'
import {ElTag} from 'element-plus'
import {useTagStore} from '../stores/tags'
import {useCartStore} from '../stores/cart'

const tagStore = useTagStore()
const cartStore = useCartStore()

const props = withDefaults(defineProps<{
    tag: string,
    direction?: 'positive'|'negative'|'both'|null,
    type?: ''|'success'|'warning'|'info'|'danger',
}>(), {
    direction: null,
    type: '',
})

const theme = computed(() => {
    if (props.direction) {
        if (cartStore.existsPositive('tag', props.tag)) {
            return 'success'
        } else if (cartStore.existsNegative('tag', props.tag)) {
            return 'danger'
        } else {
            return ''
        }
    } else {
        return props.type
    }
})

const tagItem = tagStore.resolve(props.tag)

function toggle() {
    if (props.direction === 'positive') {
        if (cartStore.existsPositive('tag', props.tag)) {
            cartStore.removePositiveTag(props.tag, 'tag')
        } else {
            cartStore.appendPositiveTag(props.tag)
        }
    } else if (props.direction === 'negative') {
        if (cartStore.existsNegative('tag', props.tag)) {
            cartStore.removeNegativeTag(props.tag, 'tag')
        } else {
            cartStore.appendNegativeTag(props.tag)
        }
    } else if (props.direction === 'both') {
        if (cartStore.existsPositive('tag', props.tag)) {
            cartStore.appendNegativeTag(props.tag)
        } else if (cartStore.existsNegative('tag', props.tag)) {
            cartStore.removeNegativeTag(props.tag, 'tag')
        } else {
            cartStore.appendPositiveTag(props.tag)
        }
    } else {
        return null
    }
}

</script>

<template>
    <ElTag :class="[$style.color_fix, $style.size_fix, {[$style.pointer]: direction !== null}]" :type="theme"
           @click="toggle()">
        <template v-if="tagItem">
            <span>{{ tag }}</span>
            <span :class="$style.usn"> | </span>
            <span>{{ tagItem.meta.name }}</span>
        </template>
        <template v-else>
            <span>{{ tag }}</span>
        </template>
    </ElTag>
</template>

<style module lang="scss">
.pointer {
    cursor: pointer;
}
.usa {
    user-select: all;
}
.usn {
    user-select: none;
}

.size_fix {
    --el-tag-font-size: 14px;
}

:global(html.dark) .color_fix {
    --el-tag-text-color: #6ea8fe;

    &:global(.el-tag--success) {
        --el-tag-text-color: #75b798;
    }

    &:global(.el-tag--danger) {
        --el-tag-text-color: #ea868f;
    }
}
</style>
