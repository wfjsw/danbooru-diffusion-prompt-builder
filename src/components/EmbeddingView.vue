<script lang="ts" setup>
import {computed, toRefs} from 'vue'
import {ElButton, ElCard, ElTooltip, ElImage} from "element-plus";
import {useClipboard} from '@vueuse/core';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faClipboard, faThumbsDown, faThumbsUp} from "@fortawesome/pro-light-svg-icons";
import {faCloudArrowDown, faImageSlash} from "@fortawesome/pro-regular-svg-icons";
import type {Embedding} from "../datatypes";
import {useCartStore} from "../stores/cart";
import ToggleableTag from "./ToggleableTag.vue";

const props = withDefaults(defineProps<{
    data: Embedding,
    blurImage: boolean,
    showCategory?: boolean,
}>(), {
    showCategory: false,
})


const refProps = toRefs(props)

const {copy, copied} = useClipboard({source: refProps.data.value.prompt})
const cartStore = useCartStore();

const imageUrl = computed(() => {
    const hash = props.data.payloadHash
    return `embeddings/${hash.slice(0, 2)}/${hash}.preview.webp`
})

const downloadUrl = computed(() => {
    if (props.data.payloadURL) {
        return props.data.payloadURL
    }
    const hash = props.data.payloadHash
    return `embeddings/${hash.slice(0, 2)}/${hash}.webp`
})

const prompt = computed(() => `${props.data.prompt}-${props.data.payloadHash.slice(0, 6)}`)
const fileName = computed(() => `${prompt.value}.webp`)

const inPositive = computed(() => cartStore.existsPositive('embedding', prompt.value))
const inNegative = computed(() => cartStore.existsNegative('embedding', prompt.value))

function togglePositive(tag: string = prompt.value) {
    if (!inPositive.value) {
        cartStore.appendPositiveTag(tag)
    } else {
        cartStore.removePositiveTag(tag, 'embedding')
    }
}

function toggleNegative(tag: string = prompt.value) {
    if (!inNegative.value) {
        cartStore.appendNegativeTag(tag)
    } else {
        cartStore.removeNegativeTag(tag, 'embedding')
    }
}
</script>

<template>
    <ElCard :body-style="{ padding: '0px' }" class="box-card">
        <div v-if="imageUrl" :class="['card-image-container', {'blur-image': blurImage}]">
            <ElImage :src="imageUrl" fit="cover" lazy>
                <template #error>
                    <div class="image-slot">
                        <FontAwesomeIcon :icon="faImageSlash" size="lg"/>
                    </div>
                </template>
            </ElImage>
        </div>

        <div class="imagecard-content">
            <div class="card-header flex-button-container">
                <div class="tag-header"><code class="tag-name large">{{ prompt }}</code></div>
                <div class="buttons-group">
                    <div class="big-download-button">
                        <a :href="downloadUrl" :download="fileName" target="_blank" class="text-decoration-none">
                            <ElButton type="warning" color="#533F20" round class="download-btn">
                                <FontAwesomeIcon :icon="faCloudArrowDown" class="icon"/>
                                下载模型
                            </ElButton>
                        </a>
                    </div>
                    <div class="buttons">
                        <ElTooltip :visible="copied">
                            <template #content>
                                <span>已复制到剪贴板</span>
                            </template>
                            <ElButton circle type="primary" @click="copy()">
                                <FontAwesomeIcon :icon="faClipboard"/>
                            </ElButton>
                        </ElTooltip>

                        <ElTooltip content="我想要" :show-after="750">
                            <ElButton :type="inPositive ? 'success' : 'default'" circle @click="togglePositive(prompt)">
                                <FontAwesomeIcon :icon="faThumbsUp"/>
                            </ElButton>
                        </ElTooltip>
                        <ElTooltip content="我不想要" :show-after="750">
                            <ElButton :type="inNegative ? 'danger' : 'default'" circle @click="toggleNegative(prompt)">
                                <FontAwesomeIcon :icon="faThumbsDown"/>
                            </ElButton>
                        </ElTooltip>
                    </div>
                </div>
            </div>
            <div v-if="data.name" class="text name">{{ data.name }}</div>
            <div v-if="data.category" class="text category">类别：{{ data.category }}</div>
            <div v-if="data.author" class="text author">来源：{{ data.author }}</div>
            <p v-if="data.description" class="text description">{{ data.description }}</p>
            <div v-if="data.modelName" class="text meta">模型名：<code>{{ data.modelName }}</code> (<code>{{ data.modelHash }}</code>)</div>
            <div v-if="data.vectorSize" class="text meta">向量数量：{{ data.vectorSize }}</div>
            <div v-if="data.steps" class="text meta">训练步数：{{ data.steps }}</div>

            <div v-if="data.suggestPositive" class="tag-suggestion">
                <div>推荐正向标签：</div>
                <div class="tags">
                    <ToggleableTag v-for="tag in data.suggestPositive" :tag="tag" size="default" direction="positive" />
                </div>
            </div>

            <div v-if="data.suggestNegative" class="tag-suggestion">
                <div>推荐反向标签</div>
                <div class="tags">
                    <ToggleableTag v-for="tag in data.suggestNegative" :tag="tag" size="default" direction="negative" />
                </div>
            </div>

        </div>

    </ElCard>
