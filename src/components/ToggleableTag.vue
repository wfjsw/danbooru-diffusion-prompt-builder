<script setup lang="ts">
import {computed} from "vue";
import {ElTag} from "element-plus";
import {useTagStore} from "../stores/tags";
import {useCartStore} from "../stores/cart";

const tagStore = useTagStore();
const cartStore = useCartStore();

const props = withDefaults(defineProps<{
    tag: string,
    direction?: 'positive'|'negative'|'both'|null,
    type?: ''|'success'|'warning'|'info'|'danger',
}>(), {
    direction: null,
    type: '',
})

const theme = computed(() => {
    if (props.direction === 'positive') {
        if (cartStore.existsPositive('tag', props.tag)) {
            return 'success'
        } else {
            return ''
        }
    } else if (props.direction === 'negative') {
        if (cartStore.existsNegative('tag', props.tag)) {
            return 'danger'
        } else {
            return ''
        }
    } else if (props.direction === 'both') {
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
    <ElTag :class="{'pointer': direction !== null}" @click="toggle()"
           :type="theme">
        <template v-if="tagItem">
            <span class="usa">{{ tag }}</span>
            <span class="usn"> | </span>
            <span class="usa">{{tagItem.meta.name}}</span>
        </template>
        <template v-else>
            <span class="usa">{{ tag }}</span>
        </template>
    </ElTag>
</template>

<style scoped>
.pointer {
    cursor: pointer;
}
.usa {
    user-select: all;
}
.usn {
    user-select: none;
}
</style>
