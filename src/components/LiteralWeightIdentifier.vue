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

<script lang="ts" setup>
import { computed, useCssModule, ref } from 'vue'
import { ElInput } from 'element-plus'
import Decimal from 'decimal.js-light'

const style = useCssModule()

const props = defineProps<{
    weight: Decimal
}>()

const emit = defineEmits(['update:weight'])
const oldWeight = ref(props.weight)
const boundWeight = computed({
    get: () => props.weight.toDecimalPlaces(3).toNumber(),
    set: (value) => {
        emit('update:weight', new Decimal(value))
    },
})
const editMode = ref(false)
const inputBox = ref<typeof ElInput | null>(null)

const computedWeight = computed(() => props.weight?.toFixed(3))
const color = computed(() =>
    props.weight.gte(1) ? style.success : style.warning
)

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
    <span
        v-if="boundWeight !== 1"
        :class="[$style.nowrap, color]"
        @dblclick="turnOnEditMode">
        <span v-show="!editMode">x{{ computedWeight }}</span>
        <ElInput
            v-show="editMode"
            ref="inputBox"
            v-model="boundWeight"
            :class="$style.edit"
            size="small"
            type="number"
            :min="0"
            :step="0.001"
            :draggable="false"
            @blur="editMode = false"
            @keyup.enter="editMode = false"
            @keyup.esc="cancelEditMode"
            @dragstart.stop="false" />
    </span>
</template>

<style module lang="scss">
.warning {
    color: #cc9900;
}

.success {
    color: #4eb183;
}

.edit {
    display: inline-block;
    width: 96px;
}

.nowrap {
    white-space: nowrap;
}
</style>
