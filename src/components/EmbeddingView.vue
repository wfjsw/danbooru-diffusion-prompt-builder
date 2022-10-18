<script lang="ts" setup>
import {computed, toRefs} from 'vue'
import {ElButton, ElCard, ElTooltip} from "element-plus";
import {useClipboard} from '@vueuse/core';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faClipboard, faThumbsDown, faThumbsUp, faLink, faCloudArrowDown} from "@fortawesome/pro-light-svg-icons";
import type {Embedding} from "../datatypes";
import {useCartStore} from "../stores/cart";
import ToggleableTag from "./ToggleableTag.vue";

const props = defineProps<{
    data: Embedding,
    blurImage: boolean,
}>()

const refProps = toRefs(props)

const {copy, copied} = useClipboard({source: refProps.data.value.prompt})
const cartStore = useCartStore();

const imageUrl = computed(() => {
    const hash = props.data.payloadHash
    return `embeddings/${hash.slice(0, 2)}/${hash}.preview.webp`
})

const downloadUrl = computed(() => {
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
        <div v-if="imageUrl" :class="['card-image-container', {'blur-image': blurImage}]"
             :style="{backgroundImage: `url(${imageUrl})`}"/>

        <div class="imagecard-content">
            <div class="card-header flex-button-container">
                <div class="tag-header"><code class="tag-name large">{{ prompt }}</code></div>
                <div class="buttons">
                    <ElTooltip :visible="copied">
                        <template #content>
                            <span>已复制到剪贴板</span>
                        </template>
                        <ElButton circle type="primary" @click="copy()">
                            <FontAwesomeIcon :icon="faClipboard"/>
                        </ElButton>
                    </ElTooltip>
                    <ElTooltip content="下载模型" :show-after="750">
                        <a :href="downloadUrl" :download="fileName" target="_blank">
                            <ElButton type="warning" circle>
                                <FontAwesomeIcon :icon="faCloudArrowDown"/>
                            </ElButton>
                        </a>
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
            <div v-if="data.name" class="text name">{{ data.name }}</div>
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
    margin-left: auto;

    & > * {
        margin-left: 0.6rem;
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
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    min-height: 256px;
    aspect-ratio: 1 / 1;
    transition: .5s all;

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
</style>
