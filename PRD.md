# IronSync-3D 智能健身看板与补剂管理系统 — 产品需求文档

## 一、项目背景与 Agent 架构说明

### 1.1 项目概述

IronSync-3D 是一个面向健身爱好者的智能化训练与营养管理平台。项目以可视化数据大屏为核心，整合力量训练记录、补剂库存追踪、饮食情绪关联分析等模块，通过 3D 交互与自动化工具链提升用户的训练管理体验。

### 1.2 核心研发工作流

本项目严格遵循以下迭代管线：

```
PRD（需求定义）
  → Model 设计（数据库表结构 + DTO/VO 定义）
    → 功能 / UI 设计（界面原型 + 交互逻辑）
      → Coding（后端 Controller/Service/DAO + 前端页面）
        → 部署（一键脚本打包 + MySQL 初始化）
          → Playwright 自动化回归（CI/CD 独立流程，UI E2E 校验）
```

每一轮迭代均按此管线推进，确保需求可追溯、功能可测试、部署可重复。Playwright 作为独立于业务代码之外的 CI/CD 环节运行，不嵌入业务后端。

### 1.3 MCP 协议集成方案

MCP（Model Context Protocol）在本项目中充当本地知识源接入协议，用于读取本地 Markdown 格式的饮食与训练日记。

- **接入方式**：Spring Boot 后端直接利用 Java 原生 `java.nio.file` API 配合轻量级 Markdown 解析库（如 flexmark-java），在内部实现对本地笔记目录的树状遍历与全文检索。
- **数据流**：前端搜索请求 → 后端 REST 接口 → Service 层递归扫描指定目录下的 `.md` 文件 → flexmark-java 解析内容 → 匹配结果返回前端。
- **用途**：允许用户检索过往的手写笔记，如某日训练感受、饮食记录等，形成 AI 可理解的上下文。
- **优势**：无额外中间件依赖，架构轻量，部署简单。

### 1.4 Playwright 的定位

Playwright 被确认为本项目唯一的前端 UI 自动化回归测试工具，不参与功能测试或接口测试。

- **执行时机**：每次部署后在 CI/CD 流程中独立执行，不嵌入业务后端进程。
- **覆盖范围**：登录流程、表单提交、页面跳转、3D 画布渲染可用性。
- **结果产出**：生成 HTML 测试报告，存放于 `test-reports/` 目录，供前端只读展示。
- **前端交互**：仅在"自动化测试与设置页"中以 iframe 内嵌方式展示最新报告，不提供触发执行的能力。

### 1.5 架构风格

采用前后端分离的 API 设计：

- **后端**：Spring MVC 提供 RESTful JSON 接口，MyBatis 负责数据持久化。
- **前端**：原生 HTML/CSS/JS 页面通过 Fetch API 调用后端端点，Three.js 负责 3D 场景渲染。
- **通信格式**：统一 JSON 请求 / 响应体（参见第七节）。

---

## 二、6 个主要界面的 UI 设计草图描述

### 2.1 3D 数据大屏主页

| 项目 | 说明 |
|------|------|
| 布局 | 居中全屏 3D 场景，左右两侧为悬浮半透明信息卡片 |
| 3D 场景 | 基于 Three.js 渲染人体模型，配置环境光 + 点光源，摄像机围绕 Y 轴做缓慢自动旋转 |
| 数据联动 | 前端加载完成后调用后端 `/api/training-records/today` 获取当日训练动作列表；根据训练部位（如腿部、下背部、胸部）动态替换人体模型对应 Mesh 的材质颜色，实现训练部位高亮（红色渐变标识当前训练肌群） |
| 左侧卡片 | 今日训练概览 — 显示已完成动作数、总组数、当前 RPE 均值 |
| 右侧卡片 | 热量消耗摘要 — 显示今日已消耗 / 目标热量，环形进度指示 |
| 交互 | 鼠标拖拽可旋转视角；悬停高亮部位弹出该动作今日组数统计；悬停卡片触发展开动画 |

### 2.2 核心训练记录页

| 项目 | 说明 |
|------|------|
| 布局 | 上方为折线图区域，下方为表单 + 历史列表 |
| 折线图 | 使用 ECharts 渲染选定动作的力量趋势（如 1RM 估计值随时间变化） |
| 表单字段 | 动作名称（下拉选择）、重量（kg）、组数、次数、RPE（1-10）、日期 |
| 支持动作 | 杠铃深蹲、罗马尼亚硬拉、卧推、推举、引体向上等 |
| 历史列表 | 分页展示最近记录，支持按动作筛选 |

