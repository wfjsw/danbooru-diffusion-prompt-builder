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
import { ElButton, ElDialog, ElTooltip, ElInput } from 'element-plus'
import { useCartStore } from '../stores/cart'
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'

const cartStore = useCartStore()
const props = defineProps<{
    modelValue: boolean
}>()

const { copy: copyPositive, copied: positiveCopied } = useClipboard({
    source: computed(() => cartStore.positiveToString),
})
const { copy: copyNegative, copied: negativeCopied } = useClipboard({
    source: computed(() => cartStore.negativeToString),
})

const emit = defineEmits(['update:modelValue'])
const mv = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})
</script>

<template>
    <ElDialog v-model="mv" title="输出结果" width="50%">
        <div class="tag-positive">
            <div class="title">正向标签</div>
            <ElTooltip :visible="positiveCopied">
                <template #content>
                    <span>已复制到剪贴板</span>
                </template>
                <ElInput
                    v-model="cartStore.positiveToString"
                    type="textarea"
                    :rows="5"
                    class="tag-pre"
                    readonly
                    @dblclick="copyPositive()" />
            </ElTooltip>
        </div>
        <div class="tag-negative">
            <div class="title">反向标签</div>
            <ElTooltip :visible="negativeCopied">
                <template #content>
                    <span>已复制到剪贴板</span>
                </template>
                <ElInput
                    v-model="cartStore.negativeToString"
                    type="textarea"
                    :rows="5"
                    class="tag-pre"
                    readonly
                    @dblclick="copyNegative()" />
            </ElTooltip>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <ElButton @click="mv = false">关闭</ElButton>
            </span>
        </template>
    </ElDialog>
</template>

<style scoped>
.tag-positive,
.tag-negative {
    margin-bottom: 1.5rem;
}

.title {
    font-size: 14pt;
    margin-bottom: 1rem;
}

.tag-pre {
    resize: vertical;
    width: 100%;
    height: 100px;
    font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
</style>
