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
import {ElButton, ElTooltip} from 'element-plus'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faCircleMinus, faCirclePlus, faThumbsDown, faThumbsUp, faTrash, faBlender, faRepeat, faScaleUnbalanced, faScaleUnbalancedFlip} from '@fortawesome/pro-regular-svg-icons'
import LiteralWeightIdentifier from './LiteralWeightIdentifier.vue'
import {type CartChildItem, type CartItem, type CartItemSimple, useCartStore, CartItemCompositionChild} from '../stores/cart'
import {useSettingsStore} from '../stores/settings'
import type Node from 'element-plus/es/components/tree/src/model/node'
import {toRefs, inject, computed} from 'vue'
import {setSearch as setSearchSymbol} from '../injections/setSearch'
import PercentageWeightIdentifier from './PercentageWeightIdentifier.vue'
import Decimal from 'decimal.js-light'

const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const props = defineProps<{
    node: Node,
    data: CartItem|CartChildItem,
    direction: 'positive'|'negative',
}>()

const {node, data} = toRefs(props)

function sendTo(direction: 'positive' | 'negative', data: CartItem) {
    const revDirection = direction === 'positive' ? 'negative' : 'positive'
    cartStore.removeCartItem(revDirection, data)
    cartStore.appendCartItem(direction, data)
}

function deleteFrom(direction: 'positive' | 'negative', item: CartItem|CartChildItem) {
    if (item.type === 'tag' || item.type === 'preset' || item.type === 'embedding') {
        if (direction === 'positive') {
            if (item.type === 'preset') {
                cartStore.removePositivePreset(item.category, item.name)
            } else {
                cartStore.removePositiveTag(item.name, item.type)
            }
        } else if (direction === 'negative') {
            if (item.type === 'preset') {
                cartStore.removeNegativePreset(item.category, item.name)
            } else {
                cartStore.removeNegativeTag(item.name, item.type)
            }
        }
    } else if (item.type !== 'null') {
        cartStore.removeCartItem(direction, item)
    }
}

function adjustLiteralWeight(delta: number) {
    if (data.value.type !== 'null') {
        if (settingsStore.useFixedMultiplier || data.value.parent?.type === 'composition') {
            data.value.weight = data.value.weight.add(0.05 * delta)
        } else {
            data.value.weight = data.value.weight.times(Math.pow(settingsStore.newEmphasis ? 1.1 : 1.05, delta))
        }
    }
}

function adjustEditingWeight(delta: number) {
    if (data.value.type === 'editing') {
        const evaluated = new Decimal(data.value.breakpoint).add(0.05 * delta)
        if (evaluated.greaterThanOrEqualTo(0) && evaluated.lessThanOrEqualTo(1)) {
            data.value.breakpoint = data.value.breakpoint.add(0.05 * delta)
        }
    }
}

const setSearch = inject(setSearchSymbol)

function performSearch() {
    if (data.value.type === 'tag' || data.value.type === 'embedding') {
        setSearch?.(data.value.name)
    }
}

const editingChildWeight = computed<Decimal>({
    get() {
        if (data.value.parent?.type === 'editing') {
            const idx = data.value.parent.children.findIndex(child => child === data.value)
            if (idx === 0) {
                return new Decimal(data.value.parent.breakpoint)
            } else {
                return new Decimal(1).minus(data.value.parent.breakpoint)
            }
        } else {
            return new Decimal(0)
        }
    },
    set(value: Decimal) {
        if (data.value.parent?.type === 'editing' && value !== null) {
            const idx = data.value.parent.children.findIndex(child => child === data.value)
            if (idx === 0) {
                data.value.parent.breakpoint = value
            } else {
                // eslint-disable-next-line vue/no-mutating-props
                data.value.parent.breakpoint = new Decimal(1).minus(value)
            }
        }
    }
})

</script>

