# snakehub

`snakehub` 是一个本地中心仓库工具，把 `skills/hooks/rules/agents/commands` 托管到 `~/.snakehub`，并通过链接同步到不同 AI 工具目录，实现一处维护、全局复用。

## 已实现能力

- 核心
  - 初始化中心仓库目录结构
  - 目录内容指纹（Merkle 风格，sha256）
  - 资源导入（目录/单文件）
  - 按内容去重（同类型 + 同指纹复用）
  - 工具扫描（Claude / Cursor / Codex / OpenCow）
  - 链接分发（symlink；Windows 下使用 junction）
  - 链接回滚（恢复备份）
- 仓库导入
  - GitHub/本地 git 仓库导入
  - 多-skill 仓库候选识别（`--list/--select/--all`）
- 本地导入
  - 首次向导（扫描 -> 导入 -> 链接）
  - 手动创建资源（文本创建）
  - 本地路径导入
  - Git 仓库候选浏览与导入
  - 链接管理、路径覆盖管理、回滚操作

## 目录结构

```text
~/.snakehub/
  store/
    skills/
    hooks/
    rules/
    agents/
    commands/
  db/
    state.json
    tool-paths.json
  backups/
  links/
  logs/
```

## CLI 用法

```bash
# 初始化
snakehub init

# 指纹
snakehub fingerprint <path>

# 导入
snakehub import --type skill --from /path/to/skill --name my-skill
snakehub import --type rule --from /path/to/rules --name my-rules
snakehub import --type command --from /path/to/command --name my-command

# Git 导入
snakehub import-git --type skill --repo https://github.com/org/repo --list
snakehub import-git --type skill --repo https://github.com/org/repo --select skills/writing
snakehub import-git --type skill --repo https://github.com/org/repo --all

# 查看
snakehub list
snakehub scan

# 路径规则
snakehub paths
snakehub paths set --tool codex --type hook --path ~/.codex/hooks
snakehub paths set --tool codex --type rule --path ~/.codex/rules
snakehub paths set --tool codex --type command --path ~/.codex/commands
snakehub paths set --tool opencow --type command --path ~/.opencow/capabilities/commands
snakehub paths unset --tool codex --type hook

# 链接与回滚
snakehub link --resource <resource_id_or_name> --tool codex --as my-skill
snakehub link --resource <resource_id_or_name> --tool opencow --as my-skill
snakehub rollback
```

## 作为命令行工具分享

```bash
# 1) 本地先验证
npm run build
node dist/index.js help

# 2) 预览将发布到 npm 的内容（会自动执行 prepack）
npm pack --dry-run

# 3) 发布到 npm（首次需要 npm login）
npm publish
```

发布后团队可直接使用：

```bash
# 全局安装
npm i -g snakehub

# 或免安装直接执行
npx snakehub help
```

## 桌面运行

```bash
npm install
npm run desktop
```

`npm run desktop` 会启动 **Electron 原生桌面壳**（内部拉起本地服务并加载 UI）。

如果你只想用浏览器方式运行：

```bash
npm run desktop:web
```

网页模式默认会启动在 `http://127.0.0.1:4987` 并尝试自动打开浏览器。

说明：
- Web 模式下，所有 git/SSH/文件操作都发生在运行 `desktop:web` 的那台机器上（服务端环境），不是访问网页的客户端机器环境。
- 如需局域网访问，可显式指定 `COWHUB_DESKTOP_HOST=0.0.0.0`。

- 页面入口：`desktop-ui/index.html`
- 桌面服务：`src/desktop/server.ts`
- Electron 壳：`electron-shell/main.js`

## 打包（macOS）

```bash
# 生成 .app 目录（开发验收）
npm run dist:mac:dir

# 生成 zip（推荐）
npm run dist:mac

# 生成 dmg
npm run dist:mac:dmg
```

产物输出目录：`release/`

### mac 签名与公证（notarization）

当前已接入：
- `hardenedRuntime`
- `entitlements`（`electron-shell/entitlements.mac.plist`）
- `afterSign` 公证脚本（`electron-shell/notarize.js`）

你需要准备：
- Apple Developer 证书（Developer ID Application）安装在当前 mac 钥匙串
- 以下三种公证认证方式之一（见模板：`electron-shell/notarize.env.example`）

方式 A（Apple ID）：
```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

方式 B（App Store Connect API Key）：
```bash
export APPLE_API_KEY="/absolute/path/to/AuthKey_XXXXXXXXXX.p8"
export APPLE_API_KEY_ID="XXXXXXXXXX"
export APPLE_API_ISSUER="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

方式 C（Keychain Profile）：
```bash
export APPLE_KEYCHAIN_PROFILE="your-notary-profile"
# 可选
export APPLE_KEYCHAIN="login"
```

然后执行：
```bash
# 推荐，先打 zip 验证签名/公证流程
npm run dist:mac

# 需要 dmg 再执行
npm run dist:mac:dmg
```

说明：
- 如果未配置上述公证凭据，构建会跳过 notarization（会有日志提示）。
- `dmg` 目标对网络依赖更强，偶发失败时可先用 `dist:mac`（zip）。

## 适配器目录

- Claude Code: `~/.claude/{skills,hooks,agents,commands,rules}`
- Cursor: `~/.cursor/{skills,hooks,agents,commands,rules}`
- Codex:
  - 默认启用 `~/.codex/{skills,commands}`
  - `hooks/agents` 默认禁用，可通过 `snakehub paths set` 或可视化页面开启
- OpenCow:
  - 全局目录：`~/.opencow/capabilities/{skills,hooks,agents,commands,rules}`
  - 项目目录：`<project>/.opencow/{skills,hooks,agents,commands,rules}`

## 开发

```bash
npm run build
node dist/index.js help
node dist/desktop/server.js
```
