---

# MISUB - 现代化订阅管理工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)]()

MISUB 是一个现代化的订阅管理工具，旨在帮助用户轻松管理各种网络协议。通过简洁直观的界面和强大的后台支持，用户可以高效地管理订阅信息，并进行安全的身份验证。

## 功能特性

- **管理员登录**: 通过密码保护确保系统安全。
- **订阅管理**: 支持多种网络协议（如 Clash、Vmess 等）的订阅管理。
- **响应式设计**: 完美适配桌面和移动端设备。
- **Cloudflare Pages 部署**: 使用 Cloudflare Pages 提供高性能和高可用性服务。
- **现代化技术栈**: 基于 Vue.js 和 Vite 构建，结合 Tailwind CSS 实现优雅的 UI。

## 技术栈

- **前端**: Vue.js, Vite, Tailwind CSS
- **后端**: Cloudflare Workers
- **状态管理**: Vuex 或 Pinia（根据实际代码实现）
- **构建工具**: Vite
- **依赖管理**: pnpm

## 部署到 Cloudflare Pages

1. 登录到 [Cloudflare 控制面板](https://dash.cloudflare.com/)。
2. 进入 **Pages** 部分并点击 **Create a project**。
3. 按照提示连接你的 GitHub 仓库并选择 `misub` 项目。
4. 在部署完成后，进入 **Settings** > **Environment Variables** 添加以下变量：
   - `ADMIN_PASSWORD`: 设置为你想要的管理员密码。
   - `COOKIE_SECRET`: 使用一个随机生成的 32 位字符串（例如：`openssl rand -hex 16`）。

5. 创建 KV 命名空间:
   - 进入 **Workers & Pages** > **KV**。
   - 创建一个新的命名空间，命名为 `MISUB_KV`。

6. 重新部署项目以应用更改。

## 目录结构

```
.
├── functions            # Cloudflare Workers 无服务器函数
│   └── [[path]].js      # 动态路由处理
├── src                  # 源码目录
│   ├── assets           # 静态资源
│   ├── components       # Vue 组件
│   ├── icons            # 图标组件
│   ├── lib              # 核心逻辑和工具
│   ├── App.vue          # 主应用组件
│   └── main.js          # 应用入口文件
├── index.html           # 应用入口 HTML
├── package.json         # 项目依赖和脚本
├── pnpm-lock.yaml       # 锁定依赖版本
├── vite.config.js       # Vite 配置文件
└── wrangler.toml        # Cloudflare Workers 配置
```

## 贡献指南

欢迎贡献！如果你有任何问题或建议，请提交 issue 或 pull request。请遵循以下步骤：

1. Fork 项目。
2. 创建你的功能分支 (`git checkout -b feature/YourFeatureName`)。
3. 提交你的更改 (`git commit -m 'Add some feature'`)。
4. 推送到分支 (`git push origin feature/YourFeatureName`)。
5. 提交 pull request。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题，请联系:

- Email: [support@misub.com](mailto:support@misub.com)
- GitHub: [@imzyb](https://github.com/imzyb)

---
