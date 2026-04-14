# 牛马格测验 — GitHub 公开仓库与 Pages

**策略**（对齐 Goja / HLM）：在 **`wbti/` 目录**内用 **Node** 发布——`npm run
release:*`，由 [`scripts/deploy.js`](scripts/deploy.js) 跑测试、更新
[`package.json`](package.json)（**`version`** + **`wbtiBuild`**）、并 **重新生成**
[`js/appVersion.js`](js/appVersion.js)（页脚仍用 **APP_VERSION** / **APP_BUILD**）、
同步到临时 clone 并 **`git push`** 到你在 GitHub 上的**独立公开仓库**。不要用
shell 脚本做 subtree；跨平台只依赖 **Node + git**。

公开仓库推上 `main` 后，由本目录下的
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) 与
[`test.yml`](.github/workflows/test.yml) 负责 Pages 与 CI。

## A. 一次性准备

1. [ ] 在 GitHub 新建仓库（建议带 **README** 初始化，便于首次 `git clone`）。
2. [ ] 默认分支为 **`main`**（与 workflow 一致）。
3. [ ] 本地在 **`wbti/`** 下能跑通 `npm test`。
4. [ ] 配置 **`WBTI_DEPLOY_REMOTE`**（任选其一）：
   - **推荐**：在 `wbti/` 下复制
     [deploy.env.example](deploy.env.example) 为 **`.env.deploy`**（已加入
     `.gitignore`），按你的仓库改 URL。`npm run release:*` 会自动加载该文件。
   - 或在 shell / 系统环境里导出同名变量（**非空则优先于** `.env.deploy`）。
   - 可选：**`WBTI_DEPLOY_DIR`**（clone 目录，默认系统临时目录下的
     `wbti-deploy`）、**`WBTI_DEPLOY_GIT_NAME` / `WBTI_DEPLOY_GIT_EMAIL`**
     （release 提交作者）。

## B. 发布命令（与 HLM 同款语义）

在 **`02product/01_coding/project/wbti`** 下执行：

| 命令 | 行为 |
|------|------|
| `npm run release:build` | **仅** `wbtiBuild + 1`；semver 不变；写回 `package.json` 并生成 `js/appVersion.js`；测试后推送 |
| `npm run release:patch` | semver patch +1、`wbtiBuild` 置 **1**；写回 `package.json` 与 `js/appVersion.js` |
| `npm run release:minor` | minor +1，**wbtiBuild** 置 1 |
| `npm run release:major` | major +1，**wbtiBuild** 置 1 |

若手改 **`package.json`**，请运行 **`npm run generate:app-version`**；**`npm test`**
会断言 `js/appVersion.js` 与 `package.json` 一致。
页脚展示 `v… (build N)` 来自 `js/appVersion.js`（见 [`js/appVersion.js`](js/appVersion.js)）。

脚本内含 **`--confirm`**，避免误触（与 HLM `release:patch` 等一致）。

## C. GitHub Pages 与验证

5. [x] **Settings → Pages → Source** 选 **GitHub Actions**。
6. [x] 推送后等待 **Deploy to GitHub Pages** 成功；已访问  
     `https://<owner>.github.io/<repo>/`。
7. [x] 冒烟：欢迎页可打开；`data/*.json`、`profiles/*.png` 可访问（在线检查）。
8. [x] 已在 [CHANGELOG.md](CHANGELOG.md) 记录线上 URL。

## D. 可选

9. [ ] 自定义域名、分支保护（可选）；许可证当前为 `UNLICENSED`（No License）。

## 风险摘要

- 未设置 **`WBTI_DEPLOY_REMOTE`** 时脚本会立即报错退出。
- 仅改文档时 `deploy-pages` 的 path 过滤可能不触发 → **workflow_dispatch**。
- 首次 Pages 有时需在 **Environments** 里批准 `github-pages`。


