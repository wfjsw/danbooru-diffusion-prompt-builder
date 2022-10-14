<script lang="ts" setup>
import {ElButton, ElCollapseItem, ElTag, ElTooltip} from "element-plus";
import {Preset} from "../datatypes";
import {computed, ref} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
// @ts-ignore
import {faClipboard, faThumbsDown, faThumbsUp} from "@fortawesome/pro-light-svg-icons";
import {useCartStore} from "../stores/cart";

const props = defineProps<{
    category: string,
    title: string,
    meta: Preset,
    // blurImage: boolean,
}>()
const cartStore = useCartStore();

const copyHintVisible = ref(false)

const inPositive = computed(() => cartStore.existsPositive('preset', props.title, props.category))
const inNegative = computed(() => cartStore.existsNegative('preset', props.title, props.category))

async function copyToClipboard() {
    await window.navigator.clipboard.writeText(props.meta.content.join(', '))
    copyHintVisible.value = true
    setTimeout(() => copyHintVisible.value = false, 1000)
}

function togglePositive() {
    if (!inPositive.value) {
        cartStore.appendPositivePreset(props.category, props.title)
    } else {
        cartStore.removePositivePreset(props.category, props.title)
    }
}

function toggleNegative() {
    if (!inNegative.value) {
        cartStore.appendNegativePreset(props.category, props.title)
    } else {
        cartStore.removeNegativePreset(props.category, props.title)
    }
}
</script>

<template>
    <ElCollapseItem>
        <template #title>
            <div class="title-container">
                <div class="title">{{ title }}</div>
                <div class="buttons">
                    <ElTooltip :visible="copyHintVisible">
                        <template #content>
                            <span>已复制到剪贴板</span>
                        </template>
                        <ElButton circle type="primary" @click.stop="copyToClipboard">
                            <FontAwesomeIcon :icon="faClipboard"/>
                        </ElButton>
                    </ElTooltip>
                    <ElButton :type="inPositive ? 'success' : 'default'" circle @click.stop="togglePositive">
                        <FontAwesomeIcon :icon="faThumbsUp"/>
                    </ElButton>
                    <ElButton :type="inNegative ? 'danger' : 'default'" circle @click.stop="toggleNegative">
                        <FontAwesomeIcon :icon="faThumbsDown"/>
                    </ElButton>
                </div>
            </div>
        </template>
        <p v-if="meta.description">{{ meta.description }}</p>
        <div>
            <div class="tags-title">包含以下标签：</div>
            <div class="tags">
                <ElTag v-for="tag in meta.content" class="tag" size="large">{{ tag }}</ElTag>
            </div>
        </div>

    </ElCollapseItem>
</template>

<style lang="scss" scoped>
.title-container {
    width: 100%;
    margin-right: 1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.tags {
    margin: 1rem 1rem;
    line-height: 3rem;
}

.tag {
    margin-right: 1rem;
}
</style>
