<font color=red size=16>这是一个存档用Fork!!! 使用到原作者主页去！</font>




<p align="center">
    <img src="public/icon.jpg" width="200" height="200" alt="Logo">
</p>
<div align="center">

# Danbooru 标签超市

https://tags.novelai.dev

</div>

## 主要功能

 - 标签分类、释义与配图
 - 即时搜索
 - 构建标签组合并调配权重
 - 支持调配高级标签工程（[Prompt Editing](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features#prompt-editing) / [Composable-Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui/#:~:text=Composable%2DDiffusion%2C%20a,a%20penguin%20%3A2.2) / [Alternating Words](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Features#alternating-words)）
 - 导入已有标签组合并自动匹配
 - 预设（固定标签组合）整理、说明与配图
 - 嵌入模型索引与下载
 - 超网络模型索引与下载

## 开发与改进

### 修改标签或预设

请编辑 `data/tags/**/*.yaml` 与 `data/presets/**/*.yaml` 文件。

#### 拓广

添加标签的最低标准是拥有标签的英文名与中文名。

对于标签名，请将下划线替换为空格。请注意不要与其他标签重复。使用 `npm run dupcheck` 或
`yarn dupcheck` 检查是否存在重复问题。

##### 标签

```yaml
name: <分类名>
restricted: false # 是否限制级
content:
  tag-name1: # 英文标签
    name: <标签中文名1>
  tag-name2: # 英文标签
    name: <标签中文名2>
```

##### 预设

```yaml
name: <预设分类名>
restricted: false # 是否限制级
content:
  预设中文名:
    description: 预设描述
    content:
      - tag1
      - tag2
```

#### 精修

一个优质标签应当拥有配图、说明、别名与 Danbooru Wiki 链接。

图片大小应当尽量符合 512px * 512px 以获得最佳显示效果。

请通过 `npm run importimage <path>` 或 `yarn importimage <path>` 将图片添加到公共目录。
这将会自动裁剪图片并进行适当的压缩。

使用 `npm run importuncroppedimage <path>` 或 `yarn importuncroppedimage <path>` 
添加的图片将不经裁剪直接加入。适用于宽幅预设演示图。

请不要添加儿童色情相关、或违反 GitHub 使用协议的图片到项目中。

##### 标签

```yaml
name: <分类名>
restricted: false # 是否限制级
content:
  tag-name1: # 英文标签
    name: <标签中文名1>
    description: <标签说明>
    wikiURL: <Danbooru Wiki 链接>
    image: <图片 SHA256>
    restricted: false # 是否限制级
```

##### 预设

```yaml
name: <预设分类名>
restricted: false # 是否限制级
description: <预设分类说明>
content:
  预设中文名:
    description: 预设描述
    content:
      - tag1
      - tag2
    preview: # 预览图片 SHA256 (可选)
      - <hash1>
      - <hash2> 
```

### 上传嵌入模型 (TI Embeddings)

嵌入模型只支持最新版图片格式（`Save images with embedding in PNG chunks`）。
为安全起见，暂不接受 `.pt` 模型文件。

`.pt` 格式的模型文件请通过 [这个 Colab 笔记本](https://colab.research.google.com/gist/wfjsw/2b2a26349bef1ce891f6ab4d4fb3030a/convert-pt-embedding-to-png.ipynb) 进行格式转换。

请通过 `npm run importembedding <path>` 或 `yarn importembedding <path>`
将模型图片添加到公共目录。然后，在 `data/embeddings/**/*.yaml` 创建描述文件。

```yaml
# 调用该模型使用的命令 (模型图片左上角尖括号内容)
prompt: victorian-lace
# 模型名称
name: Victorian Lace
# 模型作者/来源
author: u/depfakacc @ Reddit
# 模型描述
description: "A lace pattern that looks like it was made in the Victorian era."
# 模型分类
category: 未分类
# 该模型对应的主模型名称
modelName: model-aa-waifu
# 该模型对应的主模型 Hash （显示在 WebUI 下拉框中的 Hash）
modelHash: '2037c511'
# 模型图片右下角 v 字符旁的数字
vectorSize: 10
# 模型图片右下角 s 字符旁的数字
steps: 675
# 模型文件的 SHA256 Hash
payloadHash: df0641662fb2fc8190a4508c34926243843484495e6d9b0e500f8a8e409aa84e
# 是否限制级 (可选)
restricted: false
# 推荐正向标签 (可选)
suggestPositive:
  - cute
# 推荐反向标签 (可选)
suggestNegative:
  - futa
```

### 上传超网络模型 (Hypernetworks)

超网络模型的描述文件位于 `data/hypernetworks/**/*.yaml`。

模型的演示图片上传流程与普通标签类似，其他项目与嵌入式模型类似。由于超网络模型本身体积较大，网站服务器与 GitHub 均无法存放，
请将 `.pt` 模型文件上传到我们的 [HuggingFace 模型库](https://huggingface.co/novelai-dev/DDPB-hypernetworks/tree/main)，
并在描述文件中填写文件的下载地址。

```yaml
prompt: demo-model # 模型内置英文名
name: 演示模型 # 模型中文名称
author: John Doe @ Tieba # 模型来源
category: 风景 # 模型分类
modelName: demo model # 该模型对应的主模型名称
modelHash: 'deadbeef' # 该模型对应的主模型 Hash （显示在 WebUI 下拉框中的 Hash）
steps: 2600 # 模型内记录的训练步数

# 模型预览图的 SHA256 Hash (可选)
previewHash: 9b55d1f1a03861c01cd72b4952191660f87c7bc0e9a0dfc4447022852a2be147

# 模型文件的 HuggingFace 下载地址
payloadURL: https://huggingface.co/novelai-dev/DDPB-hypernetworks/resolve/main/demo.pt

# 推荐正向标签 (可选)
suggestPositive:
  - demo tag
# 推荐反向标签 (可选)
suggestNegative:
  - demo tag 2
```

### 开发环境

> 由于使用了部分 Pro 图标，构建该项目将需要 [Font Awesome v6 Pro 授权](https://fontawesome.com/plans)，
> 并连接到 Font Awesome 私有 NPM 服务器。在开发过程中您可以暂时替换为 Free 图标。

```bash
# 安装依赖
yarn
# 启动开发服务器
yarn dev 
# 构建项目
yarn build 
```

### TODO

尚需改进之处：

- [ ] Masonry 与许多界面优化 (如 Collapse) 不兼容
