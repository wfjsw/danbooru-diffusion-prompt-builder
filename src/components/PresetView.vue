<script lang="ts" setup>
import {ElButton, ElCollapseItem, ElTag, ElTooltip} from "element-plus";
import type {Preset} from "../datatypes";
import {computed, ref} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faClipboard, faThumbsDown, faThumbsUp} from "@fortawesome/pro-light-svg-icons";
import {useCartStore} from "../stores/cart";
import ToggleableTag from "./ToggleableTag.vue";

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
                    <ElTooltip content="我想要" :show-after="750">
                        <ElButton :type="inPositive ? 'success' : 'default'" circle @click.stop="togglePositive">
                            <FontAwesomeIcon :icon="faThumbsUp"/>
                        </ElButton>
                    </ElTooltip>
                    <ElTooltip content="我不想要" :show-after="750">
                        <ElButton :type="inNegative ? 'danger' : 'default'" circle @click.stop="toggleNegative">
                            <FontAwesomeIcon :icon="faThumbsDown"/>
                        </ElButton>
                    </ElTooltip>
                </div>
            </div>
        </template>
        <div v-if="meta.description">
            <p v-for="t in meta.description.split('\n')" class="text description">{{ t }}</p>
        </div>
        <div>
            <div class="tags-title">包含以下标签：</div>
            <div class="tags">
                <ToggleableTag v-for="tag in meta.content" :tag="tag" size="large" direction="both" />
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

    > * {
        margin-right: 1rem;
    }
}

</style>
