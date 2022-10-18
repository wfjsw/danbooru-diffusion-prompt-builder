# Danbooru 标签超市

正式版: https://tags.novelai.dev

测试版: https://tags-dev.novelai.dev

## 开发与改进

### 修改标签或预设

请编辑 `data/tags/*.yaml` 与 `data/presets/*.yaml` 文件。

#### 拓广

添加标签的最低标准是拥有标签的英文名与中文名。

对于标签名，请将下划线替换为空格。请注意不要与其他标签重复。使用 `npm run dupcheck` 或 `yarn dupcheck` 检查是否存在重复问题。

#### 精修

一个优质标签应当拥有配图、说明、别名与 Danbooru Wiki 链接。

图片大小应当尽量符合 512px * 512px 以获得最佳显示效果。
请通过 `npm run importimage <path>` 或 `yarn importimage <path>` 将图片添加到公共目录。
这将会自动裁剪图片并进行适当的压缩。

请不要添加儿童色情相关、或违反 GitHub 使用协议的图片到项目中。

### 上传精修模型 (TI Embeddings)

精修模型只支持最新版图片格式（`Save images with embedding in PNG chunks`）。
为安全起见，暂不接受 `.pt` 模型文件。

`.pt` 格式的模型文件请通过 [这个 Colab 笔记本](https://colab.research.google.com/gist/wfjsw/2b2a26349bef1ce891f6ab4d4fb3030a/convert-pt-embedding-to-png.ipynb) 进行格式转换。

请通过 `npm run importembedding <path>` 或 `yarn importembedding <path>`
将模型图片添加到公共目录。然后，在 `data/embeddings/**/*.yaml` 创建描述文件。

```yaml
# 调用该模型使用的命令 (模型图片左上角尖括号内容)
prompt: victorian-lace
# 模型名称
name: Victorian Lace
# 模型作者
author: Reddit user u/depfakacc
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
# 推荐正向标签
suggestPositive:
  - cute
# 推荐反向标签
suggestNegative:
  - futa
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

- [ ] 手机端响应式布局
- [ ] 性能问题，标签页切换速度太慢
- [ ] Masonry 与许多界面优化 (如 Collapse) 不兼容