</template>

<style lang="scss" scoped>
.tag-name {
    user-select: all;
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;

    &.large {
        font-size: 12pt;
        font-weight: bold;
    }
}

.buttons {
    display: inline-block;

    & > * {
        margin-left: 0.6rem;
    }
}

.buttons-group {
    margin-left: auto;
    text-align: right;

    > div:first-child {
        margin-bottom: 0.75rem;
    }
}

@media (max-width: 1279px) {
    .box-card {
        width: 100%;
    }
}

@media (min-width: 1280px) {
    .box-card {
        width: calc(50% - 20px);
    }
}

@media (min-width: 1600px) {
    .box-card {
        width: calc(33% - 20px);
        --card-width: calc(33% - 20px);
    }
}

@media (min-width: 1920px) {
    .box-card {
        width: calc(25% - 20px);
    }
}

@media (min-width: 1920px) {
    .box-card {
        width: calc(20% - 20px);
    }
}

.box-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

@keyframes image_unblur {
    0% {
        filter: blur(10px);
    }
    100% {
        filter: blur(0px);
    }
}

@keyframes image_blur {
    0% {
        filter: blur(0px);
    }
    100% {
        filter: blur(10px);
    }
}

.card-image-container {
    min-height: 256px;
    aspect-ratio: 1 / 1;
    transition: .5s all;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &.blur-image {
        filter: blur(15px);

        &:hover {
            filter: blur(0px);
        }
    }

}

.tag-header {
    height: 32px;

    .tag-name {
        line-height: 32px;
    }

    margin-right: 0.5rem;
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.card-header {
    margin-bottom: 1.5rem;
    row-gap: 0.75rem;
}

.flex-button-container {
    display: flex;
    flex-direction: row;
    vertical-align: middle;
    justify-content: space-between;
    flex-wrap: wrap;
}

.alias-tag {
    row-gap: 0.5rem;
}

.imagecard-content {
    padding: var(--el-card-padding);
}

.text {
    margin-bottom: 0.5rem;
}

.name {
    margin-bottom: 1rem;
    font-size: 14pt;
    font-weight: 400;
}

.description {
    margin-bottom: 1rem;
    word-wrap: break-word;
}

.tags {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    line-height: 2rem;

    > * {
        margin-right: 0.5rem;
    }
}

.tag-suggestion {
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.download-btn {
    .icon {
        margin-right: 0.5rem;
    }
}

.text-decoration-none {
    text-decoration: none;
}

.big-download-button {
    display: inline-block;
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
</style>
