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
import {ElButton, ElSwitch, ElScrollbar} from 'element-plus'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faEye, faEyeSlash, faClipboard, faThumbsDown, faThumbsUp, faLightbulbOn, faLightbulbSlash} from '@fortawesome/pro-light-svg-icons'
import {faCircleMinus, faCirclePlus, faTrash, faThumbsDown as faThumbsDownRegular, faThumbsUp as faThumbsUpRegular, faBlender as faBlenderRegular} from '@fortawesome/pro-regular-svg-icons'
import {useSettingsStore} from '../stores/settings'
import {useTagStore} from '../stores/tags'
import {usePresetStore} from '../stores/presets'
import {useEmbeddingStore} from '../stores/embeddings'
import {useHypernetworkStore} from '../stores/hypernetworks'
import {h} from 'vue'
import { isDark } from '../composables/dark'
import dayjs from 'dayjs'

defineProps<{
    category: undefined
}>()

const settingsStore = useSettingsStore()
const tagStore = useTagStore()
const presetStore = usePresetStore()
const embeddingStore = useEmbeddingStore()
const hypernetworkStore = useHypernetworkStore()

const activeIcon = h(FontAwesomeIcon, { icon: faEye })
const inactiveIcon = h(FontAwesomeIcon, { icon: faEyeSlash })
const lightIcon = h(FontAwesomeIcon, { icon: faLightbulbOn })
const darkIcon = h(FontAwesomeIcon, { icon: faLightbulbSlash })
const ax = h('span', {class: 'switch-text-icon math-style'}, ['a', h('sup', {}, 'x')])
const plus = h('span', { class: 'switch-text-icon' }, ['+'])

const buildTime = dayjs(__BUILD_TIMESTAMP__).format('YYYY-MM-DD HH:mm:ss Z')
const buildType = import.meta.env.PROD ? '生产' : '开发'

</script>

<template>
    <ElScrollbar>
        <h1>关于</h1>
        <p>这是一个用于构建 Danbooru 标签组合的网站。</p>
        <p>
当前版本为 {{ buildTime }} 构建的{{ buildType }}版本。目前共收录 {{ tagStore.allTagCount }} 个标签，共 {{ tagStore.tagWithPhotosCount }} 个标签有配图。
            共收录 {{ presetStore.count }} 组预设标签、{{ embeddingStore.count }} 个嵌入模型、{{ hypernetworkStore.count }} 个超网络模型。
</p>
        <p>
本站的源码与所有原始数据于
            <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder" target="_blank">danbooru-diffusion-prompt-builder @ GitHub</a>
            遵循 GNU AGPL-3.0 协议开放。如果您觉得本站对您有帮助，请在 GitHub 上点一个 Star。
            同时，也欢迎您通过 <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder/issues" target="_blank">GitHub Issues</a> 提出问题建议，
            或通过 <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder/pulls" target="_blank">Pull Request</a> 对本站进行修改或补充。
        </p>
        <p>如何使用：</p>
        <ul>
            <li>
                <p>
在侧边栏中选择一个分类。在分类标签卡片中，您可以点击
                    <span class="inline-control">
                        <ElButton type="success" circle>
                            <FontAwesomeIcon :icon="faThumbsUp" />
                        </ElButton>
                    </span>
                    将标签添加到正向标签列表，点击
                    <span class="inline-control">
                        <ElButton type="danger" circle>
                            <FontAwesomeIcon :icon="faThumbsDown" />
                        </ElButton>
                    </span>
                    添加到负向标签列表。点击两次可从列表中移除这个标签。点击
                    <span class="inline-control">
                        <ElButton circle type="primary">
                            <FontAwesomeIcon :icon="faClipboard" />
                        </ElButton>
                    </span>
                    可将单个标签复制到剪贴板。
                </p>
            </li>
            <li>
                <p>
