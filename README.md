# 野草大作战

独立的静态网页项目。技术栈是 React、Vite 和 Tailwind CSS，构建结果可以直接部署到 GitHub Pages。

## 本地运行

需要 Node.js 22 和 pnpm 10。

```bash
pnpm install
pnpm dev
```

浏览器打开终端里打印的本地地址。生产包预览：

```bash
pnpm build
pnpm preview
```

## 部署到 GitHub Pages

1. 把这个目录单独推到一个 GitHub 仓库，默认分支用 `main` 或 `master`。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 里，把 **Source** 选成 **GitHub Actions**。
4. 推送到默认分支后，`.github/workflows/pages.yml` 会自动安装依赖、执行 `pnpm build`，并把 `dist` 发布出去。
5. 发布完成后，页面地址是 `https://<用户名>.github.io/<仓库名>/`。

构建使用相对资源路径，所以仓库名不需要写进配置。也可以在 Actions 页面里手动运行 **Deploy GitHub Pages**。

进度、昵称和图鉴只保存在浏览器本地，不需要后端。
