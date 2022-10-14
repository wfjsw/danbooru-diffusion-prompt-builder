<script lang="ts" setup>
import {ref} from 'vue'
import {ElButton, ElDialog} from 'element-plus'

const show = ref(window.document.body.clientWidth < 1024)
</script>

<template>
    <ElDialog
        v-model="show"
        title="寄"
        width="75%"
    >
        <p>该网站在屏幕宽度小于 1024 px 的设备（如手机）上无法正常工作。</p>
        <p><a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder">大佬救救，谢了。</a></p>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="show = false">关闭</ElButton>
          </span>
        </template>
    </ElDialog>
</template>

<style scoped>

</style>
