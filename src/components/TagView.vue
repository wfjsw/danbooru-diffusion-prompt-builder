<script setup lang="ts">
import {ref, computed} from 'vue'
import {ElCard, ElButton, ElTooltip} from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
// @ts-ignore
import {faClipboard, faThumbsUp, faThumbsDown} from "@fortawesome/pro-light-svg-icons";
import {TagMeta} from "../datatypes";
import {useCartStore} from "../stores/cart";

const props = defineProps<{
    tag: string,
    meta: TagMeta,
    blurImage: boolean,
}>()

const cartStore = useCartStore();

const copyHintVisible = ref(false)

const imageUrl = computed(() => {
    if (typeof props.meta.image === 'string') {
        if (props.meta.image.startsWith('https://')) {
            return props.meta.image
        } else {
            return `demo-images/${props.meta.image.slice(0,2)}/${props.meta.image}.webp`
        }

    }
    return null
})

const inPositive = computed(() => cartStore.existsPositive('tag', props.tag))
const inNegative = computed(() => cartStore.existsNegative('tag', props.tag))

async function copyToClipboard() {
    await window.navigator.clipboard.writeText(props.tag)
    copyHintVisible.value = true
    setTimeout(() => copyHintVisible.value = false, 1000)
}

function togglePositive() {
    if (!inPositive.value) {
        cartStore.appendPositiveTag(props.tag)
    } else {
        cartStore.removePositiveTag(props.tag)
    }
}

function toggleNegative() {
    if (!inNegative.value) {
        cartStore.appendNegativeTag(props.tag)
    } else {
        cartStore.removeNegativeTag(props.tag)
    }
}
</script>

<template>
    <ElCard class="box-card" :body-style="{ padding: '0px' }">
        <div :class="['card-image-container', {'blur-image': blurImage}]" v-if="imageUrl"
             :style="{backgroundImage: `url(${imageUrl})`}" />

        <div class="imagecard-content">
            <div class="card-header">
                <div class="tag-header"><code class="tag-name large">{{ tag }}</code></div>
                <div class="buttons">
                    <ElTooltip :visible="copyHintVisible">
                        <template #content>
                            <span>已复制到剪贴板</span>
                        </template>
                        <ElButton type="primary" circle @click="copyToClipboard">
                            <FontAwesomeIcon :icon="faClipboard"/>
                        </ElButton>
                    </ElTooltip>
                    <ElButton :type="inPositive ? 'success' : 'default'" circle @click="togglePositive">
                        <FontAwesomeIcon :icon="faThumbsUp"/>
                    </ElButton>
                    <ElButton :type="inNegative ? 'danger' : 'default'" circle @click="toggleNegative">
                        <FontAwesomeIcon :icon="faThumbsDown"/>
                    </ElButton>
                </div>
            </div>
            <div v-if="meta.name" class="text name">{{ meta.name }}</div>
            <p v-if="meta.description" class="text description">{{ meta.description }}</p>
            <div v-if="meta.alias">
                <span class="text">别名：</span>
                <ul>
                    <li v-for="alias in meta.alias" :key="alias" class="text"><code class="tag-name">{{ alias }}</code></li>
                </ul>
            </div>
        </div>

    </ElCard>
</template>

<style scoped lang="scss">
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
    0% { filter: blur(10px);}
    100% { filter: blur(0px);}
}

@keyframes image_blur {
    0% { filter: blur(0px);}
    100% { filter: blur(10px);}
}

.card-image-container {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    min-height: 256px;
    aspect-ratio : 1 / 1;
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
    display: flex;
    flex-direction: row;
    vertical-align: middle;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    row-gap: 0.75rem;
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
</style>