### 2.3 营养与补剂管家

| 项目 | 说明 |
|------|------|
| 布局 | 顶部搜索/筛选栏，下方为卡片式列表 |
| 卡片内容 | 补剂名称、当前库存量(g/份)、每日消耗量、余量进度条（剩余天数/总天数）、状态标签（充足/偏低/告急） |
| 预置补剂 | 酵母蛋白、分离乳清蛋白、肌酸、甘氨酸镁、维生素 D3、鱼油 |
| 操作 | 每个卡片提供「编辑」与「删除」按钮；右上角有「新增补剂」按钮 |

### 2.4 状态关联分析页

| 项目 | 说明 |
|------|------|
| 布局 | 上方为日期选择器 + 宏量营养素筛选标签，下方为双 Y 轴图表 |
| 图表 | X 轴为日期，左 Y 轴为碳水摄入量(g)，右 Y 轴为情绪评分(1-10) |
| 数据点 | 每日一条记录，含碳水、蛋白质、脂肪、情绪评分与备注 |
| 交互 | 悬停显示详细数据；点击数据点可编辑或删除该日记录 |

### 2.5 MCP 本地日记检索页

| 项目 | 说明 |
|------|------|
| 布局 | 顶部搜索框 + 日期范围筛选，下方为结果列表 |
| 搜索逻辑 | 输入关键词后调用后台 MCP 接口，后端使用 `java.nio.file` 递归遍历本地 Markdown 目录，flexmark-java 解析文件内容，执行全文检索 |
| 结果展示 | 匹配文件路径、文件标题、匹配片段预览（高亮关键词） |
| 交互 | 点击结果条目展开完整内容；支持再次搜索 |

### 2.6 自动化测试与设置页

| 项目 | 说明 |
|------|------|
| 布局 | 左侧报告概览面板，右侧 iframe 报告展示区 |
| 报告概览 | 显示最近一次测试的时间戳、总用例数、通过数、失败数徽章 |
| 报告展示 | 使用 iframe 内嵌 `test-reports/` 目录下最新 HTML 测试报告，只读展示 |
| 说明 | 本页面仅提供测试结果的查阅能力；Playwright 测试执行由独立的 CI/CD 部署脚本驱动，不提供页面内触发按钮 |

### 2.7 身体指标看板（新增）

| 项目 | 说明 |
|------|------|
| 布局 | 上方为折线图区域，右侧为录入表单 |
| 折线图 | 使用 ECharts 渲染体重与体脂率随时间的双轴变化趋势 |
| 表单字段 | 记录日期、体重(kg)、体脂率(%)、备注 |
| 交互 | 支持按时间范围筛选数据；悬停数据点显示详情 |

---

## 三、10 个核心功能点详细说明

### 3.1 3D 场景初始化与数据联动高亮

- **技术**：Three.js r150+，使用 `GLTFLoader` 加载人体模型文件。
- **场景配置**：`Scene` + `PerspectiveCamera` + `WebGLRenderer`；添加环境光（强度 0.6）与两束定向光（主光 + 补光）。
- **动画循环**：`requestAnimationFrame` 驱动，摄像机做 60 秒一周的匀速旋转。
- **数据绑定（核心亮点）**：
  1. 页面加载后调用 `GET /api/training-records/today` 获取当日训练记录。
  2. 定义部位 → Mesh 名称映射表（如杠铃深蹲→腿部 Mesh、罗马尼亚硬拉→下背部 Mesh、卧推→胸部 Mesh）。
  3. 遍历匹配到的 Mesh 节点，将对应材质颜色由默认色切换为红色渐变（`color.setHSL(0, 0.7, 0.5)`），并附加脉动发光动画。
  4. 每日首次加载时若无训练记录，模型保持默认灰色材质，显示"今日尚未记录训练"引导提示。
- **降级处理**：若模型加载失败，显示占位线框人体并输出控制台警告。

### 3.2 训练日志 CRUD