<template>
    <div class="flex">
        <div class="tag-label">
            <span class="tag-label-text" @dblclick.stop="performSearch">{{ node.label }}</span>
            <LiteralWeightIdentifier v-if="data.type !== 'null' && data.parent?.type !== 'composition'" v-model:weight="data.weight"
                                     class="weight-identifier" />
            <PercentageWeightIdentifier v-if="data.parent?.type === 'editing'" v-model:weight="editingChildWeight" class="weight-identifier" />
            <PercentageWeightIdentifier v-if="data.parent?.type === 'composition'" v-model:weight="(data as CartItemCompositionChild).weight" class="weight-identifier" />
        </div>
        <div class="tag-button">
            <ElTooltip v-if="['tag', 'embedding'].includes(data.type)"
                       content="创建混合组" :show-after="750">
                <ElButton link type="primary"
                          @click.stop="() => (data.type === 'tag' || data.type === 'embedding') && 
                          cartStore.createMixtureFromTag(direction, data as CartItemSimple)">
                    <FontAwesomeIcon :icon="faBlender" />
                </ElButton>
            </ElTooltip>

            <ElTooltip v-if="(data.type === 'editing' || data.type === 'alternate' || data.type === 'composition' || data.type === 'group')
                && data.parent?.type !== 'composition' && cartStore.isMixtureSwitchable(data)" content="切换混合方式" :show-after="750">
                <ElButton link type="primary"
                    @click.stop="(data.type === 'editing' || data.type === 'alternate' || data.type === 'composition' || data.type === 'group')
                    && data.parent?.type !== 'composition'
                    && cartStore.switchMixtureType(direction, data)">
                    <FontAwesomeIcon :icon="faRepeat" />
                </ElButton>
            </ElTooltip>

            <template v-if="data.type === 'editing'">
                <ElTooltip content="断点后移" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="adjustEditingWeight(1)">
                        <FontAwesomeIcon :icon="faScaleUnbalanced" />
                    </ElButton>
                </ElTooltip>
                <ElTooltip content="断点前移" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="adjustEditingWeight(-1)">
                        <FontAwesomeIcon :icon="faScaleUnbalancedFlip" />
                    </ElButton>
                </ElTooltip>
            </template>

            <template v-if="(data.type !== 'null')">
                <ElTooltip content="提高权重" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="adjustLiteralWeight(1)">
                        <FontAwesomeIcon :icon="faCirclePlus" />
                    </ElButton>
                </ElTooltip>
                <ElTooltip content="降低权重" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="adjustLiteralWeight(-1)">
                        <FontAwesomeIcon :icon="faCircleMinus" />
                    </ElButton>
                </ElTooltip>
            </template>


            <template v-if="data.parent === null">
                <ElTooltip v-if="direction === 'positive'" content="转为反向" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="sendTo('negative', data as CartItem)">
                        <FontAwesomeIcon :icon="faThumbsDown" />
                    </ElButton>
                </ElTooltip>
                <ElTooltip v-if="direction === 'negative'" content="转为正向" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="sendTo('positive', data as CartItem)">
                        <FontAwesomeIcon :icon="faThumbsUp" />
                    </ElButton>
                </ElTooltip>
            </template>
            <ElTooltip v-if="!(data.type === 'null')" content="删除" :show-after="750">
                <ElButton link type="danger"
                          @click.stop="data.type !== 'null'
                          && deleteFrom(direction, data)">
                    <FontAwesomeIcon :icon="faTrash" />
                </ElButton>
            </ElTooltip>
        </div>
    </div>
</template>

<style scoped lang="scss">
.flex {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
}

.tag-label-text {
    margin-right: 0.1rem;
}

.tag-label {
    max-width: 160px;
    white-space: normal;
}

.tag-button {
    margin-left: 0.25rem;
    & > * {
        margin-left: 0.25rem;
    }
}

.weight-identifier {
    margin-right: 0.28rem;
}
</style>
