# LangGraph Server 子项目 + Nest 网关（PostgreSQL）— 设计说明

**状态：** 待审阅  
**日期：** 2026-04-15  
**范围：** 在现有 pnpm + Turborepo monorepo 中新增官方 **LangGraph Server** 子项目，并由现有 **`apps/backend`**（Nest）作为统一后端网关。部署场景为内网自用，第一阶段不做鉴权；优先落地会话/状态持久化（PostgreSQL）。

---

## 1. 已定决策摘要

| 项 | 选择 |
|----|------|
| 总体方案 | **A：`apps/langgraph-server` 独立运行 + `apps/backend` 作为网关** |
| LangGraph 形态 | **官方 LangGraph Server**（不自研图执行内核） |
| 网关职责 | `apps/backend` 负责路由编排、参数校验、错误标准化、上游调用 |
| 鉴权 | 第一阶段 **不鉴权**（内网信任模型） |
| 优先能力 | **会话/状态持久化优先** |
| 持久化后端 | **PostgreSQL** |
| 前后端调用路径 | Frontend -> Nest 网关 -> LangGraph Server -> PostgreSQL |

---

## 2. 目标

- 在 monorepo 中新增独立 **`apps/langgraph-server`** 子项目并可本地运行。
- 在 **`apps/backend`** 内新增 LangGraph 网关模块，向前端提供稳定 API。
- 建立 `sessionId` 驱动的会话恢复路径，使上下文可在进程重启后继续。
- 保持严格分层：控制器薄、业务逻辑在 service、上游访问集中在 DAL/repository。

---

## 3. 非目标

- 不实现公网访问与复杂鉴权体系（JWT、API Key、RBAC）。
- 不在本阶段引入完整 tracing 平台，仅保留最小可追踪日志字段。
- 不在本阶段引入多租户隔离策略。
- 不修改前端为“直连 LangGraph Server”，统一仍经 Nest 网关。

---

## 4. 架构与目录

```text
apps/
├── backend/
│   └── src/modules/langgraph-gateway/
│       ├── langgraph-gateway.controller.ts
│       ├── langgraph-gateway.service.ts
│       ├── langgraph-client.repository.ts
│       ├── dto/
│       └── mappers/
└── langgraph-server/
    ├── (official LangGraph Server project files)
    └── (runtime/config files for PostgreSQL connection)
```

### 分层边界

- **Controller/Route 层（Nest）**：只做 HTTP 入参校验、调用 service、返回标准响应。
- **Service 层（Nest）**：承载会话编排、幂等键策略、错误语义映射（尽量纯函数化）。
- **DAL/Repository 层（Nest）**：唯一对接 LangGraph Server HTTP API 的层。
- **LangGraph Server 子项目**：负责图执行、状态持久化与恢复。

---

## 5. 数据流与状态持久化

### 会话主键策略

- 网关生成并维护稳定的 **`sessionId`**（UUID）。
- 网关内部维护 `sessionId <-> threadId`（或官方对应会话标识）映射，避免前端耦合底层标识细节。

### 请求主流程

1. 前端提交请求到 Nest 网关。
2. Controller 校验 DTO 后调用 service。
3. Service 组装上游请求，Repository 调用 LangGraph Server。
4. LangGraph Server 将状态/checkpoint 写入 PostgreSQL。
5. 网关返回标准化响应给前端。

### 持久化职责划分

- **LangGraph Server + PostgreSQL**：图状态、执行检查点、上下文恢复。
- **Nest 网关（可选轻索引）**：`sessionId` 映射、业务标签、审计元数据。

该划分避免双写冲突，核心状态以 LangGraph 持久化为准。

---

## 6. 错误处理与稳定性

### 错误分层

- Repository：记录“上游通信事实”（超时、连接失败、上游状态码）。
- Service：映射为领域错误（如 `UpstreamTimeout`、`SessionNotFound`）。
- Controller：转换为稳定 JSON 错误结构，避免泄露上游内部信息。

### 超时与重试

- 网关对上游调用设置可配置超时（例如 10-30s，最终值在实现计划确认）。
- 仅对明确可重试的瞬时错误做有限重试，且请求附带 `requestId` 幂等键。
- 业务语义错误不重试。

### 降级行为

- 上游不可达时返回统一的服务不可用错误，不返回伪成功结果。
- 错误响应需保持字段稳定，便于前端与日志系统处理。

---

## 7. 测试策略与验收标准

### 测试策略

- **单元测试（Nest）**：
  - service：会话映射、幂等键、错误映射纯逻辑；
  - mapper：上游协议到网关 DTO 的映射稳定性；
  - repository：上游 4xx/5xx/超时/网络错误分支。
- **集成测试**：
  - 新建会话；
  - 续聊会话；
  - 上游异常映射。

### 验收标准

1. `apps/langgraph-server` 与 `apps/backend` 能本地同时启动并联通。
2. PostgreSQL 持久化可验证：重启后同一 `sessionId` 能恢复上下文。
3. 网关维持“无鉴权但有输入校验/超时控制/错误标准化”。
4. monorepo 常用任务可通过：`build`、`test`、`lint`（按仓库既有 turbo/pnpm 约定）。

---

## 8. 风险与约束

- 官方 LangGraph Server 的具体 API 路径、配置项、持久化细节需以最新官方文档为准。
- 若官方版本升级导致接口变更，优先在 repository 层收敛变更，避免影响 controller/service 契约。
- 内网无鉴权策略仅适用于受控网络；一旦开放到更广网络，需补充鉴权 spec。

---

## 9. 实现前文档核对要求（强制）

实现前必须通过官方文档再次核对以下事项：

- LangGraph Server 官方启动方式与推荐项目结构；
- PostgreSQL 持久化配置项与会话恢复相关参数；
- 流式响应接口形态与错误语义。

> 注：本轮设计阶段已尝试通过 Context7 拉取 LangGraph JS 文档，但出现连接异常（`Not connected`）。实现前需重新执行官方文档核验并在实现计划中落地为可执行步骤。

---

## 10. 实现计划入口

本 spec 审阅通过后，下一步仅进入 `writing-plans` 流程，生成详细实现计划，不在此文档内展开代码级变更。
