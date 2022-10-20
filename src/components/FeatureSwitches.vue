<script setup lang="ts">
import {h} from 'vue'
import {isDark} from '../composables/dark'
import {ElSwitch, ElTooltip} from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faEye, faEyeSlash, faLightbulbOn, faLightbulbSlash, faShieldCheck, faShieldExclamation} from "@fortawesome/pro-light-svg-icons";
import {useSettingsStore} from "../stores/settings";

const settingsStore = useSettingsStore();
const activeIcon = h(FontAwesomeIcon, {icon: faEye})
const inactiveIcon = h(FontAwesomeIcon, {icon: faEyeSlash})

const safeIcon = h(FontAwesomeIcon, {icon: faShieldCheck})
const unsafeIcon = h(FontAwesomeIcon, {icon: faShieldExclamation})

const lightIcon = h(FontAwesomeIcon, {icon: faLightbulbOn})
const darkIcon = h(FontAwesomeIcon, {icon: faLightbulbSlash})
</script>

<template>
    <div class="feature-switches">
        <ElTooltip content="暗黑模式" :show-after="750">
            <ElSwitch
                v-model="isDark"
                :active-icon="darkIcon"
                :inactive-icon="lightIcon"
                inline-prompt
                size="large"
            />
        </ElTooltip>
        <ElTooltip content="显示图片" :show-after="750">
            <ElSwitch
                v-model="settingsStore.showImage"
                :active-icon="activeIcon"
                :inactive-icon="inactiveIcon"
                inline-prompt
                size="large"
            />
        </ElTooltip>
        <ElTooltip content="强调类型" :show-after="750">
            <ElSwitch
                v-model="settingsStore.newEmphasis"
                active-text="()"
                inactive-text="{}"
                inline-prompt
                size="large"
            />
        </ElTooltip>
        <ElTooltip content="分级限制" :show-after="750">
            <ElSwitch
                v-model="settingsStore.showRestricted"
                :active-icon="unsafeIcon"
                :inactive-icon="safeIcon"
                inline-prompt
                class="restricted-switch"
                size="large"
            />
        </ElTooltip>
    </div>
</template>

<style scoped lang="scss">
.feature-switches {
    display: inline-flex;
    flex-direction: row;
    gap: 1rem;
}
.feature-switches > .restricted-switch {
    --el-switch-on-color: var(--el-color-danger);
    --el-switch-off-color: var(--el-color-success);
}
</style>
