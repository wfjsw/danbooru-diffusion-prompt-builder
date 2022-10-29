<script setup lang="ts">
import {ElButton, ElTooltip} from 'element-plus'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faCircleMinus, faCirclePlus, faThumbsDown, faThumbsUp, faTrash, faBlender, faRepeat} from '@fortawesome/pro-regular-svg-icons'
import LiteralWeightIdentifier from './LiteralWeightIdentifier.vue'
import {type CartChildItem, type CartItem, useCartStore} from '../stores/cart'
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
    console.log(data)
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
    } else if (item.level === 'free') {
        cartStore.removeCartItem(direction, item)
    }
}

function adjustLiteralWeight(delta: number) {
    if (data.value.type === 'tag' || data.value.type === 'embedding') {
        if (data.value.level === 'free' || data.value.level === 'presetChild') {
            if (settingsStore.useFixedMultiplier) {
                data.value.weight = data.value.weight.add(0.05 * delta)
            } else {
                data.value.weight = data.value.weight.times(Math.pow(settingsStore.newEmphasis ? 1.1 : 1.05, delta))
            }
        } else if (data.value.level === 'compositionChild') {
            data.value.weight = data.value.weight.add(0.05 * delta)
        } else if (data.value.level === 'editingChild') {
            const idx = data.value.parent.children.findIndex(child => child === data.value)
            if (idx === 0) {
                const evaluated = new Decimal(data.value.parent.breakpoint).add(0.05 * delta)
                if (evaluated.greaterThanOrEqualTo(0) && evaluated.lessThanOrEqualTo(1)) {
                    data.value.parent.breakpoint = data.value.parent.breakpoint.add(0.05 * delta)
                }
            } else {
                const evaluated = new Decimal(data.value.parent.breakpoint).sub(0.05 * delta)
                if (evaluated.greaterThanOrEqualTo(0) && evaluated.lessThanOrEqualTo(1)) {
                    data.value.parent.breakpoint = data.value.parent.breakpoint.sub(0.05 * delta)
                }
            }
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
        if (data.value.level === 'editingChild') {
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
        if (data.value.level === 'editingChild' && value !== null) {
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
            <LiteralWeightIdentifier v-if="(data.level === 'free' || data.level === 'presetChild') && (data.type === 'tag' || data.type === 'embedding')"
                                     v-model:weight="data.weight" />
            <PercentageWeightIdentifier v-if="data.level === 'editingChild'" v-model:weight="editingChildWeight" />
            <PercentageWeightIdentifier v-if="data.level === 'compositionChild'" v-model:weight="data.weight" />
        </div>
        <div class="tag-button">
            <ElTooltip v-if="data.level === 'free' && ['tag', 'embedding'].includes(data.type)"
                       content="创建混合组" :show-after="750">
                <ElButton link type="primary"
                          @click.stop="() => data.level === 'free' && (data.type === 'tag' || data.type === 'embedding') &&
                          cartStore.createMixtureFromTag(direction, data)">
                    <FontAwesomeIcon :icon="faBlender" />
                </ElButton>
            </ElTooltip>

            <ElTooltip v-if="data.level === 'free'
                && (data.type === 'editing' || data.type === 'alternate' || data.type === 'composition')
                && cartStore.isMixtureSwitchable(data)" content="切换混合方式" :show-after="750">
                <ElButton link type="primary"
                    @click.stop="data.level === 'free'
                    && (data.type === 'editing' || data.type === 'alternate' || data.type === 'composition')
                    && cartStore.switchMixtureType(direction, data)">
                    <FontAwesomeIcon :icon="faRepeat" />
                </ElButton>
            </ElTooltip>

            <template v-if="(data.level === 'free' || data.level === 'presetChild' || data.level === 'editingChild' || data.level === 'compositionChild')
                && (data.type === 'tag' || data.type === 'embedding')">
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


            <template v-if="data.level === 'free'">
                <ElTooltip v-if="direction === 'positive'" content="转为反向" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="data.level === 'free' && sendTo('negative', data)">
                        <FontAwesomeIcon :icon="faThumbsDown" />
                    </ElButton>
                </ElTooltip>
                <ElTooltip v-if="direction === 'negative'" content="转为正向" :show-after="750">
                    <ElButton link type="primary"
                              @click.stop="data.level === 'free' && sendTo('positive', data)">
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
</style>
