<script lang="ts" setup>
import {computed, toRefs} from 'vue'
import {ElButton, ElCard, ElTooltip} from "element-plus";
import {useClipboard} from '@vueuse/core';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faClipboard, faThumbsDown, faThumbsUp, faLink, faCloudArrowDown} from "@fortawesome/pro-light-svg-icons";
import type {Embedding} from "../datatypes";
// import {useCartStore} from "../stores/cart";

const props = defineProps<{
    data: Embedding,
    blurImage: boolean,
}>()

const refProps = toRefs(props)

const {copy, copied} = useClipboard({source: refProps.data.value.prompt})
// const cartStore = useCartStore();

const imageUrl = computed(() => {
    const hash = props.data.payloadHash
    return `embeddings/${hash.slice(0, 2)}/${hash}.preview.webp`
})

const downloadUrl = computed(() => {
    const hash = props.data.payloadHash
    return `embeddings/${hash.slice(0, 2)}/${hash}.original.webp`
})

const fileName = computed(() => {
    const filename = props.data.filename
    return `${filename}.webp`
})

// const inPositive = computed(() => cartStore.existsPositive('embedding', props.tag))
// const inNegative = computed(() => cartStore.existsNegative('embedding', props.tag))

// interface BooleanFlags {
//     [key: string]: boolean
// }
//
// const aliasInPositive = computed<BooleanFlags|null>(() => props.meta?.alias
//     && props.meta.alias.reduce((a: BooleanFlags, t: string) => (a[t] = cartStore.existsPositive('tag', t), a), {}))
// const aliasInNegative = computed<BooleanFlags|null>(() => props.meta?.alias
//     && props.meta.alias.reduce((a: BooleanFlags, t: string) => (a[t] = cartStore.existsNegative('tag', t), a), {}))

// function togglePositive(tag: string = props.tag) {
//     if (tag === props.tag) {
//         if (!inPositive.value) {
//             cartStore.appendPositiveTag(tag)
//         } else {
//             cartStore.removePositiveTag(tag)
//         }
//     } else {
//         if (!aliasInPositive.value![tag]) {
//             cartStore.appendPositiveTag(tag)
//         } else {
//             cartStore.removePositiveTag(tag)
//         }
//     }
// }
//
// function toggleNegative(tag: string = props.tag) {
//     if (tag === props.tag) {
//         if (!inNegative.value) {
//             cartStore.appendNegativeTag(tag)
//         } else {
//             cartStore.removeNegativeTag(tag)
//         }
//     } else {
//         if (!aliasInNegative.value![tag]) {
//             cartStore.appendNegativeTag(tag)
//         } else {
//             cartStore.removeNegativeTag(tag)
//         }
//     }
// }
</script>

<template>
    <ElCard :body-style="{ padding: '0px' }" class="box-card">
        <div v-if="imageUrl" :class="['card-image-container', {'blur-image': blurImage}]"
             :style="{backgroundImage: `url(${imageUrl})`}"/>

        <div class="imagecard-content">
            <div class="card-header flex-button-container">
                <div class="tag-header"><code class="tag-name large">{{ data.prompt }}</code></div>
                <div class="buttons">
                    <ElTooltip :visible="copied">
                        <template #content>
                            <span>已复制到剪贴板</span>
                        </template>
                        <ElButton circle type="primary" @click="copy()">
                            <FontAwesomeIcon :icon="faClipboard"/>
                        </ElButton>
                    </ElTooltip>
                    <a :href="downloadUrl" :download="fileName" target="_blank">
                        <ElButton type="success" circle>
                            <FontAwesomeIcon :icon="faCloudArrowDown"/>
                        </ElButton>
                    </a>
<!--                    <ElButton :type="inPositive ? 'success' : 'default'" circle @click="togglePositive(tag)">-->
<!--                        <FontAwesomeIcon :icon="faThumbsUp"/>-->
<!--                    </ElButton>-->
<!--                    <ElButton :type="inNegative ? 'danger' : 'default'" circle @click="toggleNegative(tag)">-->
<!--                        <FontAwesomeIcon :icon="faThumbsDown"/>-->
<!--                    </ElButton>-->
                </div>
            </div>
            <div v-if="data.name" class="text name">{{ data.name }}</div>
            <div v-if="data.author" class="text author">作者：{{ data.author }}</div>
            <p v-if="data.description" class="text description">{{ data.description }}</p>
            <div v-if="data.modelName" class="text meta">模型名：<code>{{ data.modelName }}</code> (<code>{{ data.modelHash }}</code>)</div>
            <div v-if="data.vectorSize" class="text meta">向量数量：{{ data.vectorSize }}</div>
            <div v-if="data.steps" class="text meta">训练步数：{{ data.steps }}</div>
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

.name {
    margin-bottom: 1rem;
    font-size: 14pt;
    font-weight: 400;
}

.description {
    margin-bottom: 1rem;
    word-wrap: break-word;
}

.meta {
    margin-bottom: 0.5rem;
}
</style>
