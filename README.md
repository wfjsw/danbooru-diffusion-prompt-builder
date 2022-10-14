# Danbooru 标签排列组合生成器

正式版: https://tags.novelai.dev

测试版: https://tags-dev.novelai.dev

## 开发与改进

### 添加标签或预设

请编辑 `data/tags.yaml` 与 `data/presets.yaml` 文件。
图片应当使用 WebP 格式有损压缩 60~70% 后对应放置于 `/public/demo-images` 文件夹中。

请不要添加儿童色情相关、或违反 GitHub 使用协议的图片到项目中。

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

