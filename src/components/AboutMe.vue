<script lang="ts" setup>
import {ElButton, ElSwitch, ElScrollbar} from "element-plus";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import GithubButton from "vue-github-button";
import {faEye, faEyeSlash, faClipboard, faThumbsDown, faThumbsUp, faLightbulbOn, faLightbulbSlash, faCommentMinus, faCommentPlus, faTrash} from "@fortawesome/pro-light-svg-icons";
import {useSettingsStore} from "../stores/settings";
import {useTagStore} from "../stores/tags";
import {usePresetStore} from "../stores/presets";
import {useEmbeddingStore} from "../stores/embeddings";
import {computed, h} from "vue";
import {isDark} from "../composables/dark";

defineProps<{
    category: undefined
}>()

const settingsStore = useSettingsStore();
const tagStore = useTagStore();
const presetStore = usePresetStore();
const embeddingStore = useEmbeddingStore();

const activeIcon = h(FontAwesomeIcon, { icon: faEye })
const inactiveIcon = h(FontAwesomeIcon, { icon: faEyeSlash })
const lightIcon = h(FontAwesomeIcon, { icon: faLightbulbOn })
const darkIcon = h(FontAwesomeIcon, { icon: faLightbulbSlash })

</script>

<template>
    <h1>关于</h1>
    <ElScrollbar class="scrollable">
        <p>这是一个用于构建 Danbooru 标签组合的网站。</p>
        <p>目前共收录 {{ tagStore.allTagCount }} 个标签，共 {{ tagStore.tagWithPhotosCount }} 个标签有配图。共收录 {{ presetStore.count }} 组预设标签、{{ embeddingStore.count }} 个精修模型。</p>
        <p>本站的源码与所有原始数据均可在
            <a href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder">GitHub: wfjsw/danbooru-diffusion-prompt-builder</a>
            查看。如果您觉得本站对您有帮助，请在 GitHub 上点一个
            <GithubButton href="https://github.com/wfjsw/danbooru-diffusion-prompt-builder" data-icon="octicon-star" data-size="large" data-color-scheme="no-preference: dark; light: light; dark: dark;" data-show-count="true" aria-label="Star wfjsw/danbooru-diffusion-prompt-builder on GitHub">Star</GithubButton>。
            同时，也欢迎您通过 Pull Request 向本站添加更多内容。
        </p>
        <p>如何使用：</p>
        <ul>
            <li>
                <p>在侧边栏中选择一个分类。在分类标签卡片中，您可以点击
                    <span>
                        <ElButton type="success" circle>
                            <FontAwesomeIcon :icon="faThumbsUp"/>
                        </ElButton>
                    </span>
                    将标签添加到正向标签列表，点击
                    <span>
                        <ElButton type="danger" circle>
                            <FontAwesomeIcon :icon="faThumbsDown"/>
                        </ElButton>
                    </span>
                    添加到负向标签列表。点击两次可从列表中移除这个标签。点击
                    <span>
                        <ElButton circle type="primary">
                            <FontAwesomeIcon :icon="faClipboard"/>
                        </ElButton>
                    </span>
                    可将单个标签复制到剪贴板。
                </p>
            </li>
            <li>
                <p>鼠标放置到图片上可解除模糊效果。此外，您可以通过调整右上角第二个开关
                    <span>
                        <ElSwitch
                            v-model="settingsStore.showImage"
                            :active-icon="activeIcon"
                            :inactive-icon="inactiveIcon"
                            inline-prompt
                            size="large"
                        />
                    </span>
                    解除所有图片的模糊效果。
                </p>
            </li>
            <li>
                <p>
                    使用右上角第三个开关
                    <span>
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
                    在购物车中，您可以自由拖动标签，调整前后顺序。位置靠前的标签拥有更高权重。点击
                    <span>
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faCommentPlus"/>
                        </ElButton>
                    </span>
                    按钮将标签权重提升 {{ settingsStore.newEmphasis ? '1.10' : '1.05' }} 倍，
                    点击
                    <span>
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faCommentMinus"/>
                        </ElButton>
                    </span>
                    按钮可将标签权重降低为原先的 {{ settingsStore.newEmphasis ? '90.91' : '95.24' }}%。
                    点击
                    <span>
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faThumbsUp"/>
                        </ElButton>
                        <ElButton link type="primary">
                            <FontAwesomeIcon :icon="faThumbsDown"/>
                        </ElButton>
                    </span>
                    可将标签在正负两个方向之间移动。
                    点击
                    <span>
                        <ElButton link type="danger">
                            <FontAwesomeIcon :icon="faTrash"/>
                        </ElButton>
                    </span>
                    可将标签从购物车中删除。
                </p>
            </li>
            <li>
                <p>
                    使用右上角第一个开关
                    <span>
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

<style scoped>
h1 {
    font-size: 2rem;
}

p {
    line-height: 2rem;
    margin-bottom: 1rem;
}

.scrollable {
    height: calc(100vh - 64px - 20px - 10px - 2rem - 6em);
    overflow-y: auto;
}
</style>
