# snakehub

`snakehub` 是一个本地中心仓库工具，把 `skills/hooks/rules/agents/commands` 托管到 `~/.snakehub`，并通过链接同步到不同 AI 工具目录，实现一处维护、全局复用。

## 下载桌面版（macOS）

找到对应版本，下载其中的dmg（macos）/exe（window）文件即可

- 最新版本（推荐）：[GitHub Releases / latest](https://github.com/yundameng/snakehub/releases/latest)
- 所有历史版本：[GitHub Releases](https://github.com/yundameng/snakehub/releases)

## 已拥有能力

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


## 配套“中心仓库”结构

如果团队使用，建议用git仓库。仓库必须按照平台中目录结构实现：

- skills
  - xxx
  - vue_tools
  - mini_tools
  - api_tools
- rules
  - xxx
  - vue_tools
  - mini_tools
  - api_tools
- hooks
  - xxx
  - vue_tools
  - mini_tools
  - api_tools
- commands
  - xxx
  - vue_tools
  - mini_tools
  - api_tools
- docs

docs是存放技能需要的知识库文件，建议放「不需频繁修改的文件」，将需要频繁修改/不一定要同步给所有人用的文件放到「项目中docs目录下」。


## CLI 用法（此用法只有基础功能）

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

# 生成 dmg（推荐，用于发给他人安装，打开后可拖到 Applications）
npm run dist:mac

# 生成 zip（仅用于调试/分发压缩包）
npm run dist:mac:zip
```

产物输出目录：`release/`

## 打包（Windows）

```bash
# 生成 Windows 安装包（nsis .exe）
npm run dist:win

# 等价命令（显式指定 nsis）
npm run dist:win:nsis

# 生成便携版（portable .exe）
npm run dist:win:portable
```

说明：
- Windows 打包建议在 Windows 环境执行（本地 Windows 或 GitHub Actions Windows runner）。
- 产物同样输出到 `release/`。

### 发布到 GitHub 并提供下载

`release/` 目录继续保持在 `.gitignore` 中，不直接提交到仓库。  
对外下载通过 **GitHub Releases 附件** 提供。

发布步骤：

```bash
# 1) 提交代码（不包含 release/）
git add .
git commit -m "release: v0.1.8"

# 2) 打 tag（工作流监听 v*）
git tag v0.1.8

# 3) 推送分支和 tag
git push origin main
git push origin v0.1.8
```

仓库内已提供自动发布工作流：`.github/workflows/release.yml`  
当你 push `v*` tag 后，GitHub Actions 会自动：
- 在 macOS runner 上执行 `npm ci` + `npm run dist:mac`
- 在 Windows runner 上执行 `npm ci` + `npm run dist:win`
- 将 `release/` 下的 macOS/Windows 安装包及更新元数据上传到对应 GitHub Release

README 下载链接可长期使用：
- `https://github.com/yundameng/snakehub/releases/latest`

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
# 推荐，直接打 dmg 作为对外分发安装包
npm run dist:mac

# 仅在需要 zip 时执行
npm run dist:mac:zip
```

说明：
- 如果未配置上述公证凭据，构建会跳过 notarization（会有日志提示）。
- `dmg` 是 macOS 标准拖拽安装包；只有打开 `.dmg` 才会出现“拖动到 Applications”安装界面。
- `.zip` 解压后是直接运行 `.app`，不会出现“拖动到 Applications”的弹窗或安装引导。

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
