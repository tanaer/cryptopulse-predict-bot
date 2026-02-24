# CryptoPulse Predict Bot

## 开发环境

### 依赖

- Node.js 20+
- PostgreSQL 14+（本地或远程）
- Redis 6+（本地或远程）

### 安装依赖

Prisma engines 在部分网络环境可能下载失败，可使用镜像或代理。

```powershell
$env:PRISMA_ENGINES_MIRROR='https://npmmirror.com/mirrors/prisma/'
npm install
```

### 环境变量

复制并按需填写：

- `.env.example`

### 数据库初始化

设置 `DATABASE_URL` 指向可用的 PostgreSQL 后执行：

```powershell
npm -w packages/db run prisma:generate
npx prisma migrate deploy --schema packages/db/prisma/schema.prisma
```

开发环境也可使用：

```powershell
npm -w packages/db run prisma:migrate -- --name init
```

## 本地运行

### 管理后台

```powershell
npm run dev:admin
```

访问：http://localhost:3000  
未设置 `ADMIN_TOKEN` 时，开发环境可直接访问 `/admin`；生产环境必须设置。

### Telegram Bot

```powershell
$env:TELEGRAM_BOT_TOKEN='...'
npm run dev:bot
```

## 绑定流程（当前最小实现）

- Bot 内发送 `/bind` 或在 `/start` 点击“生成绑定链接”
- 打开链接进入公开绑定页：`/bind`
- 使用绑定码提交地址信息后完成绑定：`/bind/success`

