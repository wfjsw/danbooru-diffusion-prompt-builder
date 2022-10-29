<script setup lang="ts">
import Decimal from 'decimal.js-light'
import {ElTree} from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import type {AllowDropType, NodeDropType} from 'element-plus/es/components/tree/src/tree.type'
import {type CartItemEditingChild, type CartItemPresetChild, type CartItemSimple, type CartItemComplex, type CartItemComposition, type CartItemEditing, type CartItem, type CartChildItem, useCartStore, CartItemAlternate} from '../stores/cart'
import CartItemComponent from './CartItem.vue'

const props = defineProps<{
    direction: 'positive'|'negative'
}>()

const cartStore = useCartStore()
const dataSource = cartStore[props.direction]

function allowDrag() {
    return true
}

function allowDrop(draggingNode: Node, dropNode: Node, type: AllowDropType) {

    // 不能拖到非free node的里边
    if (dropNode.data.level !== 'free' && type === 'inner')
        return false

    // preset外不能拖进去
    // 1. 不能拖到preset上边
    if (dropNode.data.type === 'preset' && type === 'inner') 
        return false
    
    // 2. 目标是presetChild则只能是本preset中间互相拖
    if (dropNode.data.level === 'presetChild' && dropNode.data.parent !== draggingNode.data.parent) 
        return false
    
    // null 标签不能拖出来
    if (draggingNode.data.type === 'null' && dropNode.data.parent !== draggingNode.data.parent)
        return false

    return true
}

/**
 * 需要处理的部分（先出后入）：
 * 1. 出：拖出来的是presetChild，需要解散preset
 * 2. 出：editing拖到只剩一个null，需要删掉这个editing
 * 3. 入：有标签拖进有null的editing里，需要删掉这个null
 * 4. 出：有两个标签的editing拖出一个标签，需要加一个null
 * 5. 入：有标签拖进已经有两个标签的editing里，需要转alternate
 * 6. 出：mixture拖干净，需要删掉mixture
 * 7. 入：有simple标签拖进free的simple标签，创建editing
 * 8. 出：alternate和editing移出，需要补一个weight
 * 
 * 最后需要把parent改了，标签类型修正了
 * 
 */
function dropPostProcess(draggingNode: Node, dropNode: Node, type: NodeDropType) {
    if (!dropNode || type === 'none') return
    // // 1. 出：拖出来的是presetChild，需要解散preset
    if (draggingNode.data.level === 'presetChild') {
        const draggingCartItem = draggingNode.data as CartItemPresetChild
        if (dropNode.data.parent !== draggingCartItem.parent) {
            cartStore.dismissCartItem(props.direction, draggingCartItem.parent)
        }
    } else if (draggingNode.data.level === 'editingChild') {
        const draggingCartItem = draggingNode.data as CartItemEditingChild
        if (draggingCartItem.type !== 'null') {
            // 2. 出：editing拖到只剩一个null，需要删掉这个editing
            if (draggingCartItem.parent.children.every(n => n.type === 'null')) {
                cartStore.removeCartItem(props.direction, draggingCartItem.parent)
            }
            // 4. 出：有两个标签的editing拖出一个标签，需要加一个null
            // @ts-expect-error Well, 这里是可能为 1 的，但这不是个合法状态，所以要改
            if (draggingCartItem.parent.children.length === 1) {
                draggingCartItem.parent.children.push({
                    type: 'null',
                    level: 'editingChild',
                    label: '无标签',
                    parent: draggingCartItem.parent,
                })
            }
        }
    } else if (draggingNode.data.level === 'compositeChild' || draggingNode.data.level === 'alternateChild') {
        // 6. 出：mixture拖干净，需要删掉mixture
        if (draggingNode.data.parent.children.length === 0) {
            cartStore.removeCartItem(props.direction, draggingNode.data.parent)
        } else if (draggingNode.data.parent.children.length === 1) {
            // 剩下一个就解散
            cartStore.dismissCartItem(props.direction, draggingNode.data.parent as CartItemComposition|CartItemAlternate)
        }
    }
    if (dropNode.data.level === 'editingChild') {
        const dropCartItem = dropNode.data as CartItemEditingChild
        if (dropCartItem.parent.children.length > 2) {
            const nullIdx = dropCartItem.parent.children.findIndex(n => n.type === 'null')
            if (nullIdx !== -1) {
                // 3. 入：有标签拖进有null的editing里，需要删掉这个null
                dropCartItem.parent.children.splice(nullIdx, 1)
            } else {
                // 5. 入：有标签拖进已经有两个标签的editing里，需要转alternate
                cartStore.switchMixtureType(props.direction, dropCartItem.parent, 'alternate')
            }
        }
    } else if (dropNode.data.type === 'editing' && type === 'inner') {
        const dropCartItem = dropNode.data as CartItemEditing
        if (dropCartItem.children.length > 2) {
            const nullIdx = dropCartItem.children.findIndex(n => n.type === 'null')
            if (nullIdx !== -1) {
                // 3. 入：有标签拖进有null的editing里，需要删掉这个null
                dropCartItem.children.splice(nullIdx, 1)
            } else {
                // 5. 入：有标签拖进已经有两个标签的editing里，需要转alternate
                cartStore.switchMixtureType(props.direction, dropCartItem, 'alternate')
            }
        }
    } else if (dropNode.data.level === 'free' && (dropNode.data.type === 'tag' || dropNode.data.type === 'embedding') && type === 'inner') {
        const dropCartItem = dropNode.data as CartItemSimple
        // 7. 入：有simple标签拖进free的simple标签，创建editing
        cartStore.createMixtureFromTag(props.direction, dropCartItem)
    }

    if (type === 'before' || type === 'after') {
        const draggingCartItem = draggingNode.data as CartItem
        const dropCartItem = dropNode.data as CartItem
        
        draggingCartItem.level = dropCartItem.level
        draggingCartItem.parent = dropCartItem.parent
    } else if (type === 'inner') {
        if (dropNode.data.level === 'free') {
            // 上边 7 是会改 level 的，所以没有问题
            const draggingCartItem = draggingNode.data as CartChildItem
            const dropCartItem = dropNode.data as CartItemComplex
            draggingCartItem.level = `${dropCartItem.type}Child`
            draggingCartItem.parent = dropCartItem
        }
        // 应该没有别的情况了
    }

    if (draggingNode.data.level === 'free'
        && (draggingNode.data.type === 'tag' || draggingNode.data.type === 'embedding')
        && !draggingNode.data.weight) {
        // 8. 出：alternate和editing移出，需要补一个weight
        draggingNode.data.weight = new Decimal(1)
    }
}

</script>

<template>
    <ElTree
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        :data="dataSource"
        class="cart-tree"
        draggable
        @node-drop="dropPostProcess"
    >
        <template #default="{ node, data }">
            <CartItemComponent :node="node" :data="data" :direction="direction" />
        </template>
    </ElTree>
</template>

