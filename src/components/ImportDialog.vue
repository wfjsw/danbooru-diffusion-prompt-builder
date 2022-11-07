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
import { ElButton, ElDialog, ElInput, ElAlert } from 'element-plus'
import { useCartStore } from '../stores/cart'
import { computed, ref } from 'vue'
import { isDark } from '../composables/dark'
import { parse } from '../prompt/parser'

const cartStore = useCartStore()
const props = defineProps<{
    modelValue: boolean
}>()

const positiveTags = ref('')
const negativeTags = ref('')

const positiveError = ref('')
const negativeError = ref('')

const emit = defineEmits(['update:modelValue'])
const mv = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

function cancel() {
    positiveTags.value = ''
    negativeTags.value = ''
    mv.value = false
}

async function save(newEmphasis: boolean) {
    try {
        await Promise.all([
            (async () => {
                try {
                    parse(positiveTags.value, newEmphasis)
                } catch (e: any) {
                    positiveError.value = e.message
                    throw e
                }
            })(),
            (async () => {
                try {
                    parse(negativeTags.value, newEmphasis)
                } catch (e: any) {
                    negativeError.value = e.message
                    throw e
                }
            })(),
        ])
    } catch (e) {
        return
    }

    cartStore.import('positive', positiveTags.value, newEmphasis)
    cartStore.import('negative', negativeTags.value, newEmphasis)
    mv.value = false
}

function saveOld() {
    cartStore.importClassic('positive', positiveTags.value)
    cartStore.importClassic('negative', negativeTags.value)
    mv.value = false
}
</script>

<template>
    <ElDialog v-model="mv" title="导入标签" width="50%">
        <p>
            注：由于标签格式千变万化，不能保证完全成功导入。
            为确保成功导入，请检查标签之间是否使用逗号隔开且括号双向闭合完全。
        </p>
        <div class="tag-positive">
            <div class="title">正向标签</div>
            <ElInput
                v-model="positiveTags"
                type="textarea"
                :rows="5"
                class="tag-pre"
                placeholder="Prompt" />
            <ElAlert
                v-show="positiveError !== ''"
                :title="positiveError"
                type="error"
                class="parse-error"
                :effect="isDark ? 'dark' : 'light'"
                @close="positiveError = ''" />
        </div>
        <div class="tag-negative">
            <div class="title">反向标签</div>
            <ElInput
                v-model="negativeTags"
                type="textarea"
                :rows="5"
                class="tag-pre"
                placeholder="Negative prompt" />
            <ElAlert
                v-show="negativeError !== ''"
                :title="negativeError"
                type="error"
                class="parse-error"
                :effect="isDark ? 'dark' : 'light'"
                @close="negativeError = ''" />
        </div>
        <template #footer>
            <span class="dialog-footer">
                <ElButton @click="cancel()">取消</ElButton>
                <ElButton type="info" @click="saveOld()">朴素解析器</ElButton>
                <ElButton type="primary" @click="save(false)">解析 NAI 语法</ElButton>
                <ElButton type="primary" @click="save(true)">解析 WebUI 语法</ElButton>
            </span>
        </template>
    </ElDialog>
</template>

<style scoped lang="scss">
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
    margin-bottom: 1.5rem;
}

.parse-error {
    margin-bottom: 1rem;
    :deep(.el-alert__title) {
        white-space: pre-wrap;
        font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
}
</style>
