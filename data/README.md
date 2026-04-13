# WBTI 数据与配置（`data/`）

内容与可调参数与 **JS 算法代码分离**；修改后请跑 `npm test`。

| 文件 | 用途 |
|------|------|
| `app-config.json` | 一局题数、变体行数、情境标签默认、**选项接梗行**（`showOptionQuipDefault`，默认关）、平局符号、**成就**（storage key、手速阈值、夜猫时段） |
| `canonical-questions.json` | 母题 `patterns[]` |
| `variant-tables.json` | `scenes` / `optLead` / `stemVoice` |
| `option-quips.json` | 接梗矩阵 |
| **`result-catalog.json`** | 八种结果：`title`、`gameSubtitle`、**`reportSections`**（固定四段：`一眼认出你` / `出手风格` / `好处与代价` / `收工口诀`） |
| **`ui-copy.json`** | 进度条文案模板、分享/免责声明 |
| **`theme.json`** | `colorScheme`、`cssVars`（`--bg` 等）、`fontFamily`、`lineHeight` |

## 脚本

- `node scripts/dump-canonical-to-json.mjs` — 排版 `canonical-questions.json`
- `node scripts/dump-result-catalog.mjs` — 从当前加载结果写出 `result-catalog.json`
- `node scripts/dump-option-quips-to-json.mjs` — 排版 `option-quips.json`

## 主题

`css/style.css` 仅保留结构与 `var(--*)` 引用；**色值在 `theme.json`**，由 `app.js` 首行
`applyThemeToRoot()` 注入到 `<html>`。Vitest 通过 `tests/vitest-setup.js` 同步注入，避免
jsdom 下变量未定义。
