# 雨札 macOS 打包指南

## 重要前提

**macOS 安装包必须在 macOS 系统上构建。** electron-builder 依赖 macOS 特有的工具链（`iconutil`、`codesign` 等），无法在 Windows 上交叉编译 macOS 包。

## 已完成的前置工作

以下修改已全部在项目代码中完成，无需再改：

1. **`main.js`** — 已添加 macOS Dock 图标设置、首次启动 Applications 检测
2. **`package.json`** — 已添加 `mac` 和 `dmg` 打包配置
3. **`assets/icon.iconset/`** — 已生成 macOS 所需的 10 个尺寸图标文件

## 在 macOS 上的打包步骤

### 1. 准备环境

将项目文件夹复制到 macOS 电脑上（U 盘/云盘/Git 均可），确保包含所有文件。

### 2. 安装 Node.js

在 mac 上安装 Node.js 18+：
```bash
# 方式一：官网下载安装包 https://nodejs.org
# 方式二：使用 Homebrew
brew install node
```

### 3. 生成 .icns 图标文件

进入项目目录后执行：
```bash
cd assets/icon.iconset
iconutil -c icns ../icon.icns
```

这会基于 `icon.iconset` 文件夹生成 `assets/icon.icns`。

### 4. 安装依赖并打包

```bash
# 进入项目根目录
cd 雨札客户端

# 安装依赖
npm install

# 打包 macOS DMG 安装包
npm run build-mac
```

打包完成后，`dist/` 目录下会生成：
- `雨札-2.0.0.dmg` — 拖拽安装包（推荐）
- `雨札-2.0.0-mac.zip` — 压缩包
- `雨札-2.0.0-mac/` — 可直接运行的 .app 文件夹

### 5. 分发方式

**DMG（推荐）**：用户双击打开 DMG，将应用图标拖拽到右侧的 Applications 文件夹即可安装。应用随后出现在 Launchpad 和 Dock 中。

**.app 直接分发**：直接将 `雨札.app` 发给用户，用户放到任意位置双击即可运行（macOS 会提示从互联网下载的应用，需在「系统偏好设置 → 安全性与隐私」中允许）。

## 关于桌面图标

macOS 没有 Windows 的「桌面快捷方式」概念。应用安装到 `/Applications` 后，用户可以通过以下方式启动：
- **Launchpad**（四指捏合手势或 Dock 图标）
- **Spotlight**（Cmd+Space 搜索「雨札」）
- **Dock**（右键→选项→保留在 Dock）

如果你确实需要在桌面显示图标，已配置的首次启动检测会自动弹出提示，引导用户将应用移到 Applications 文件夹。

## 常见问题

**Q: 打开应用时提示「无法验证开发者」？**
A: 未签名的 macOS 应用会触发此提示。用户在「系统偏好设置 → 安全性与隐私」中点击「仍要打开」即可。

**Q: 能否上架 Mac App Store？**
A: 当前代码中使用了 `sandbox: true` 和 `contextIsolation: true`，但还需要：
- 申请 Apple Developer 账号（年费 $99）
- 使用有效的代码签名证书
- 调整 `appId` 为反向域名格式
- 修改 `mac.target` 为 `mas`（Mac App Store）
这属于额外工作，当前配置仅适合内部分发。