由于配图中可能包含不适宜工作场合下浏览的内容，请通过调整右上角第二个开关
                    <span class="inline-control">
                        <ElSwitch
                            v-model="settingsStore.showImage"
                            :active-icon="activeIcon"
                            :inactive-icon="inactiveIcon"
                            inline-prompt
                            size="large"
                        />
                    </span>
                    选择是否显示标签配图。
                </p>
            </li>
            <li>
                <p>
                    使用右上角第四个开关
                    <span class="inline-control">
                        <ElSwitch
                            v-model="settingsStore.newEmphasis"
                            active-text="()"
                            inactive-text="{}"
                            inline-prompt
                            size="large"
                        />
                    </span>
                    可在 Stable-Diffusion-WebUI 格式强调符号 <code>()</code> 与
                    NovelAI 格式强调符号 <code>{}</code> 之间进行选择。注意，
                    改变这个选项将会使得每个括号的权重从
                    {{ settingsStore.newEmphasis ? '1.10' : '1.05' }}
                    倍变更为
                    {{ settingsStore.newEmphasis ? '1.05' : '1.10' }}
                    倍。
                </p>
            </li>
            <li>
                <p>
                    在购物车中，您可以自由拖动标签，调整前后顺序。位置靠前的标签拥有更高权重。
                    通过改变右上角第三个开关
                    <span class="inline-control">
                        <ElSwitch
                            v-model="settingsStore.useFixedMultiplier"
                            :active-icon="plus"
                            :inactive-icon="ax"
                            inline-prompt
                            size="large"
                        />
                    </span>
                    可将步进速率在线性变换与指数级变换之间选择。
                    点击
                    <span class="inline-control">
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faCirclePlus" />
                        </ElButton>
                    </span>
                    按钮将标签权重提升 {{ settingsStore.useFixedMultiplier ? '5%' : (settingsStore.newEmphasis ? '1.10' : '1.05') + ' 倍' }}，
                    点击
                    <span class="inline-control">
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faCircleMinus" />
                        </ElButton>
                    </span>
                    按钮可将标签权重降低{{ settingsStore.useFixedMultiplier ? ' 5%' : '为原先的 ' + (settingsStore.newEmphasis ? '90.91' : '95.24') + '%' }}。
                    点击
                    <span class="inline-control">
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faThumbsUpRegular" />
                        </ElButton>
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faThumbsDownRegular" />
                        </ElButton>
                    </span>
                    可将标签在正负两个方向之间移动。
                    点击
                    <span class="inline-control">
                        <ElButton link type="danger">
                            <FontAwesomeIcon :icon="faTrash" />
                        </ElButton>
                    </span>
                    可将标签从购物车中删除。
                </p>
            </li>
            <li>
                <p>
                    通过点击购物车中
                    <span class="inline-control">
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faBlenderRegular" />
                        </ElButton>
                    </span>
                    按键，或将其他标签拖动到某一标签之上，可创建混合组。混合组可无限嵌套。当前应用支持三种混合组：
                </p>
                <ul>
                    <li>
                        <p>
                            <b>标签替换 (<a href="https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features#prompt-editing" target="_blank">Prompt Editing</a>，又名分步渲染): </b>
                            该混合组接受一至两个标签和一个百分数。在百分数所代表的生成步数前，生成引擎将采用组内第一个标签。到达该步数后，生成引擎将自动改为采用组内第二个标签。该标签仅在 Stable-Diffusion-WebUI 格式中可用。
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>标签轮转 (<a href="https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features#alternating-words" target="_blank">Alternating Words</a>): </b>
                            该混合组接受两个或更多标签。在生成过程中，生成引擎将在生成的每一步中依次轮换采用组内的标签。该标签仅在 Stable-Diffusion-WebUI 格式中可用。
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>标签组: </b>
                            单纯的一些标签组成的一个组合。该标签在 Stable-Diffusion-WebUI 格式与 NovelAI 格式中均可用。
                        </p>
                    </li>
                </ul>
            </li>
            <li>
                <p>
                    使用右上角第一个开关
                    <span class="inline-control">
                        <ElSwitch
                            v-model="isDark"
                            :active-icon="darkIcon"
                            :inactive-icon="lightIcon"
                            inline-prompt
                            size="large"
                        />
                    </span>
                    可切换亮色背景。
                </p>
            </li>
            <li>
                <p>
                    关于“导入标签”中提供的两种解析器：
                </p>
                <ul>
                    <li>
                        <p>
                            <b>朴素解析器: </b>
                            旧版手制简易解析器，可用于解析大括号与小括号混合的标签。对于不平衡括号与奇怪符号的容错度较高，少见崩溃，但可能难以解析出准确结果。该解析器无法解析复杂的混合组。
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>WebUI / NAI 语法解析器: </b>
                            使用 Earley DSL 构建的新版语法分析器。支持准确解析复杂语法，但不支持混合括号的情形。容错度较低，可能存在卡死的情况。
                        </p>
                    </li>
                </ul>
                <p>
                    解析时请确保标签之间用逗号隔开，以便准确区分标签边界。括号（包括大括号、中括号、小括号；使用 <kbd>\</kbd> 转义的括号除外）必须与逗号相邻，不支持括号在标签中间的情形。
                </p>
            </li>
        </ul>
    </ElScrollbar>
</template>

<style scoped lang="scss">
h1 {
    font-size: 1.25rem;
}

p {
    line-height: 2rem;
    margin-bottom: 1rem;
}

.scrollable {
    //height: calc(100vh - 64px - 20px - 10px - 2rem - 6em);
    height: 100%;
    overflow-y: auto;
}

.inline-control > div {
    position: relative;
    top: -.75px;
}

a {
    text-decoration: none;
    color: hsl(210, 100%, 62%);
}
</style>
