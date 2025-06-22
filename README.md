# Safe Chat

这是一个使用 Next.js 构建的安全、私密的聊天应用程序，集成了 AI 聊天机器人功能。它注重隐私保护，提供了多种安全特性，旨在为用户提供一个放心的交流环境。

## ✨ 功能特性

- **🔒 安全登录**: 使用 4 位 PIN 码进行身份验证，简单且安全。
- **🤖 AI 智能聊天**: 在聊天中通过 `@AI <你的问题>` 来与集成的 DeepSeek AI 模型进行对话。
- **⏱️ 消息自动过期**: 所有聊天消息在发送一小时后会自动从设备中删除，不留痕迹。
- **🗑️ 手动清除记录**: 提供一键清除所有聊天记录的功能，并有二次确认防止误操作。
- **🛡️ 防截屏/录屏**: 当聊天窗口失去焦点时，界面会自动模糊，有效防止后台截屏或录屏，保护对话隐私。
- **🔄 跨标签页同步**: 在同一浏览器的多个标签页之间实时同步聊天消息。
- **🎨 现代化界面**: 使用 shadcn/ui 和 Tailwind CSS 构建，界面美观、响应式。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **AI 集成**: [Genkit](https://firebase.google.com/docs/genkit)
- **AI 模型**: [DeepSeek](https://www.deepseek.com/) via [Silicon Flow](https://www.siliconflow.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 快速开始

请按照以下步骤在本地运行此项目。

### 1. 克隆仓库

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

在项目根目录下创建一个名为 `.env.local` 的文件，并添加您的 Silicon Flow API 密钥：

```
SILICONFLOW_API_KEY=your_silicon_flow_api_key_here
```

> **注意**: 请将 `your_silicon_flow_api_key_here` 替换为您自己的有效密钥。

### 4. 运行开发服务器

```bash
npm run dev
```

现在，在您的浏览器中打开 [http://localhost:9002](http://localhost:9002) 即可访问应用。

## 🔑 登录 PIN 码

为了方便测试，项目内置了以下固定的 PIN 码：

- `1839`
- `9849`
- `5728`
- `4053`

在登录页面输入以上任意一个 PIN 码即可进入聊天界面。

---

此项目在 Firebase Studio 中构建。
