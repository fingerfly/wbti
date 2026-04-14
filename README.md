# 职场牛马人格测试（WBTI）

**Workplace「牛马人格」Type Indicator** — 轻量 **16 题**职场梗测验：一张标签 +
几段娱乐向短文。**不是**心理测评。

「牛马人格」是玩梗说法：自嘲打工情境里的不同应对姿势，并非严肃人格分类。

## 设计取向：职场梗 × 轻游戏化

结果页会多一行**娱乐向**标签：`稀有度 · 定位 · 被动`，用语来自通用 RPG
/ MOBA 比喻（开团、蓝条、支线、Replay 等），**不是**任何真实游戏的数值或
IP，也不暗示抽卡概率。截图分享前仍会看到「仅供娱乐」声明。

## 牛马人格的八种角色

测验根据三条轴的得分符号（`+` / `-`）组合成 **8** 种结果，顺序为 **a → b →
c**（隐忍↔爆发、内耗↔外耗、躺平↔卷；细则见评分计划）。下面是每种「格」在
职场语境里的大白话释义，与 [`data/result-catalog.json`](data/result-catalog.json)
（经 [`js/resultTypes.js`](js/resultTypes.js) 加载）中的标题一致。

| 轴组合 | 角色名 | 一句话画像 |
| ------ | ------ | ---------- |
| `+++` | **开麦实干家** | 遇事直球、敢顶敢推；像直播里「当场开麦」，火气与进度条都写在外壳上。 |
| `++-` | **嘴硬脆皮体** | 对外很刚、对内很虚；典型的「嘴硬心软」+ 年轻人爱说的「脆皮」续航。 |
| `+-+` | **职场阴阳师** | 体面包装 + 阴阳技能点满；在忍与刚之间切频道，擅长「文明地发疯」。 |
| `+--` | **闷声拆雷型** | 不爱表演忙碌，关键时候一声不吭把雷拆掉；闷声干大事的变体。 |
| `-++` | **偷感卷王** | 表面云淡风轻，KPI 偷偷往上抬；贴合「偷感很重」的社媒人设梗。 |
| `-+-` | **职场淡人** | 先观察、低反应、慢点燃；小红书语境里的「淡人」，对假忙过敏。 |
| `--+` | **内耗吗喽** | 脑子开会十遍，嘴上说「好的收到」；「吗喽」自嘲打工猴，负责但费睡眠。 |
| `---` | **职场 NPC** | 主动降低存在感、保住能量条；像路人 NPC，不接无效社交和加班支线。 |

轴组合仅用于开发与核对；玩家结果页显示**角色名**、**游戏化副标题**（稀有度
/ 定位 / 被动）与报告正文。

## 内容与配置（`data/`）

母题、变体表、接梗、**八种结果文案**、**进度/分享文案**、**主题色与字体**、
可调参数均在 **[`data/`](data/)** 的 **JSON** 中维护；加载见 `quizPatterns`、
`quizBank`、`quizOptionQuips`、`resultTypes`、`uiCopy`、`themeApply`、`appConfig`。
说明见 [`data/README.md`](data/README.md)。修改后请跑 `npm test`。需支持 **ESM JSON
import**（`import … with { type: 'json' }`）的浏览器；主题在 `app.js` 入口注入到
`<html>`。

## 测验机制（娱乐向）

- **每局随机**：从可扩展 [`js/quizBank.js`](js/quizBank.js) 中 **无放回随机抽 16 题**，
  再洗题序与选项序。当前题库 **320** 条（**16** 母题 × **20** 场景槽；一局内每母题
  至多 1 次，题干互不重复）。抽题后须满足 **三轴覆盖均衡**（见
  [`js/sessionBalance.js`](js/sessionBalance.js) 与 [SPEC.md](SPEC.md) 抽题算法）。
  每题带 `balanceAxis`（`a`/`b`/`c`）用于覆盖计数；新题入库时请设该字段或沿用
  `patternId % 3` 规则。浏览器端随机优先 `crypto.getRandomValues`。
