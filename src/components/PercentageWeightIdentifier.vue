<script lang="ts" setup>
import {computed, useCssModule, ref} from 'vue'
import {ElInput} from 'element-plus'
import Decimal from 'decimal.js-light'

const style = useCssModule()

const props = defineProps<{
    weight: Decimal,
}>()

const emit = defineEmits(['update:weight'])
const oldWeight = ref(props.weight)
const boundWeight = computed({
    get: () => props.weight.times(100).toDecimalPlaces(1).toNumber(),
    set: (value) => {
        emit('update:weight', (new Decimal(value)).div(100))
    }
})
const editMode = ref(false)
const inputBox = ref<typeof ElInput|null>(null)

const computedWeight = computed(() => boundWeight.value?.toFixed(1))
const color = computed(() => style.warning)

function turnOnEditMode() {
    oldWeight.value = new Decimal(props.weight)
    editMode.value = true
    inputBox.value?.focus()
}

function cancelEditMode() {
    emit('update:weight', oldWeight.value)
    editMode.value = false
}
</script>

<template>
    <span :class="[$style.nowrap, color]" @dblclick="turnOnEditMode">
        <span v-show="!editMode">{{ computedWeight }}%</span>
        <ElInput v-show="editMode" ref="inputBox" v-model="boundWeight" :class="$style.edit" size="small" type="number" :min="0"
                 :step="0.1" :max="100" :draggable="false" @blur="editMode = false" @keyup.enter="editMode = false"
                 @keyup.esc="cancelEditMode" @dragstart.stop="false" />
    </span>
</template>

<style module lang="scss">
.warning {
    color: var(--el-color-warning);
}

.success {
    color: var(--el-color-success);
}

.edit {
    display: inline-block;
    width: 96px;
}

.nowrap {
    white-space: nowrap;
}
</style>
