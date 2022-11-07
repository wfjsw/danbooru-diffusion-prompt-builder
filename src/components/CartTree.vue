<!------------------------------------------------------------------------------
  - Danbooru Diffusion Prompt Builder
  - Copyright (C) 2022  Jabasukuriputo Wang
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -
  ----------------------------------------------------------------------------->

<script setup lang="ts">
import {ElTree} from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import type {AllowDropType, NodeDropType} from 'element-plus/es/components/tree/src/tree.type'
import {type CartItemEditingChild, type CartItemPresetChild, type CartItemSimple, type CartItemComplex, type CartItemEditing, type CartItem, type CartChildItem, useCartStore, type CartItemAlternate} from '../stores/cart'
import CartItemComponent from './CartItem.vue'

const props = defineProps<{
    direction: 'positive'|'negative'
}>()

const cartStore = useCartStore()

function allowDrag() {
    return true
}

function allowDrop(draggingNode: Node, dropNode: Node, type: AllowDropType) {

    // 不能拖到非free node的里边
    // if (dropNode.data.parent !== null && type === 'inner')
    //     return false

    // preset外不能拖进去
    // 1. 不能拖到preset上边
    if (dropNode.data.type === 'preset' && type === 'inner')
        return false

    // 2. 目标是presetChild则只能是本preset中间互相拖
    if (dropNode.data.parent?.type === 'preset' && dropNode.data.parent !== draggingNode.data.parent)
        return false

    // null 标签不能拖出来
    if (draggingNode.data.type === 'null' && dropNode.data.parent !== draggingNode.data.parent)
        return false

    // 不能拖到 null 里去
    if (dropNode.data.type === 'null' && type === 'inner')
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
 * 8. ~~出：alternate和editing移出，需要补一个weight~~ - 这个weight现在不丢了 所以不需要补
 *
 * 最后需要把parent改了，标签类型修正了
 *
 */
function dropPostProcess(draggingNode: Node, dropNode: Node, type: NodeDropType) {
    let skipReParent = false
    if (!dropNode || type === 'none') return
    // // 1. 出：拖出来的是presetChild，需要解散preset
    if (draggingNode.data.parent?.type === 'preset') {
        const draggingCartItem = draggingNode.data as CartItemPresetChild
        if (dropNode.data.parent !== draggingCartItem.parent) {
            cartStore.dismissCartItem(props.direction, draggingCartItem.parent)
        }
    } else if (draggingNode.data.parent?.type === 'editing') {
        const draggingCartItem = draggingNode.data as CartItemEditingChild
        if (draggingCartItem.type !== 'null') {
            // 2. 出：editing拖到只剩一个null，需要删掉这个editing
            if (draggingCartItem.parent.children.every(n => n.type === 'null')) {
                cartStore.removeCartItem(props.direction, draggingCartItem.parent)
                // @ts-expect-error Well, 这里是可能为 1 的，但这不是个合法状态，所以要改
            } else if (draggingCartItem.parent.children.length === 1) {
                // 4. 出：有两个标签的editing拖出一个标签，需要加一个null
                draggingCartItem.parent.children.push({
                    type: 'null',
                    label: '无标签',
                    children: null,
                    parent: draggingCartItem.parent,
                })
            }
        }
    } else if (draggingNode.data.parent?.type === 'alternate'
        || draggingNode.data.parent?.type === 'group') {
        // 6. 出：mixture拖干净，需要删掉mixture
        if (draggingNode.data.parent.children.length === 0) {
            cartStore.removeCartItem(props.direction, draggingNode.data.parent)
        } else if (draggingNode.data.parent?.type !== 'group' && draggingNode.data.parent.children.length === 1) {
            // 除 group 以外剩下一个就解散
            cartStore.dismissCartItem(props.direction, draggingNode.data.parent as CartItemAlternate)
            skipReParent = true
        }
    }


    if (dropNode.data.type === 'editing' && type === 'inner') {
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
    } else if ((dropNode.data.type === 'tag' || dropNode.data.type === 'embedding') && type === 'inner') {
        const dropCartItem = dropNode.data as CartItemSimple
        // 7. 入：有simple标签拖进free的simple标签，创建editing
        cartStore.createMixtureFromTag(props.direction, dropCartItem)
    } else if (dropNode.data.parent?.type === 'editing' && type !== 'inner') {
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
    } 

    if (!skipReParent) {
        if (type === 'before' || type === 'after') {
            const draggingCartItem = draggingNode.data as CartItem
            const dropCartItem = dropNode.data as CartItem

            draggingCartItem.parent = dropCartItem.parent
        } else if (type === 'inner') {
            // 上边 7 是会改 level 的，所以没有问题
            const draggingCartItem = draggingNode.data as CartChildItem
            const dropCartItem = dropNode.data as CartItemComplex
            draggingCartItem.parent = dropCartItem
            // 应该没有别的情况了
        }
    }

    cartStore.convergeToFit(cartStore[props.direction])
}

</script>

<template>
    <ElTree
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        :data="cartStore[props.direction]"
        class="cart-tree"
        draggable
        auto-expand-parent
        @node-drop="dropPostProcess"
    >
        <template #default="{ node, data }">
            <CartItemComponent :node="node" :data="data" :direction="direction" />
        </template>
    </ElTree>
</template>

