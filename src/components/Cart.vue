<script setup lang="ts">
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode'
import type { AllowDropType } from 'element-plus/es/components/tree/src/tree.type'
import {ElTree, ElButton, ElScrollbar, ElRow, ElCol} from "element-plus";
import {ref} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faBan, faCircleCheck, faTrash} from "@fortawesome/pro-light-svg-icons"
import {useCartStore} from "../stores/cart";
import ResultDialog from "./ResultDialog.vue";

const cartStore = useCartStore();

const resultVisible = ref(false)

const allowDrag = (node: Node) => {
    return node.data.type !== 'child-tag'
}

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
    return type !== 'inner'
}

function sendTo(direction: 'positive'|'negative', type: 'preset'|'tag', name: string, category: string|null = null) {
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
function deleteFrom(direction: 'positive'|'negative', type: 'preset'|'tag', name: string, category: string|null = null) {
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
                    class="cart-tree"
                    :allow-drop="allowDrop"
                    :allow-drag="allowDrag"
                    :data="cartStore.positive"
                    draggable
                >
                    <template #default="{ node, data }">
                        <div class="flex">
                          <div class="tag-label">{{ node.label }}</div>
                          <div v-if="data.type !== 'child-tag'" class="tag-button">
                            <ElButton link type="primary"
                                      @click.stop="sendTo('negative', data.type, data.name, data.category)">
                                <FontAwesomeIcon :icon="faBan"/>
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
                    class="cart-tree"
                    :allow-drop="allowDrop"
                    :allow-drag="allowDrag"
                    :data="cartStore.negative"
                    draggable
                >
                    <template #default="{ node, data }">
                        <div class="flex">
                            <div class="tag-label">{{ node.label }}</div>
                            <div v-if="data.type !== 'child-tag'" class="tag-button">
                                <ElButton link type="primary"
                                          @click.stop="sendTo('positive', data.type, data.name, data.category)">
                                    <FontAwesomeIcon :icon="faCircleCheck"/>
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
        <ElButton type="primary" class="btn-block" @click="resultVisible = true">结算</ElButton>

        <ResultDialog v-model="resultVisible"/>
    </div>
</template>

<style scoped lang="scss">
.cart-container {
    padding: 0 20px;
}
.scrollable {
    height: calc(100vh - 225px);
    overflow-y: auto;
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
    margin-left: 1rem;
}
</style>
