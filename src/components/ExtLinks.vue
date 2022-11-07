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
import { faGithub } from '@fortawesome/pro-brands-svg-icons'
import {
    faMessageBot,
    faMagnifyingGlassChart,
    faHouse,
} from '@fortawesome/pro-solid-svg-icons'
import { ElTooltip, ElButton } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<template>
    <div class="links">
        <ElTooltip content="NovelAI.dev" :show-after="750">
            <a href="https://novelai.dev/" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faHouse" class="square-icon" />
                </ElButton>
            </a>
        </ElTooltip>
        <ElTooltip content="GitHub" :show-after="750">
            <a
                href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder"
                target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faGithub" class="square-icon" />
                </ElButton>
            </a>
        </ElTooltip>
        <ElTooltip content="Koishi.js NovelAI 插件" :show-after="750">
            <a href="https://bot.novelai.dev" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon :icon="faMessageBot" class="square-icon" />
                </ElButton>
            </a>
        </ElTooltip>
        <ElTooltip content="法术解析" :show-after="750">
            <a href="https://spell.novelai.dev" target="_blank">
                <ElButton link size="large">
                    <FontAwesomeIcon
                        :icon="faMagnifyingGlassChart"
                        class="square-icon" />
                </ElButton>
            </a>
        </ElTooltip>
    </div>
</template>

<style scoped lang="scss">
.links {
    display: inline-flex;
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
