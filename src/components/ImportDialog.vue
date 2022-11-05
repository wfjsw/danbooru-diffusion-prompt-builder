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
import {ElButton, ElDialog, ElInput} from 'element-plus'
import {useCartStore} from '../stores/cart'
import {computed, ref} from 'vue'

const cartStore = useCartStore()
const props = defineProps<{
    modelValue: boolean
}>()

const positiveTags = ref('')
const negativeTags = ref('')

const emit = defineEmits(['update:modelValue'])
const mv = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

function cancel() {
    positiveTags.value = ''
    negativeTags.value = ''
    mv.value = false
}

function save() {
    cartStore.import(positiveTags.value, negativeTags.value)
    mv.value = false
}
</script>

<template>
    <ElDialog
        v-model="mv"
        title="导入标签"
        width="50%"
    >
        <p>
注：由于标签格式千变万化，不能保证完全成功导入。
            为确保成功导入，请检查标签之间是否使用逗号隔开、括号双向闭合完全，且括号中间不含逗号。
</p>
        <div class="tag-positive">
            <div class="title">正向标签</div>
            <ElInput v-model="positiveTags" type="textarea" :rows="5" class="tag-pre" placeholder="Prompt" />
        </div>
        <div class="tag-negative">
            <div class="title">反向标签</div>
            <ElInput v-model="negativeTags" type="textarea" :rows="5" class="tag-pre" placeholder="Negative prompt" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="cancel()">取消</ElButton>
            <ElButton type="primary" @click="save()">保存</ElButton>
          </span>
        </template>
    </ElDialog>
</template>

<style scoped>
.tag-positive, .tag-negative {
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
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace
}
</style>
