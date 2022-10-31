<script lang="ts" setup>
import {ElButton, ElCollapseItem, ElCarousel, ElCarouselItem, ElTooltip, ElImage} from 'element-plus'
import type {Preset} from '../datatypes'
import {computed, ref} from 'vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faImageSlash} from '@fortawesome/pro-regular-svg-icons'
import {faClipboard, faThumbsDown, faThumbsUp} from '@fortawesome/pro-light-svg-icons'
import {useCartStore, wrapParenByWeight} from '../stores/cart'
import ToggleableTag from './ToggleableTag.vue'
import {useSettingsStore} from '../stores/settings'
import Decimal from 'decimal.js-light'

const props = defineProps<{
    category: string,
    meta: Preset,
    // blurImage: boolean,
}>()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()

const copyHintVisible = ref(false)

const inPositive = computed(() => cartStore.existsPositive('preset', props.meta.name, props.category))
const inNegative = computed(() => cartStore.existsNegative('preset', props.meta.name, props.category))

async function copyToClipboard(full: boolean = false) {
    await window.navigator.clipboard.writeText(props.meta.content
        .map(n => full ? wrapParenByWeight(n.tag, new Decimal(n.weight), settingsStore.newEmphasis) : n.tag)
        .join(', '))
    copyHintVisible.value = true
    setTimeout(() => copyHintVisible.value = false, 1000)
}

function togglePositive() {
    if (!inPositive.value) {
        cartStore.appendPositivePreset(props.category, props.meta.name)
    } else {
        cartStore.removePositivePreset(props.category, props.meta.name)
    }
}

function toggleNegative() {
    if (!inNegative.value) {
        cartStore.appendNegativePreset(props.category, props.meta.name)
    } else {
        cartStore.removeNegativePreset(props.category, props.meta.name)
    }
}
</script>

<template>
    <ElCollapseItem>
        <template #title>
            <div class="title-container">
                <div class="title">{{ meta.name }}</div>
                <div class="buttons">
                    <ElTooltip :visible="copyHintVisible">
                        <template #content>
                            <span>已复制到剪贴板</span>
                        </template>
                        <ElButton circle type="primary" @click.stop="copyToClipboard(false)"
                                  @dblclick.stop="copyToClipboard(true)">
                            <FontAwesomeIcon :icon="faClipboard" />
                        </ElButton>
                    </ElTooltip>
                    <ElTooltip content="我想要" :show-after="750">
                        <ElButton :type="inPositive ? 'success' : 'default'" circle @click.stop="togglePositive">
                            <FontAwesomeIcon :icon="faThumbsUp" />
                        </ElButton>
                    </ElTooltip>
                    <ElTooltip content="我不想要" :show-after="750">
                        <ElButton :type="inNegative ? 'danger' : 'default'" circle @click.stop="toggleNegative">
                            <FontAwesomeIcon :icon="faThumbsDown" />
                        </ElButton>
                    </ElTooltip>
                </div>
            </div>
        </template>
        <div v-if="meta.description">
            <p v-for="t in meta.description.split('\n')" :key="t" class="text description">{{ t }}</p>
        </div>
        <div>
            <div class="tags-title">包含以下标签：</div>
            <div class="tags">
                <ToggleableTag v-for="tag in meta.content" :key="tag.tag" :tag="tag.tag" size="large" direction="both" />
            </div>
        </div>
        <div v-if="meta.preview">
            <ElCarousel :interval="5000" height="512px">
                <ElCarouselItem v-for="hash in meta.preview" :key="hash">
                    <ElImage :src="`images/${hash.slice(0, 2)}/${hash}.webp`" fit="contain" class="carousel-image">
                        <template #error>
                            <div class="image-slot">
                                <FontAwesomeIcon :icon="faImageSlash" size="lg" />
                            </div>
                        </template>
                    </ElImage>
                </ElCarouselItem>
            </ElCarousel>
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

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
}

.carousel-image {
    height: 100%;
    width: 100%;
}
</style>
