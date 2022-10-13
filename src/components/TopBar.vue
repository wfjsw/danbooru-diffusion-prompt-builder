<script lang="ts" setup>
import { ref, h } from 'vue'
import { ElSwitch } from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
// @ts-ignore
import {faEye, faEyeSlash} from "@fortawesome/pro-light-svg-icons";
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
        <div class="right">
            <ElSwitch
                v-model="settingsStore.showImage"
                class="mt-2"
                style="margin-left: 24px"
                inline-prompt
                :active-icon="activeIcon"
                :inactive-icon="inactiveIcon"
            />
        </div>
    </div>

</template>

<style lang="scss">
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 18px;
    padding-top: 10px;

    .left {
        display: block;
        font-size: 18px;
        color: var(--el-text-color-primary);
    }
}
</style>

