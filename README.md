# Express Prisma Starter

基于 **Express 5 + Prisma ORM + TypeScript + SQLite** 的现代后端入门脚手架。

## 🛠️ 技术栈

- **框架**: Express 5
- **ORM**: Prisma 5
- **数据库**: SQLite（无需额外安装数据库服务，开箱即用）
- **开发语言**: TypeScript
- **开发运行时**: `tsx`（极速热重载，无需预编译）

---

## 🚀 快速开始

### 1. 克隆项目并安装依赖

```bash
git clone https://github.com/hulanyu/express-prisma-starter.git
cd express-prisma-starter
npm install
```

### 2. 配置环境变量

复制环境变量模版：

```bash
cp .env.example .env
```

默认 `.env` 配置为本地 SQLite 文件数据库：
```env
DATABASE_URL="file:./dev.db"
```

### 3. 同步数据库结构 & 生成 Prisma 客户端

```bash
# 将 schema 结构同步到本地 SQLite 数据库
npx prisma db push

# 生成 Prisma Client 类型代码
npx prisma generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务默认运行在：[http://localhost:3000](http://localhost:3000)

---

## 📡 API 接口说明

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| `GET` | `/` | 服务健康检查 / 欢迎页 |
| `GET` | `/api/posts` | 获取所有文章列表（按创建时间倒序） |
| `GET` | `/api/posts/:id` | 获取单篇文章详情 |
| `POST` | `/api/posts` | 创建文章（Body: `{ title, content, published }`） |
| `PUT` | `/api/posts/:id` | 更新文章（Body: `{ title?, content?, published? }`） |
| `DELETE` | `/api/posts/:id` | 删除指定文章 |

---

## 📁 目录结构

```text
├── prisma/
│   ├── schema.prisma      # 数据模型定义
│   └── dev.db             # 本地 SQLite 数据库文件（已加入 .gitignore）
├── src/
│   ├── db.ts              # PrismaClient 单例导出
│   └── index.ts           # Express 服务入口与 API 路由
├── .env                   # 环境变量配置
├── .env.example           # 环境变量示例
├── package.json
└── tsconfig.json
```

---

## 📦 常用命令

- `npm run dev`: 启动热重载开发服务器
- `npm run build`: 编译 TypeScript 代码到 `dist/`
- `npm run start`: 运行编译后的生产环境代码
- `npx prisma studio`: 打开可视化的 Prisma Web 数据管理面板
- `npx prisma db push`: 推送 schema 变更到数据库
