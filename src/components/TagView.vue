<script lang="ts" setup>
import {computed, toRef} from 'vue'
import {ElButton, ElCard, ElTooltip, ElImage} from "element-plus";
import {useClipboard} from '@vueuse/core';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faClipboard, faThumbsDown, faThumbsUp, faLink, faImageSlash} from "@fortawesome/pro-light-svg-icons";
import TagPostCount from "./TagPostCount.vue";
import type {TagMeta} from "../datatypes";
import {useCartStore} from "../stores/cart";

const props = defineProps<{
    tag: string,
    meta: TagMeta & {category?: string},
    blurImage: boolean,
}>()

const {copy, copied} = useClipboard({source: toRef(props, 'tag')})
const cartStore = useCartStore();

const imageUrl = computed(() => {
    if (typeof props.meta.image === 'string') {
        if (props.meta.image.startsWith('https://')) {
            return props.meta.image
        } else {
            return `images/${props.meta.image.slice(0, 2)}/${props.meta.image}.webp`
        }

    }
    return null
})

const inPositive = computed(() => cartStore.existsPositive('tag', props.tag))
const inNegative = computed(() => cartStore.existsNegative('tag', props.tag))

interface BooleanFlags {
    [key: string]: boolean
}

const aliasInPositive = computed<BooleanFlags|null>(() => props.meta?.alias
    && props.meta.alias.reduce((a: BooleanFlags, t: string) => (a[t] = cartStore.existsPositive('tag', t), a), {}))
const aliasInNegative = computed<BooleanFlags|null>(() => props.meta?.alias
    && props.meta.alias.reduce((a: BooleanFlags, t: string) => (a[t] = cartStore.existsNegative('tag', t), a), {}))

function togglePositive(tag: string = props.tag) {
    if (tag === props.tag) {
        if (!inPositive.value) {
            cartStore.appendPositiveTag(tag)
        } else {
            cartStore.removePositiveTag(tag)
        }
    } else {
        if (!aliasInPositive.value![tag]) {
            cartStore.appendPositiveTag(tag)
        } else {
            cartStore.removePositiveTag(tag)
        }
    }
}

function toggleNegative(tag: string = props.tag) {
    if (tag === props.tag) {
        if (!inNegative.value) {
            cartStore.appendNegativeTag(tag)
        } else {
            cartStore.removeNegativeTag(tag)
        }
    } else {
        if (!aliasInNegative.value![tag]) {
            cartStore.appendNegativeTag(tag)
        } else {
            cartStore.removeNegativeTag(tag)
        }
    }
}
</script>

<template>
    <ElCard :body-style="{ padding: '0px' }" class="box-card">
        <div v-if="imageUrl" :class="['card-image-container', {'blur-image': blurImage}]">
            <ElImage :src="imageUrl" fit="cover" loading="lazy">
                <template #error>
                    <div class="image-slot">
                        <FontAwesomeIcon :icon="faImageSlash" size="lg"/>
                    </div>
                </template>
            </ElImage>
        </div>

        <div class="imagecard-content">
            <div class="card-header flex-button-container">
                <div class="tag-header">
                    <code class="tag-name large">{{ tag }}</code>
                    <TagPostCount :tag="tag"/>
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
                    <a v-if="meta.wikiURL" :href="meta.wikiURL" target="_blank">
                        <ElTooltip content="Danbooru Wiki" :show-after="750">
                            <ElButton type="info" circle>
                                <FontAwesomeIcon :icon="faLink"/>
                            </ElButton>
                        </ElTooltip>
                    </a>
                    <ElTooltip content="我想要" :show-after="750">
                        <ElButton :type="inPositive ? 'success' : 'default'" circle @click="togglePositive(tag)">
                            <FontAwesomeIcon :icon="faThumbsUp"/>
                        </ElButton>
                    </ElTooltip>
                    <ElTooltip content="我不想要" :show-after="750">
                        <ElButton :type="inNegative ? 'danger' : 'default'" circle @click="toggleNegative(tag)">
                            <FontAwesomeIcon :icon="faThumbsDown"/>
                        </ElButton>
                    </ElTooltip>
                </div>
            </div>
            <div v-if="meta.name" class="text name">{{ meta.name }}</div>
            <div v-if="meta.category" class="text category">类别：{{ meta.category }}</div>
            <div v-if="meta.description">
                <p v-for="t in meta.description.split('\n')" class="text description">{{ t }}</p>
            </div>
            <div v-if="meta.alias">
                <span class="text">别名：</span>
                <ul>
                    <li v-for="alias in meta.alias" :key="alias" class="text">
                        <div class="alias-tag flex-button-container">
                            <div>
                                <code class="tag-name">{{ alias }}</code>
                                <TagPostCount :tag="alias"/>
                            </div>
                            <div class="buttons">
                                <ElTooltip content="我想要" :show-after="750">
                                    <ElButton :type="aliasInPositive![alias] ? 'success' : 'default'" circle size="small"
                                              @click="togglePositive(alias)">
                                        <FontAwesomeIcon :icon="faThumbsUp"/>
                                    </ElButton>
                                </ElTooltip>
                                <ElTooltip content="我不想要" :show-after="750">
                                    <ElButton :type="aliasInNegative![alias] ? 'danger' : 'default'" circle size="small"
                                              @click="toggleNegative(alias)">
                                        <FontAwesomeIcon :icon="faThumbsDown"/>
                                    </ElButton>
                                </ElTooltip>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

    </ElCard>
</template>

<style lang="scss" scoped>
.tag-name {
    user-select: all;
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
    margin-right: 0.75rem;

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
    margin-bottom: 1rem;
}

.name {
    font-size: 14pt;
    font-weight: 400;
}

.description {
    word-wrap: break-word;
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