- **后端**：`TrainingRecordController` 暴露 `/api/training-records` 端点，支持 `GET`（分页+筛选）、`POST`（创建）、`PUT`（更新）、`DELETE`（逻辑删除）。
- **MyBatis 动态 SQL**：在 `TrainingRecordMapper.xml` 中使用 `<where>`、`<if>`、`<set>` 标签按条件拼接查询与更新语句。
- **字段校验**：重量 > 0，组数 >= 1，RPE ∈ [1, 10]。

### 3.3 补剂库存预警算法

- **逻辑**：
  1. 计算 `剩余可用天数 = 当前库存(g) / 每日消耗量(g)`。
  2. 状态判定：剩余天数 > 30 → `充足`；7-30 天 → `偏低`；< 7 天 → `告急`。
- **触发**：每次对补剂进行增删改操作后重新计算；前端页面加载时请求最新状态。
- **存储**：`supplement_status` 字段冗余在补剂表中，避免每次查询动态计算。

### 3.4 饮食情绪关联记录

- **数据模型**：每日一条，字段包括日期、碳水(g)、蛋白质(g)、脂肪(g)、情绪评分(1-10)、备注。
- **接口**：`/api/diet-mood` 支持按日期范围查询与单日创建/更新。
- **前端图表**：使用 ECharts 双 Y 轴折线图，支持图例切换显示/隐藏。

### 3.5 MCP 协议集成开发（轻量化方案）

- **技术选型**：Spring Boot 后端直接使用 Java 标准库 + flexmark-java 轻量级 Markdown 解析库，无需引入 Node.js 中间层。
- **目录配置**：在 `application.yml` 中通过 `ironsync.mcp.diary-path` 配置本地 Markdown 笔记目录路径。
- **核心逻辑（`McpDiaryService`）**：
  1. `treeWalk()` — 使用 `Files.walk()` 递归遍历配置目录下的所有 `.md` 文件。
  2. `search(keyword)` — 对每个文件使用 `Files.readString()` 读取内容，利用 flexmark-java 的 `Parser` 解析为 AST，提取纯文本后进行关键词模糊匹配。
  3. `getContext(filePath)` — 读取指定文件的完整解析内容返回。
- **REST 接口**：`GET /api/mcp/search?q=keyword` — 返回匹配文件列表、摘要片段和匹配行位置。
- **安全性**：校验 `filePath` 参数不可穿越出配置的根目录（防止路径遍历攻击）。

### 3.6 Playwright 自动化编排（独立 CI/CD 流程）

- **测试脚本目录**：`test/e2e/`，独立于后端项目代码之外。
- **核心用例**：
  1. 登录流程：导航至登录页 → 输入凭据 → 验证跳转至主页。
  2. 训练记录提交：进入训练页 → 填充表单 → 提交 → 验证历史列表出现新记录。
  3. 补剂卡片渲染：进入补剂页 → 验证补剂卡片数量 > 0。
  4. 3D 场景加载：进入主页 → 验证 canvas 元素存在，并验证训练部位高亮 Mesh 颜色变化。
- **执行方式**：由部署脚本 `deploy/run-e2e.sh` 在 CI/CD 环节调用，生成 HTML 报告至 `test-reports/`。
- **嵌入机制**：通过 iframe 方式在"自动化测试与设置页"展示最新报告结果。

### 3.7 DTO 数据校验拦截

- **技术**：Spring `@Valid` + `BindingResult` + 全局 `@RestControllerAdvice` 异常处理。
- **校验规则**：
  - 身体数据：身高 50-250 cm，体重 20-300 kg。
  - 训练参数：重量 1-999 kg，RPE 1-10，组数 1-50。
  - 日期：不可为未来日期（训练/饮食记录）。
- **错误响应**：统一返回 `{ code: 400, message: "...", errors: [...] }`。

### 3.8 RESTful 接口统一响应封装

