<script lang="ts" setup>
import type Node from 'element-plus/es/components/tree/src/model/node'
import type {AllowDropType} from 'element-plus/es/components/tree/src/tree.type'
import {ElButton, ElScrollbar, ElTree} from "element-plus";
import {ref} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
// @ts-ignore
import {faCommentMinus, faCommentPlus, faThumbsDown, faThumbsUp, faTrash} from "@fortawesome/pro-light-svg-icons"
import {useCartStore} from "../stores/cart";
import ResultDialog from "./ResultDialog.vue";
import WeightIdentifier from "./WeightIdentifier.vue";

const cartStore = useCartStore();

const resultVisible = ref(false)

const allowDrag = (node: Node) => {
    return node.data.type !== 'child-tag'
}

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
    return type !== 'inner'
}

function sendTo(direction: 'positive' | 'negative', type: 'preset' | 'tag', name: string, category: string | null = null) {
    if (direction === 'positive') {
        if (type === 'preset') {
            cartStore.appendPositivePreset(category!, name)
            cartStore.removeNegativePreset(category!, name)
        } else if (type === 'tag') {
            cartStore.appendPositiveTag(name)
            cartStore.removeNegativeTag(name)
        }
    } else if (direction === 'negative') {
        if (type === 'preset') {
            cartStore.appendNegativePreset(category!, name)
            cartStore.removePositivePreset(category!, name)
        } else if (type === 'tag') {
            cartStore.appendNegativeTag(name)
            cartStore.removePositiveTag(name)
        }
    }
}

function deleteFrom(direction: 'positive' | 'negative', type: 'preset' | 'tag', name: string, category: string | null = null) {
    if (direction === 'positive') {
        if (type === 'preset') {
            cartStore.removePositivePreset(category!, name)
        } else if (type === 'tag') {
            cartStore.removePositiveTag(name)
        }
    } else if (direction === 'negative') {
        if (type === 'preset') {
            cartStore.removeNegativePreset(category!, name)
        } else if (type === 'tag') {
            cartStore.removeNegativeTag(name)
        }
    }
}

</script>

<template>
    <div class="cart-container">
        <h1 class="text-center">购物车</h1>
        <ElScrollbar class="scrollable">
            <div class="subcart-container cart-positive-container">
                <h1>正向标签</h1>
                <ElTree
                    :allow-drag="allowDrag"
                    :allow-drop="allowDrop"
                    :data="cartStore.positive"
                    class="cart-tree"
                    draggable
                >
                    <template #default="{ node, data }">
                        <div class="flex">
                            <div class="tag-label">{{ node.label }}
                                <WeightIdentifier v-if="data.type !== 'child-tag'" :weight="data.weight"/>
                            </div>
                            <div v-if="data.type !== 'child-tag'" class="tag-button">
                                <ElButton link type="primary"
                                          @click.stop="data.weight++">
                                    <FontAwesomeIcon :icon="faCommentPlus"/>
                                </ElButton>
                                <ElButton link type="primary"
                                          @click.stop="data.weight--">
                                    <FontAwesomeIcon :icon="faCommentMinus"/>
                                </ElButton>
                                <ElButton link type="primary"
                                          @click.stop="sendTo('negative', data.type, data.name, data.category)">
                                    <FontAwesomeIcon :icon="faThumbsDown"/>
                                </ElButton>
                                <ElButton link type="danger"
                                          @click.stop="deleteFrom('positive', data.type, data.name, data.category)">
                                    <FontAwesomeIcon :icon="faTrash"/>
                                </ElButton>
                            </div>
                        </div>
                    </template>
                </ElTree>
            </div>
            <div class="subcart-container cart-negative-container">
                <h1>反向标签</h1>
                <ElTree
                    :allow-drag="allowDrag"
                    :allow-drop="allowDrop"
                    :data="cartStore.negative"
                    class="cart-tree"
                    draggable
                >
                    <template #default="{ node, data }">
                        <div class="flex">
                            <div class="tag-label">{{ node.label }}
                                <WeightIdentifier v-if="data.type !== 'child-tag'" :weight="data.weight"/>
                            </div>
                            <div v-if="data.type !== 'child-tag'" class="tag-button">
                                <ElButton link type="primary"
                                          @click.stop="data.weight++">
                                    <FontAwesomeIcon :icon="faCommentPlus"/>
                                </ElButton>
                                <ElButton link type="primary"
                                          @click.stop="data.weight--">
                                    <FontAwesomeIcon :icon="faCommentMinus"/>
                                </ElButton>
                                <ElButton link type="primary"
                                          @click.stop="sendTo('positive', data.type, data.name, data.category)">
                                    <FontAwesomeIcon :icon="faThumbsUp"/>
                                </ElButton>
                                <ElButton link type="danger"
                                          @click.stop="deleteFrom('negative', data.type, data.name, data.category)">
                                    <FontAwesomeIcon :icon="faTrash"/>
                                </ElButton>
                            </div>
                        </div>
                    </template>
                </ElTree>
            </div>
        </ElScrollbar>
        <ElButton class="btn-block" type="primary" @click="resultVisible = true">结算</ElButton>

        <ResultDialog v-model="resultVisible"/>
    </div>
</template>

<style lang="scss" scoped>
.cart-container {
    padding: 0 20px;
}

.scrollable {
    height: calc(100vh - 225px);
    overflow: auto;
    margin-bottom: 1.5rem;
}

.text-center {
    text-align: center;
}

.btn-block {
    width: 100%;
}

.subcart-container {
    margin-bottom: 1.5rem;
}

.flex {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
}

.tag-button {
    margin-left: 0.25rem;
}
</style>
