<script lang="ts" setup>
import type Node from 'element-plus/es/components/tree/src/model/node'
import type {AllowDropType} from 'element-plus/es/components/tree/src/tree.type'
import {ElButton, ElButtonGroup, ElScrollbar, ElTree, ElMessageBox} from "element-plus";
import {ref} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faCommentMinus, faCommentPlus, faThumbsDown, faThumbsUp, faTrash} from "@fortawesome/pro-regular-svg-icons"
import {useCartStore} from "../stores/cart";
import ImportDialog from "./ImportDialog.vue";
import ResultDialog from "./ResultDialog.vue";
import WeightIdentifier from "./WeightIdentifier.vue";
import FeatureSwitches from './FeatureSwitches.vue'

const cartStore = useCartStore();

const resultVisible = ref(false)
const importVisible = ref(false)

const allowDrag = (node: Node) => {
    return node.data.type !== 'child-tag'
}

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
    return type !== 'inner'
}

function sendTo(direction: 'positive' | 'negative', type: 'preset' | 'tag' | 'embedding', name: string, category: string | null = null) {
    if (direction === 'positive') {
        if (type === 'preset') {
            cartStore.appendPositivePreset(category!, name)
            cartStore.removeNegativePreset(category!, name)
        } else if (type === 'tag' || type === 'embedding') {
            cartStore.appendPositiveTag(name)
            cartStore.removeNegativeTag(name)
        }
    } else if (direction === 'negative') {
        if (type === 'preset') {
            cartStore.appendNegativePreset(category!, name)
            cartStore.removePositivePreset(category!, name)
        } else if (type === 'tag' || type === 'embedding') {
            cartStore.appendNegativeTag(name)
            cartStore.removePositiveTag(name)
        }
    }
}

function deleteFrom(direction: 'positive' | 'negative', type: 'preset' | 'tag', name: string, category: string | null = null) {
    if (direction === 'positive') {
        if (type === 'preset') {
            cartStore.removePositivePreset(category!, name)
        } else if (type === 'tag' || type === 'embedding') {
            cartStore.removePositiveTag(name, type)
        }
    } else if (direction === 'negative') {
        if (type === 'preset') {
            cartStore.removeNegativePreset(category!, name)
        } else if (type === 'tag' || type === 'embedding') {
            cartStore.removeNegativeTag(name, type)
        }
    }
}

async function clearDialog() {
    try {
        await ElMessageBox.confirm('确定要清空购物车吗？', '清空购物车', {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        })
        cartStore.clear()
    } catch (e) {}
}

</script>

<template>
    <div class="mobile-topbar-el">
        <FeatureSwitches/>
    </div>
    <div class="cart-container">
        <h1 class="text-center cart-title">购物车</h1>
        <ElScrollbar class="scrollable">
            <div class="subcart-container cart-positive-container">
                <h1>我想要</h1>
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
                <h1>我不想要</h1>
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
        <div class="btn-block">
            <ElButtonGroup class="btn-group">
                <ElButton type="success" class="btn" @click="importVisible = true">导入标签</ElButton>
                <ElButton type="danger" class="btn" @click="clearDialog">清空购物车</ElButton>
            </ElButtonGroup>

        </div>
        <div class="btn-block mb-bottom">
            <ElButton type="primary" class="btn" @click="resultVisible = true" size="large">结算</ElButton>
        </div>
        <ImportDialog v-model="importVisible"/>
        <ResultDialog v-model="resultVisible"/>
    </div>
</template>

<style lang="scss" scoped>
.cart-container {
    padding: 0 20px;
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
}

.scrollable {
    overflow: auto;
    flex-grow: 1;
    flex-shrink: 1;
    margin-bottom: 1.5rem;
}

.text-center {
    text-align: center;
}

.btn-block {
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    .btn-group {
        width: 100%;
        display: flex;
        > .btn {
            width: 100%;
        }
    }
    > .btn {
        width: 100%;
    }
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

.tag-label {
    max-width: 160px;
    white-space: normal;
}

.tag-button {
    margin-left: 0.25rem;
}

.el-tree {
    :deep(.el-tree-node__label) {
        margin-right: 1.0rem;
    }
    :deep(.el-tree-node__content) {
        height: auto;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
    }
}

.mb-bottom {
    margin-bottom: 30px;
}

.cart-title {
    margin: 0.75rem 0;
}
</style>
