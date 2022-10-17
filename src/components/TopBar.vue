<script lang="ts" setup>
import {h, computed} from 'vue'
import {ElButton, ElInput, ElSwitch, ElTooltip} from "element-plus";
import {Search as IconSearch} from "@element-plus/icons-vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faEye, faEyeSlash, faLightbulbOn, faLightbulbSlash, faShieldCheck, faShieldExclamation} from "@fortawesome/pro-light-svg-icons";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import {faMessageBot, faMagnifyingGlassChart} from "@fortawesome/pro-solid-svg-icons";
import {useSettingsStore} from "../stores/settings";
import {isDark} from '../composables/dark'

const settingsStore = useSettingsStore();

const props = defineProps<{
    search: string,
}>()
const emit = defineEmits(['update:search'])

const searchTerms = computed({
    get: () => props.search,
    set: (value: string) => emit('update:search', value)
})
// ref(props.search)

const activeIcon = h(FontAwesomeIcon, {icon: faEye})
const inactiveIcon = h(FontAwesomeIcon, {icon: faEyeSlash})

const safeIcon = h(FontAwesomeIcon, {icon: faShieldCheck})
const unsafeIcon = h(FontAwesomeIcon, {icon: faShieldExclamation})

const lightIcon = h(FontAwesomeIcon, {icon: faLightbulbOn})
const darkIcon = h(FontAwesomeIcon, {icon: faLightbulbSlash})

</script>

<template>
    <div class="topbar">
        <div class="left">
            <span class="text-large font-600 mr-3"> Danbooru 标签超市 </span>
        </div>
        <div class="right split">
            <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search"
                     placeholder="搜索"/>
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
            <ElTooltip content="GitHub" :show-after="750">
                <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder" target="_blank">
                    <ElButton link size="large">
                        <FontAwesomeIcon :icon="faGithub" :style="{'scale': '150%'}"/>
                    </ElButton>
                </a>
            </ElTooltip>
            <ElTooltip content="Koishi.js NovelAI 插件" :show-after="750">
                <a href="https://bot.novelai.dev" target="_blank">
                    <ElButton link size="large">
                        <FontAwesomeIcon :icon="faMessageBot" :style="{'scale': '150%'}"/>
                    </ElButton>
                </a>
            </ElTooltip>
            <ElTooltip content="法术解析" :show-after="750">
                <a href="https://spell.novelai.dev" target="_blank">
                    <ElButton link size="large">
                        <FontAwesomeIcon :icon="faMagnifyingGlassChart" :style="{'scale': '150%'}"/>
                    </ElButton>
                </a>
            </ElTooltip>
        </div>
    </div>

</template>

<style lang="scss" scoped>
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

.search {
    width: 15rem;
    margin-right: 2rem !important;
}

.restricted-switch {
    --el-switch-on-color: var(--el-color-danger);
    --el-switch-off-color: var(--el-color-success);
}
</style>