- **题干与选项正文**：仅母题原文；变体用的情境/语气等只在 `variantContext` 元数据
  中维护，**不**拼进 `prompt` 或选项 `text`（界面与读屏只见正文）。**情境标签**
  （如 `scene`）默认不在页面上显示；开发或 A/B 可在 `createQuizView` 传入
  `showVariantScene: true` 打开。
- **完成计数**：`localStorage` 的 `wbti.completionCount` 仍每完整做完一次 +1
  （成就等用），**不再**切换 A/B 卷。
- **接梗文案**：题库仍带 `quip`（数据层保留）；测验页蓝色接梗行默认**不展示**（
  `data/app-config.json` 里 `showOptionQuipDefault`；开发可 `createQuizView(els, {
  showOptionQuip: true })`）。**音效/震动**默认关；欢迎页不再提供开关（`fxSettings`
  仍读写 `localStorage`，需时可自行接 UI）。
- **成就**：本地解锁（`wbti.achievements.v1`），非排行榜、不表示科学性。

## Quick start

```bash
npm install
npm test
```

Open `index.html` in a static server (for example VS Code Live Server or
`npx http-server . -p 8080 -c-1`).

## Docs

- [SPEC.md](SPEC.md) — product requirements
- [DEPLOY.md](DEPLOY.md) — release and Pages deployment flow
- [SECURITY.md](SECURITY.md) — security policy and reporting process

## Local secret hook

Install project-local git hooks once:

```bash
git config core.hooksPath .githooks
```

Hook behavior:

- `.githooks/pre-commit` runs `node scripts/precommitSecretScan.js`
- scans staged text files for obvious secret patterns
- blocks the commit when risky matches are found
- supports narrow exceptions in `.secret-scan-allowlist.json`
  (`filePath` + regex `rule` + required `reason`)
- `.githooks/pre-push` runs `node scripts/prepushPublicGuard.js`
  (blocks tracked `.cursor/`, blocks non-template `.env*`, runs `npm test`)

Manual run:

```bash
npm run secrets:scan-staged
npm run push:guard
```

## Deploy (GitHub Pages)

**约定**（对齐 **Goja / HLM**）：在 **`wbti/`** 目录执行 **Node** 发布，不用 bash /
PowerShell 镜像脚本。设置 **`WBTI_DEPLOY_REMOTE`**（或将 [deploy.env.example](deploy.env.example) 复制为
**`.env.deploy`**）后使用：

```bash
npm run release:patch   # 或 :minor :major :build（均含 --confirm）
```

脚本会跑 **`npm test`**、更新 [`js/appVersion.js`](js/appVersion.js)（**APP_VERSION**
与 **APP_BUILD**，HLM 同款语义）、按需提升 `package.json` 的 `version`（`release:build`
仅递增 build）、将工作区同步到临时 clone 并 `git push` 到你的**公开 GitHub 仓库**
（`main`）。详见 [DEPLOY.md](DEPLOY.md)。

CI 与 Pages **只使用**本目录 [`.github/workflows/`](.github/workflows/)
（`deploy-pages.yml`、`test.yml`）。`deploy-pages.yml` 将 `index.html`、`css/`、`js/`、
`data/`、`profiles/` 打成静态产物（无 Node 构建）。

公开 URL：`https://<user>.github.io/<repo>/`。资源均为相对路径，子路径托管可用。

**Monorepo**：继续在 `00_Mundo` 里开发；发布时进入 **`wbti/`** 执行上述 `npm run
release:*`，目标仓库根即本应用树。

## CI note

[.github/workflows/test.yml](.github/workflows/test.yml) runs when **this folder
is the Git repository root** (after mirror). No separate monorepo-root workflow
is maintained for WBTI. If this folder lives inside a larger monorepo **without**
mirroring, add a repository-root workflow that sets `working-directory` to this
path and the same `npm ci` / test commands.

## License

`UNLICENSED`（No License）。


