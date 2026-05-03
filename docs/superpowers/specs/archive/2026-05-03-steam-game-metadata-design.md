# Steam 游戏元信息管理前端与 tRPC BFF - 设计说明

**状态：** 已归档；由 OpenSpec `steam-game-metadata` 能力 spec 继承  
**日期：** 2026-05-03  
**范围：** 在现有 `apps/frontend` 工作区中，将 `Steam 游戏元信息管理` 从占位面板升级为只读的 Steam 游戏元信息检索与详情查看界面。第一版使用 `packages/api` 中的共享 tRPC router，并由前端现有 `/api/trpc` BFF 在进程内执行；BFF 使用写死 mock 数据，不在运行时请求真实 Steam、Nest 后端、后端 `/trpc` upstream 或数据库。

**归档备注：** 该设计记录的是最初的前端本地 mock 版本，后续已被后端委托与 collection flow 覆盖。当前行为以 `openspec/specs/steam-game-metadata/spec.md` 为准。

---

## 1. 背景

现有首页已经默认跳转到 `/data-management/steam-game-metadata`，工作区导航中也已有 `Steam 游戏元信息管理` 入口，但页面主体仍是占位型操作卡片。

本次目标是把这个入口变成可用的后台工具：展示 Steam 游戏列表，支持按 SteamID、英文名、中文名搜索；点击列表项后，在右侧详情面板尽量展示完整游戏元信息。

未来数据量会很大，所以搜索边界应放在共享 API / BFF 层，而不是只在浏览器内过滤。项目已经有 `@pixel-playground/api` 和前端 `/api/trpc` 路由，因此本功能走 tRPC RPC 接口，不新增独立 `/api/steam/*` REST route handlers。

---

## 2. 已定决策

| 项 | 决策 |
|----|------|
| 功能范围 | 只读展示与检索，不做编辑、保存、同步任务 |
| 页面入口 | 继续使用 `/data-management/steam-game-metadata` |
| 详情打开方式 | 列表 + 右侧详情面板 |
| 数据层 | `@pixel-playground/api` 共享 tRPC router，通过前端现有 `/api/trpc` BFF 暴露并在前端服务进程内执行 |
| 搜索位置 | `steam.games` procedure 层搜索，第一版对 mock 数据做内存过滤 |
| mock 数据来源 | 从 Steam `appdetails` 抽取后写死在代码中 |
| 运行时外部调用 | 第一版不运行时调用 Steam，不接真实 Nest 后端，不转发到后端 `/trpc` upstream |
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

实现阶段使用 Steam appdetails API 一次性抽取这些记录，整理为仓库内固定 mock 数据。运行时 tRPC procedures 只读取本地 mock 模块，前端 `/api/trpc` BFF 直接在本进程内返回这些 mock 结果，避免页面依赖 Steam API、Nest 后端、后端 `/trpc` upstream、网络状态或接口限流。

---

## 4. tRPC 契约

### 4.1 列表搜索

`steam.games` query input：

```ts
interface SteamGamesInput {
  q?: string;
  limit?: number;
  cursor?: string;
}
```

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

`steam.detail` query input：

```ts
interface SteamGameDetailInput {
  steamId: string;
}
```

返回单个 `SteamGameDetail`。未找到时抛出稳定 tRPC not-found 错误，错误 code 使用 `STEAM_GAME_NOT_FOUND`。

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
  lastSyncedAt: string;
}
```

### 5.2 详情

```ts
interface SteamGameDetail extends SteamGameSummary {
  shortDescription: string;
  detailedDescription: string;
  categories: string[];
  supportedLanguages: SteamSupportedLanguage[];
  recommendations: number | null;
  screenshots: string[];
  storeUrl: string;
}

