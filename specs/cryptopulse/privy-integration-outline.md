# Privy 绑定实现大纲（Telegram 优先）

## 目标

- 让用户在 Telegram 场景下尽可能少跳转、少步骤完成绑定与钱包准备（Safe/Proxy）。
- 前端不接触 Builder Secret/Passphrase；所有 builder signing 走服务端 remote signing。

## 推荐落地路径（与现有架构匹配）

### 1) Web 绑定页（Next.js App Router）

- 路由：`/bind?code=...`
- 页面职责：
  - 展示“绑定到 CryptoPulse Predict Bot”的简短说明
  - 触发 Privy 登录/创建嵌入式钱包
  - 获取用户链上地址（EOA/嵌入式钱包地址）与会话态
  - 调用后端接口完成 `bind_code` 兑换与用户绑定入库

### 2) Bot 侧（grammY）

- `/start`：
  - 生成短期 `bind_code`
  - 发送 Inline Keyboard：“一键绑定（推荐）”“无法打开？使用备用绑定”
- 绑定状态：
  - 已绑定用户：展示“下单/仓位/提醒/复制交易/AI 解读”等主菜单
  - 未绑定用户：所有受限动作统一引导回绑定入口

### 3) 服务端绑定接口（Next.js Route Handler）

建议接口：
- `POST /api/bot/bind-code`（Bot 调用，签发 bind_code）
- `POST /api/bind/confirm`（Web 调用，完成绑定）

`/api/bind/confirm` 输入建议：
- `bindCode`
- `polymarketAddress`（从 Privy 会话拿到的地址）
- `provider`（privy|magic|signature_fallback）
- `telegramId`（由 bind_code 在服务端映射得到，Web 端不直接传）

服务端校验点：
- bind_code 未过期/未使用
- 地址格式校验
- 幂等：同一 telegramId 重复绑定时可选择覆盖或要求先解绑

## Safe/Proxy 钱包准备（首次交易前）

建议在下单前做“钱包准备”前置步骤：

- 输入：user polymarketAddress / safeAddress（可能为空）
- 流程：
  1. 如果 safeAddress 为空：调用 relayer 执行 deploy/initialize（按 SDK 支持的 Safe/Proxy 类型）
  2. 写回用户的 safeAddress/funderAddress
  3. 继续执行 approve（如需要）与下单

## 归因与签名（remote signing）

- CLOB 下单：trading client 初始化时传入 `BuilderConfig(remoteBuilderConfig)`
- Relayer：初始化时传入同一套 `BuilderConfig`
- 签名端点：`POST /api/polymarket/sign`（仅服务端；用 `SIGNING_TOKEN` 鉴权）

## UX 与可观测性

- Week 1.5 对比：Privy 一键绑定 vs 兜底签名绑定
- 建议埋点漏斗（至少 server-side 计数即可）：
  - start → click_bind → bind_success → first_search → open_market → start_order → order_success
- 失败兜底：
  - Privy/Telegram 限制时，提示用户用“备用绑定”或外部浏览器打开

## 兜底绑定（签名）保留原则

- 即使 Privy 方案稳定，也保留 `bind_code + Web 签名` 兜底：
  - 处理特定设备/地区/网络导致 Privy 不可用
  - 便于快速 debug 与应急上线
