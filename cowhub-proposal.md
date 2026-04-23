# CowHub 提案（Propose → Confirm）

## 1) 目标与背景

目标：构建一个本地“中心仓库”`~/.cowhub`，统一托管跨项目复用的 AI 工具资源（`skills` / `hooks` / `agents`），并通过软链接机制同步到不同 AI 工具的配置目录，做到“一处维护，全局生效”。

你提出的关键需求：
- 跨工具统一管理与分发
- 首次安装自动扫描本机 AI 工具
- 用目录内容指纹识别“内容相同、路径不同”的资源并建议合并
- 三种导入方式：手动新建、拖拽文件夹、GitHub 仓库导入（含多-skill 仓库内选择）
- 最终形态为桌面端可视化

## 2) 推荐实现路径（主方案）

推荐采用 **“核心引擎 + 桌面壳层”** 的分层架构：

- `cowhub-core`（核心引擎，TypeScript）
  - 目录扫描与工具发现
  - 目录指纹（content hash）
  - 资源导入/去重/登记
  - 链接编排（macOS/Linux: symlink；Windows: junction/symlink）
  - 适配器机制（每个 AI 工具一个 adapter）
- `cowhub-desktop`（桌面端 UI）
  - 首次向导：扫描 -> 发现 -> 去重建议 -> 托管确认
  - 资源页面：新建 / 导入 / 更新 / 链接状态
  - 冲突与健康检查页面

### 技术栈建议

- 后端/核心：Node.js + TypeScript（便于快速迭代和跨平台）
- 桌面端：Tauri + React（体积小、跨平台、系统能力够用）
- 本地数据库：SQLite（记录映射关系、指纹、审计日志）

> 备选：Electron。优点是生态成熟；缺点是包体积和内存占用更高。

## 3) 数据与目录模型

建议 `~/.cowhub` 结构：

```text
~/.cowhub/
  store/
    skills/<resourceId>/...
    hooks/<resourceId>/...
    agents/<resourceId>/...
  links/
    <tool>/<resourceType>/<resourceName> -> (symlink/junction)
  db/cowhub.sqlite
  backups/
  logs/
```

核心数据表（概念）：
- `resources`：资源元信息（类型、名称、来源、版本、指纹）
- `tool_targets`：工具目标路径定义（由 adapter 提供）
- `mappings`：资源与工具目标的映射关系
- `fingerprints`：目录指纹与文件清单
- `operations_log`：导入、链接、回滚操作记录

## 4) 目录指纹与去重策略

### 指纹算法（建议）

使用“目录 Merkle Hash”：
1. 递归收集文件（忽略 `.git`, `node_modules`, `dist`, `.DS_Store` 等）
2. 计算每个文件的 `sha256(content)`
3. 以“规范化相对路径 + 文件 hash”排序拼接
4. 对拼接结果再做 `sha256`，得到目录指纹

### 识别规则

- 指纹相同：判定内容相同（路径不同） -> 提示合并托管
- 名称相同但指纹不同：提示冲突，允许并存或覆盖策略
- 指纹不同但高度相似（可选后续）：显示差异摘要，辅助人工决策

## 5) 导入与创建流程

### A. 手动新建

- UI 输入：类型（skill/hook/agent）、名称、内容（可多文件编辑器）
- 保存后自动写入 `~/.cowhub/store/...`
- 自动建立到选定工具目标的链接

### B. 拖拽本地文件夹

- 拖入后做结构校验与指纹计算
- 若重复则给出“复用已托管版本”选项
- 确认后入库并链接

### C. GitHub 仓库导入

- 支持 URL 粘贴（HTTPS/SSH）
- 拉取后扫描候选 skill/hook/agent 目录
- 若为多 skill 大仓库，展示可选择列表
- 可选择“全部导入”或“仅导入选中项”

## 6) 工具发现与适配器机制

每个 adapter 提供：
- 工具识别条件（可执行文件、配置目录特征）
- 目标目录规则（skills/hooks/agents 的落点）
- 链接能力声明（symlink/junction）
- 健康检查与修复动作

首批建议支持：
- Claude Code
- Cursor
- Codex
- （可扩展）其他兼容工具

## 7) 安全、回滚与可观测性

- 每次“托管接管”前自动备份原目录到 `~/.cowhub/backups`
- 所有链接操作可回滚
- 提供“检查并修复失效链接”
- 操作日志可追溯（谁、何时、对哪个工具做了什么）

## 8) 分阶段落地（建议）

### Phase 1（MVP，2~3 周）
- 核心引擎（扫描、导入、指纹、链接、回滚）
- CLI 先行（便于快速验证）
- 支持 `skill` 类型 + 3 个工具 adapter（Claude Code / Cursor / Codex）

### Phase 2（1~2 周）
- 桌面端壳层 + 首次向导
- 拖拽导入、手动新建 UI
- 冲突处理与健康检查 UI

### Phase 3（1~2 周）
- GitHub 多-skill 选择导入
- hooks/agents 完整支持
- 增量更新、批量同步

## 9) 风险与缓解

- Windows 链接权限差异：优先 junction；必要时提示管理员权限
- 各工具目录规范变化：adapter 版本化 + 健康检查
- 错误托管导致配置损坏：强制备份 + 一键回滚
- 大仓库导入性能：分阶段扫描 + 缓存指纹

## 10) 待你确认后执行的实现范围

建议先执行 **Phase 1 的可运行 MVP**：
- 创建项目骨架（`cowhub-core` + `cowhub-cli`）
- 实现目录指纹、导入、链接、回滚
- 落地 Claude Code / Cursor 两个 adapter
- 给出可直接运行的命令与示例

确认后我会直接开始编码并提交第一版可运行实现。
