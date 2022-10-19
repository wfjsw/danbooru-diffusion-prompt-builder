<script setup lang="ts">
import {faGithub} from "@fortawesome/pro-brands-svg-icons";
import {faMessageBot, faMagnifyingGlassChart} from "@fortawesome/pro-solid-svg-icons";
import {ElTooltip, ElButton} from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

</script>

<template>
    <div class="links">
        <ElTooltip content="GitHub" :show-after="750">
            <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faGithub" class="square-icon"/>
                </ElButton>
            </a>
        </ElTooltip>
        <ElTooltip content="Koishi.js NovelAI 插件" :show-after="750">
            <a href="https://bot.novelai.dev" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faMessageBot" class="square-icon"/>
                </ElButton>
            </a>
        </ElTooltip>
        <ElTooltip content="法术解析" :show-after="750">
            <a href="https://spell.novelai.dev" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faMagnifyingGlassChart" class="square-icon"/>
                </ElButton>
            </a>
        </ElTooltip>
    </div>
</template>

<style scoped lang="scss">
.links {
    //display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;

    > * {
        height: 30px;
        width: 30px;
    }
}

.square-icon {
    width: 24px;
    height: 24px;
}
</style>