interface SteamSupportedLanguage {
  name: string;
  interface: boolean;
  fullAudio: boolean;
  subtitles: boolean;
}
```

字段原则：

- 列表响应只返回足够支撑列表展示的信息，包括 `lastSyncedAt`，用于表格展示同步新鲜度。
- 详情响应返回完整面板所需字段。
- `supportedLanguages` 使用结构化能力数组，不返回 Steam 原始语言描述字符串；前端可按 Interface、Full audio、Subtitles 展示。
- `nameZh` 永远有值；无明确简中名时等于 `nameEn`。
- `sourceLanguageFallback` 用于标记中文名是否从英文回退。

---

## 6. 前端体验

页面继续嵌在现有 Workspace shell 中，主内容替换原占位卡片，展示 Steam 元信息管理工作台。

Steam 元信息工作台应尽量使用 Workspace shell 中可用的完整内容宽度，不再被通用占位页的窄 `max-width` 限制。桌面视口下，页面本身不应成为主要滚动面；列表和详情面板分别使用内部滚动容器，滚动条保持细、轻、不挤占主要水平空间。

列表展示：

- 完整 capsule 缩略图，不裁切关键画面。
- 游戏名合并列：英文名在上，中文名在下，并做视觉层级区分。
- SteamID、发布日期、开发商/发行商、价格或免费状态。
- 平台 icon。
- `lastSyncedAt` 同步新鲜度状态，按时间长短显示不同颜色。

详情面板展示：

- header image、完整 capsule image。
- `nameEn` / `nameZh`、SteamID、metadata status、fallback 状态。
- 开发商、发行商、发布日期、推荐数、`lastSyncedAt`。
- 价格及原价、现价、折扣、货币等内部字段。
- 平台 icon 与平台文本。
- genres、categories、supported languages 完整内容。
- short/detailed description、screenshots、Steam 商店链接。

长文本默认保持可读，不让卡片过度拉伸。短描述和详细描述都使用有边界的阅读容器；内容较长时使用限制高度加内部滚动的方式展示，但滚动条应细且不明显，不挤占主要水平空间。截图区域优先使用换行网格展示，避免横向滚动条。

---

## 7. 文件组织边界

```text
packages/api/src/routers/steam.ts
packages/api/src/steam/steam-game.types.ts
packages/api/src/steam/steam-game.mock.ts
packages/api/src/steam/steam-game-search.ts
apps/frontend/src/components/steam-metadata/steam-metadata-workspace.tsx
apps/frontend/src/components/steam-metadata/steam-game-table.tsx
apps/frontend/src/components/steam-metadata/steam-game-detail-panel.tsx
```

`packages/api/src/routers/_app.ts` 注册 `steam` router，使前端可通过现有 `/api/trpc` 访问。第一版的 `/api/trpc` BFF 必须在前端服务进程内执行 `steam.games` / `steam.detail`，直接返回 mock 数据，不创建 Nest backend client，不转发到后端 `/trpc`。第一版不保留 `apps/frontend/src/app/api/steam/*` 专用 route handlers，除非未来明确需要 REST 兼容。

---

## 8. 测试策略

优先覆盖 `packages/api` 和纯函数：

- SteamID、英文名、中文名搜索。
- 空搜索、`limit`、cursor/pageInfo。
- `steam.detail` 成功与 typed not-found。
- 中文名缺失时回退英文名。

前端测试保持轻量，覆盖 tRPC query input、空结果状态、选中项回退等行为。

验证命令优先级：

```text
pnpm --filter @pixel-playground/api test
pnpm --filter @pixel-playground/frontend test
pnpm lint
pnpm build
```

---

## 9. 非目标

- 不做数据编辑。
- 不做数据持久化。
- 不做真实 Steam 同步任务。
- 不接 Nest 后端、后端 `/trpc` upstream 或数据库。
- 不做认证、权限、审计。
- 不做批量操作、导入导出或队列监控。
- 不新增独立 `/api/steam/*` REST contract。

---

## 10. 验收标准

1. `/data-management/steam-game-metadata` 展示 Steam 游戏元信息工作台，而不是原占位面板。
2. 列表展示 7 个 mock Steam 游戏。
3. 搜索支持 SteamID、英文名、中文名。
4. 搜索由 `steam.games` tRPC procedure 执行，浏览器不直接 import mock 数据进行全量过滤。
5. `steam.games` 和 `steam.detail` 由前端 `/api/trpc` BFF 在本进程内直接读取 mock 数据返回，不依赖 Nest 服务是否启动。
6. 点击列表项后，右侧详情面板通过 `steam.detail` 尽量展示完整元信息。
7. 共享 tRPC 列表和详情接口具有稳定响应契约。
8. 中文名缺失时回退英文名。
9. UI 保持专业后台风格，与现有 Workspace shell 一致。
10. loading、空结果、错误、详情 not found 状态有明确展示。
11. 相关测试通过，至少覆盖 `packages/api` 搜索和详情核心路径。
