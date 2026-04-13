# Changelog

## Unreleased

（暂无）

## 0.2.2 — 2026-04-13

### Added

- **公开仓库**：[fingerfly/wbti](https://github.com/fingerfly/wbti) 首次通过
  `npm run release:patch` 推送至 `main`。
- **线上演示（GitHub Pages）**：启用 Actions Pages 后一般为  
  **https://fingerfly.github.io/wbti/**
- **`.env.deploy`**：可选本地加载 `WBTI_DEPLOY_REMOTE`（见
  [deploy.env.example](deploy.env.example)）；[`scripts/deployEnv.js`](scripts/deployEnv.js)。
- **跨平台发布（Goja/HLM 式）**：[`scripts/deploy.js`](scripts/deploy.js)、
  [`scripts/deployGitOps.js`](scripts/deployGitOps.js)、
  [`scripts/deployLib.js`](scripts/deployLib.js)；`npm run release:build` /
  `release:patch` / `release:minor` / `release:major`（内置 `--confirm`）。
- **GitHub Actions**：`deploy-pages.yml` + `test.yml`；**`package-lock.json`**。
- **部署清单** [DEPLOY.md](DEPLOY.md)（Node 发布流程）。

### Changed

- **许可对齐**：新增仓库根 `LICENSE`（MIT），`package.json` `license` 同步为 `MIT`。
- **Pages 验证**：`https://fingerfly.github.io/wbti/` 已可访问，Actions `Deploy to GitHub Pages` 成功。
- **quizView 拆分**：`quizViewQuestion` / `quizViewResult` / `quizViewScreens` /
  `quizViewOptions` / `quizViewComplete`；配套单元测。
- **部署策略**：公开库由 **`npm run release:*`** 推送（无 bash/PowerShell 镜像脚本）。
- 欢迎页 **welcome-panel** 版式与文案调整（去 WBTI 品牌字样等，见 `ui-copy.json`）。

## 0.2.1 — 2026-04-12

### Changed

- 选项接梗行（`#quiz-quip`）对最终用户默认关闭：`app-config.json` 新增
  `showOptionQuipDefault`（默认 `false`）；`quizView` 仅在开启时展示接梗。

## 0.2.0 — 2026-04-12

### Added

- **`data/` JSON**：`app-config.json`（含成就 storage/手速阈值/夜猫时段）、
  `canonical-questions.json`、`variant-tables.json`、`option-quips.json`、
  **`result-catalog.json`**（八种结果文案）、**`ui-copy.json`**（进度/分享文案）、
  **`theme.json`**（CSS 变量与字体）；`js/appConfig.js`、`js/uiCopy.js`、
  `js/themeApply.js`、`js/deepFreeze.js`；`tests/vitest-setup.js` 注入主题变量；
  `scripts/dump-result-catalog.mjs`；`tests/unit/resultCatalog.test.js`、
  `uiCopy.test.js`。
- Session shuffle: `js/quizSession.js` + per-option `optionId` in `quizData.js`;
  `quizView` 用洗牌后的题集调用 `computeResult`.
- **320 题题库** `js/quizBank.js`：**16** 母题 × **20** 场景变体；每题 `balanceAxis`；
  **`js/sessionBalance.js`** 每局无放回抽 **16** 题，不满足三轴覆盖则替换/重试/
  贪心兜底；再洗牌。母题在 `js/quizPatterns.js`。移除 B 卷与按 completion 切换 A/B。
- 题中 `quip` 接梗、`quiz-quip`；人格化进度 `quizProgressCopy.js`；结果卡随机
  主题 `resultCardTheme.js`；彩蛋 `resultExtras.js`（不影响分型）。
- 本地成就 `achievements.js`；默认关音效/震动 `fxSettings.js`；分享对比句
  `buildCompareBlurb` / `buildShareText(r, url)`。
- Unit tests: `quizSession`, `quizBank`, `sessionBalance`, `resultExtras`,
  `achievements`, `shareText`, `progressState`, `quizView`（情境标签显示开关）。
- Eight cropped portraits under `profiles/profile{typeKey}.png`, split from the
  4×2 `profiles.png` sheet (same grid order as `PROFILE_GRID_ORDER` in
  `js/profileArt.js`); regenerate via `python3 scripts/split_profiles.py`.
- Result `<img>` loads the matching file by `typeKey`; mapping and alt text in
  `js/profileArt.js`; layout in `css/style.css`.

### Changed

- **结果报告**：`result-catalog.json` 改为四段结构化 **`reportSections`**（八种格共用
  同一套小标题）；正文与 `gameSubtitle` 重写；结果页按段渲染（`result-section`），
  分享文案段间空行；`computeResult` 仍导出扁平 `paragraphs` 以兼容旧逻辑。
- **结果页**：移除「娱乐向成就（本地）」提示行；`index.html` / `quizView` 不再挂载
  该段落；`ui-copy.json` 去掉 `achievements` 块；`achievements.js` 仍于完成测验时
  解锁并写入 localStorage。
- **内容与配置外置**：题目/选项、变体表、接梗、**结果目录**、**UI 文案模板**、
  **主题 token** 在 `data/*.json`；`resultTypes` / `shareText` / `quizProgressCopy` /
  `achievements`（阈值与 storage，仍落盘、结果页不展示）数据驱动；`app.js` 启动时
  `applyThemeToRoot()`；`quizPatterns` / `quizBank` / `quizOptionQuips` 仅加载与校验。
- 抽题：同一 `patternId` 每局至多 `⌈n/母题数⌉` 次（16 题、16 母题 → ≤1），一局题干
  互不重复；`variantContext.scene` 默认不在测验区展示（`showVariantScene` 可开）。
- **母题扩至 16**：`js/quizPatterns.js` 新增 q11–q16（跨时区、复盘甩锅、团建、
  工位、事故救火、拖堂站会）；`PATTERN_COUNT` 取自 `CANONICAL_TEN.length`；
  `scripts/gen-quips-p10-p15.mjs` 生成接梗扩展行。
- **选项接梗**：`js/quizOptionQuips.js` 冻结 **16×4×20** 矩阵；每个 (母题, 选项槽)
  下 **20 条 quip 两两不同**；`quizBank` 用 `getOptionQuip(p, oi, v)`，启动时
  `assertOptionQuipsMatrix()`。移除 `BASE_QUIPS` / `QUIP_SUFFIX` / `makeQuip`。
- 场景槽 **10 → 20** / 题库 **100 → 200**（`VARIANTS_PER_PATTERN`、`SCENES` 等
  同步扩表）。
- 题库：`prompt` 与选项 `text` 仅为母题原文；情境标签/语气/选项引导在
  `variantContext`（不拼进题干或选项正文）；测验页**默认不**展示 `scene` 标签。
- 测验随机源默认 `createUniform01()`（优先 `crypto`）；欢迎页说明题面/顺序随机。
- README / SPEC / AGENTS：大题库平衡抽题；结果页与分享文案强化「仅供娱乐、不用于
  招聘/诊断」；README / SPEC / AGENTS 同步。
- `resultExtras`：扩展彩蛋（全选末项、0/3 横跳、极端总分等）。
- Quiz UI: 「题目 / 选项」分区、题干强调块（左色条+浅底）与选项卡片（浅灰底+
  轻阴影）提高层级对比。
- `quizData.js`: prompts/options rephrased with current 网感用语；各选项 a/b/c
  得分与顺序未改。
- UI theme: light-on-white (`css/style.css` tokens); `color-scheme: light`.
- Workspace master plan added under `.cursor/plans/`; scoring child plan links
  README 牛马人格释义.
- README: document eight「牛马人格」roles (axis keys + plain-language blurbs).
- README + `resultTypes.js`: eight role titles refreshed toward current
  网络人设梗（开麦、脆皮、阴阳师、偷感、淡人、吗喽、NPC 等），报告首段略对齐。
- Light gamification: result `gameSubtitle` (稀有度/定位/被动), RPG-flavored
  copy, README design note; share/persist include subtitle; result kicker
  「牛马人格掉落」.

### Fixed

- Playwright e2e welcome heading matcher aligned with「测测你的牛马人格」copy.

## 0.1.0 — 2026-04-12

### Added

- MVP quiz flow: welcome (disclaimer), 10 questions with progress, result card.
- Pure scoring module with eight result profiles and documented tie-break.
- Vitest unit tests for scoring; Playwright e2e for happy path and retake.
- Share (Web Share API) and clipboard copy fallbacks; optional localStorage
  persistence of last result payload.
- Project docs: `README.md`, `AGENTS.md`, scoring child plan under
  `.cursor/plans/`, and optional GitHub Actions workflow.