- **响应结构**：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1715000000000
}
```

- **异常响应**：

```json
{
  "code": 4xx/5xx,
  "message": "描述",
  "errors": ["字段1: 错误原因", "字段2: 错误原因"]
}
```

- **实现**：自定义 `Result<T>` 泛型类 + `GlobalExceptionHandler`。

### 3.9 可视化报表渲染

- **库**：ECharts 5.x。
- **报表列表**：
  1. 力量增长趋势折线图（X=日期，Y=1RM 估计值，每条线代表一个动作）。
  2. 补剂库存余量横向条形图。
  3. 饮食情绪双 Y 轴关联图。
  4. 每周总训练量柱状图（组数 × 重量 × 次数 之和）。
  5. 体重与体脂率变化趋势图（基于 `body_metrics` 时序数据，双 Y 轴）。
- **数据源**：全部通过 REST 接口从后端获取 JSON。

### 3.10 部署脚本自动化生成

- **一键打包脚本** `deploy/build.sh`（Windows 对应 `deploy/build.bat`）：
  1. Maven 打包：`mvn clean package -DskipTests`。
  2. 将 WAR/JAR 输出至 `deploy/` 目录。
- **数据库初始化脚本** `deploy/init-db.sql`：
  1. 创建数据库 `ironsync_3d`。
  2. 建立所有业务表（training_record、supplement、diet_mood、body_metrics 等）。
  3. 插入预置补剂基础数据。
- **Playwright 回归脚本** `deploy/run-e2e.sh`（CI/CD 独立执行）：
  1. 安装 Playwright 浏览器依赖。
  2. 执行全部测试脚本。
  3. 输出 HTML 测试报告至 `test-reports/` 目录，供前端 iframe 只读展示。

---

## 四、数据库模型设计建议

### 4.1 表结构概览

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `training_record` | 训练记录 | id, action_name, weight_kg, reps, sets, rpe, record_date, deleted |
| `supplement` | 补剂库存 | id, name, current_stock_g, daily_consumption_g, status, created_at |
| `diet_mood` | 饮食情绪 | id, record_date, carbs_g, protein_g, fat_g, mood_score, note |
| `body_metrics` | 身体指标（时序） | id, record_date, weight_kg, body_fat_percentage, note |
| `user_profile` | 用户信息 | id, height_cm, goal, created_at |

> 变更说明：`user_profile` 中不再包含静态的 `weight_kg` 字段。体重数据移至 `body_metrics` 表作为时序数据管理，支持历史趋势追踪与可视化。体脂率可选录入。

### 4.2 索引建议

- `training_record(record_date, action_name)` 复合索引用于趋势查询。
- `diet_mood(record_date)` 唯一索引用于每日一条约束。
- `body_metrics(record_date)` 唯一索引用于每日一条约束。

---

## 五、API 接口清单（概要）

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 训练记录 | GET | `/api/training-records` | 分页查询，支持按动作/日期筛选 |
| 训练记录 | GET | `/api/training-records/today` | 获取当日训练记录（供 3D 大屏数据联动） |
| 训练记录 | POST | `/api/training-records` | 新增训练记录 |
| 训练记录 | PUT | `/api/training-records/{id}` | 更新记录 |
| 训练记录 | DELETE | `/api/training-records/{id}` | 逻辑删除 |
| 补剂 | GET | `/api/supplements` | 列表查询 |
| 补剂 | POST | `/api/supplements` | 新增补剂 |
| 补剂 | PUT | `/api/supplements/{id}` | 更新补剂 |
| 补剂 | DELETE | `/api/supplements/{id}` | 删除补剂 |
| 补剂 | GET | `/api/supplements/status` | 获取所有补剂预警状态 |
| 饮食情绪 | GET | `/api/diet-mood` | 按日期范围查询 |
| 饮食情绪 | POST | `/api/diet-mood` | 创建/更新 |
| 身体指标 | GET | `/api/body-metrics` | 按日期范围查询体重/体脂率时序数据 |
| 身体指标 | POST | `/api/body-metrics` | 创建/更新当日身体指标 |
| MCP 日记 | GET | `/api/mcp/search?q=keyword` | 搜索本地 Markdown 日记（java.nio.file + flexmark 实现） |
| 测试报告 | GET | `/api/test/report/latest` | 获取最近一次 Playwright 测试报告的元数据（时间戳/通过数/失败数） |

---

## 六、非功能需求

1. **性能**：3D 页面首屏加载时间 ≤ 3 秒（CDN 加载 Three.js 及模型）；列表接口响应 ≤ 500 ms。
2. **兼容性**：前端兼容 Chrome / Edge 最新两个大版本；不要求 IE。
3. **安全**：DTO 层做输入校验；防止 SQL 注入（MyBatis 参数绑定）；限制 MCP 文件读取路径范围，拒绝路径穿越。
4. **可维护性**：后端遵循三层架构，包名 `com.ironsync.*`；前端 JS 按模块拆分文件。
