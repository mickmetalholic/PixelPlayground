# Steam 游戏元信息管理前端与 BFF — 设计说明

**状态：** 待审阅  
**日期：** 2026-05-03  
**范围：** 在现有 `apps/frontend` 工作区中，将 `Steam 游戏元信息管理` 从占位面板升级为只读的 Steam 游戏元信息检索与详情查看界面。第一版实现前端与 Next BFF 边界，BFF 使用写死 mock 数据，不在运行时请求真实 Steam 或 Nest 后端。

---

## 1. 背景

现有首页已经默认跳转到 `/data-management/steam-game-metadata`，工作区导航中也已有 `Steam 游戏元信息管理` 入口，但页面主体仍是占位型操作卡片。

本次目标是把这个入口变成可用的后台工具：展示 Steam 游戏列表，支持按 SteamID、英文名、中文名搜索；点击列表项后，在右侧详情面板展示较完整的游戏元信息。

未来数据量会很大，所以搜索边界应放在 BFF 层，而不是只在浏览器内过滤。

---

## 2. 已定决策

| 项 | 决策 |
|----|------|
| 功能范围 | 只读展示与检索，不做编辑、保存、同步任务 |
| 页面入口 | 继续使用 `/data-management/steam-game-metadata` |
| 详情打开方式 | 列表 + 右侧详情面板 |
| 数据层 | Next BFF Route Handlers |
| 搜索位置 | BFF 服务端搜索，第一版对 mock 数据做内存过滤 |
| mock 数据来源 | 从 Steam `appdetails` 抽取后写死在代码中 |
| 运行时外部调用 | 第一版不运行时调用 Steam，不接真实 Nest 后端 |
| 中文名策略 | 优先使用简中名称；缺失时 `nameZh` 回退为英文名 |
| UI 风格 | 专业后台、信息密度高、与现有 Workspace shell 和 shadcn/Tailwind 风格一致 |

---

## 3. Mock 数据范围

第一版包含以下 Steam app IDs：

- `1091500`
- `570`
- `578080`
- `2868840`
- `2507950`
- `271590`
- `413150`

实现阶段使用 Steam appdetails API 一次性抽取这些记录：

```text
https://store.steampowered.com/api/appdetails?appids=<steamId>
```

抽取结果整理为仓库内固定 mock 数据。运行时 BFF 只读取本地 mock 模块，避免页面依赖 Steam API 可用性、网络状态或接口限流。

---

## 4. BFF 契约

### 4.1 列表搜索

`GET /api/steam/games?q=&limit=&cursor=`

返回：

```ts
interface SteamGameListResponse {
  items: SteamGameSummary[];
  pageInfo: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
  query: string;
  total: number;
}
```

搜索规则：

- `q` 为空时返回默认列表。
- 匹配字段为 `steamId`、`nameEn`、`nameZh`。
- 英文名和中文名匹配大小写不敏感。
- `limit` 控制返回数量；第一版数据很少，但保留分页形状。
- `cursor` 第一版使用列表结果中的数组偏移量编码；接口形状需方便未来迁移到真实数据源。

### 4.2 详情

`GET /api/steam/games/[steamId]`

返回单个 `SteamGameDetail`。未找到时返回稳定 404 JSON：

```ts
interface SteamGameErrorResponse {
  code: 'STEAM_GAME_NOT_FOUND' | 'STEAM_GAME_QUERY_FAILED';
  message: string;
}
```

---

## 5. 数据模型

### 5.1 列表摘要

```ts
interface SteamGameSummary {
  steamId: string;
  nameEn: string;
  nameZh: string;
  capsuleImage: string;
  headerImage: string;
  releaseDate: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  isFree: boolean;
  priceOverview: SteamPriceOverview | null;
  platforms: SteamPlatforms;
  metadataStatus: 'ready' | 'fallback';
  sourceLanguageFallback: boolean;
}
```

### 5.2 详情

```ts
interface SteamGameDetail extends SteamGameSummary {
  shortDescription: string;
  detailedDescription: string;
  categories: string[];
  supportedLanguages: string;
  recommendations: number | null;
  screenshots: string[];
  storeUrl: string;
  lastSyncedAt: string;
}
```

### 5.3 辅助类型

```ts
interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discountPercent: number;
  finalFormatted: string;
}

interface SteamPlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}
```

字段原则：

- 列表响应只返回足够支撑列表展示的信息。
- 详情响应返回完整面板所需字段。
- `nameZh` 永远有值；无明确简中名时等于 `nameEn`。
- `sourceLanguageFallback` 用于标记中文名是否从英文回退。

---

## 6. 前端体验

### 6.1 页面结构

页面继续嵌在现有 Workspace shell 中：

- 顶部：沿用现有 PixelPlayground header 与工作区一级导航。
- 左侧：沿用现有 Workspace sidebar。
- 主内容：替换原占位卡片，展示 Steam 元信息管理工作台。

主内容采用后台数据工作台布局：

- 标题区：页面标题、记录数、BFF search/mock source 状态。
- 搜索区：搜索输入，支持 SteamID、英文名、中文名。
- 列表区：表格语义呈现游戏摘要。
- 详情区：右侧固定详情面板，展示当前选中游戏的完整信息。

### 6.2 列表

