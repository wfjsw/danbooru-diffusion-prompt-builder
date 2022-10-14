<script lang="ts" setup>
import { ref, h } from 'vue'
import { ElSwitch, ElButton } from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
// @ts-ignore
import {faEye, faEyeSlash} from "@fortawesome/pro-light-svg-icons";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import {useSettingsStore} from "../stores/settings";

const settingsStore = useSettingsStore();

const activeIcon = h(FontAwesomeIcon, {icon: faEye})
const inactiveIcon = h(FontAwesomeIcon, {icon: faEyeSlash})

</script>

<template>
    <div class="topbar">
        <div class="left">
            <span class="text-large font-600 mr-3"> Danbooru 标签生成器 </span>
        </div>
        <div class="right split">
            <ElSwitch
                v-model="settingsStore.showImage"
                inline-prompt
                size="large"
                :active-icon="activeIcon"
                :inactive-icon="inactiveIcon"
            />
            <ElSwitch
                v-model="settingsStore.newEmphasis"
                inline-prompt
                size="large"
                active-text="()"
                inactive-text="{}"
            />
            <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder" target="_blank">
                <ElButton link size="large"><FontAwesomeIcon :icon="faGithub" :style="{'scale': '150%'}"/></ElButton>
            </a>
        </div>
    </div>

</template>

<style lang="scss">
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 18px;
    padding-top: 7.5px;

    .left {
        display: block;
        font-size: 18px;
        color: var(--el-text-color-primary);
    }
}
.right.split {
    padding-left: 24px;

    & > * {
        margin-right: 1rem;
    }
}
</style>

