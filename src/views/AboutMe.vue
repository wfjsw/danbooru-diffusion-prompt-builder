<script lang="ts" setup>
import {ElButton, ElSwitch, ElScrollbar} from 'element-plus'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faEye, faEyeSlash, faClipboard, faThumbsDown, faThumbsUp, faLightbulbOn, faLightbulbSlash} from '@fortawesome/pro-light-svg-icons'
import {faCircleMinus, faCirclePlus, faTrash, faThumbsDown as faThumbsDownRegular, faThumbsUp as faThumbsUpRegular} from '@fortawesome/pro-regular-svg-icons'
import {useSettingsStore} from '../stores/settings'
import {useTagStore} from '../stores/tags'
import {usePresetStore} from '../stores/presets'
import {useEmbeddingStore} from '../stores/embeddings'
import {useHypernetworkStore} from '../stores/hypernetworks'
import {h} from 'vue'
import {isDark} from '../composables/dark'

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
const plus = h('span', {class: 'switch-text-icon'}, ['+'])

</script>

<template>
    <ElScrollbar>
        <h1>关于</h1>
        <p>这是一个用于构建 Danbooru 标签组合的网站。</p>
        <p>
目前共收录 {{ tagStore.allTagCount }} 个标签，共 {{ tagStore.tagWithPhotosCount }} 个标签有配图。
            共收录 {{ presetStore.count }} 组预设标签、{{ embeddingStore.count }} 个嵌入模型、{{ hypernetworkStore.count }} 个超网络模型。
</p>
        <p>
本站的源码与所有原始数据均可在
            <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder">GitHub: wfjsw/danbooru-diffusion-prompt-builder</a>
            查看。如果您觉得本站对您有帮助，请在 GitHub 上点一个 Star。
            同时，也欢迎您通过 Pull Request 向本站添加更多内容。
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
</style>