列表展示关键字段：

- 封面缩略图
- 英文名
- 中文名
- SteamID
- 元信息状态
- 发布日期
- 开发商/发行商简要信息
- 价格或免费状态

行交互：

- hover 有边框或背景反馈。
- 当前选中行有明确 selected 状态。
- 点击行更新右侧详情。
- 键盘 focus 可见。
- 所有可点击元素使用 `cursor-pointer`。

### 6.3 详情面板

详情面板展示：

- header image
- capsule image
- `nameEn` / `nameZh`
- SteamID
- 开发商、发行商
- 发布日期
- 价格
- 平台
- 类型、分类
- 推荐数
- 简介与详细描述
- 截图缩略图
- Steam 商店链接
- `lastSyncedAt`
- 中文名 fallback 状态

长文本默认保持可读，不让卡片过度拉伸。详情面板中的详细描述使用限制高度加内部滚动的方式展示，且不得遮挡后续内容。

### 6.4 搜索状态

- 输入 debounce 后请求 BFF 列表接口。
- 搜索词同步到 URL query，刷新后保留搜索上下文。
- loading 时保留旧列表，并显示轻量加载状态。
- 空结果展示清晰空状态。
- BFF 错误展示错误面板和重试按钮。
- 首次进入默认选中第一条结果。
- 搜索结果变化后，如果当前选中项不在结果中，则选中第一条结果；如果没有结果，则详情面板显示空状态。

---

## 7. UI 设计系统约束

使用 `ui-ux-pro-max` 检索结果作为 UI 约束：

- 采用 Data-Dense Dashboard 风格。
- 使用表格/列表表达结构化数据，避免把表格内容做成松散卡片墙。
- 使用紧凑但清晰的间距，优先提升信息可扫读性。
- 沿用现有 `background`、`card`、`border`、`muted`、`primary`、`accent` 主题 token。
- 粉色和青色只作为状态、选中、重点信息点缀。
- 使用 lucide icons，不使用 emoji 作为 UI 图标。
- hover、focus、selected 状态稳定，不引发布局位移。
- 兼容浅色/深色模式。
- 移动端改为单列：列表在上，详情在下或通过锚点展示；不得产生水平滚动。

---

## 8. 文件组织边界

实现计划可以在不改变边界的前提下微调文件名；模块职责按以下结构拆分：

```text
apps/frontend/src/app/api/steam/games/route.ts
apps/frontend/src/app/api/steam/games/[steamId]/route.ts
apps/frontend/src/lib/steam/steam-game.types.ts
apps/frontend/src/lib/steam/steam-game.mock.ts
apps/frontend/src/lib/steam/steam-game-search.ts
apps/frontend/src/components/steam-metadata/steam-metadata-workspace.tsx
apps/frontend/src/components/steam-metadata/steam-game-table.tsx
apps/frontend/src/components/steam-metadata/steam-game-detail-panel.tsx
```

现有 `WorkspaceShell` 不应继续硬编码所有页面主体。`steam-game-metadata` 渲染专门的工作台组件；其他尚未实现的工作区条目继续显示现有占位展示。

---

## 9. 错误处理

BFF：

- 参数非法时返回 400 稳定 JSON。
- 详情 SteamID 不存在时返回 404 稳定 JSON。
- 内部处理失败时返回 500 稳定 JSON。
- 不向客户端返回堆栈或本地路径。

前端：

- 列表请求失败：主列表区域显示错误和重试。
- 详情请求失败：详情面板显示错误和重试。
- 详情 404：显示未找到游戏。
- 图片加载失败：保留稳定占位，避免布局跳动。

---

## 10. 测试策略

优先覆盖 BFF 和纯函数：

- SteamID 搜索命中。
- 英文名搜索命中。
- 中文名搜索命中。
- 空搜索返回默认列表。
- `limit` 限制生效。
- cursor/pageInfo 形状稳定。
- 详情接口存在时返回详情。
- 详情接口不存在时返回 404 JSON。
- 中文名缺失时回退英文名。

前端测试可先保持轻量，覆盖：

- 搜索参数构造。
- 空结果状态。
- 选中项不在结果中时回退到第一条。

验证命令优先级：

```text
pnpm --filter @pixel-playground/frontend test
pnpm lint
pnpm build
```

---

## 11. 非目标

- 不做数据编辑。
- 不做数据持久化。
- 不做真实 Steam 同步任务。
- 不接 Nest 后端或数据库。
- 不做认证、权限、审计。
- 不做批量操作、导入导出或队列监控。

---

## 12. 验收标准

1. `/data-management/steam-game-metadata` 展示 Steam 游戏元信息工作台，而不是原占位面板。
2. 列表展示 7 个 mock Steam 游戏。
3. 搜索支持 SteamID、英文名、中文名。
4. 搜索由 BFF route handler 执行，浏览器不直接 import mock 数据进行全量过滤。
5. 点击列表项后，右侧详情面板展示完整元信息。
6. BFF 列表和详情接口具有稳定响应契约。
7. 中文名缺失时回退英文名。
8. UI 保持专业后台风格，与现有 Workspace shell 一致。
9. loading、空结果、错误、详情 404 状态有明确展示。
10. 相关测试通过，至少覆盖 BFF 搜索和详情核心路径。
