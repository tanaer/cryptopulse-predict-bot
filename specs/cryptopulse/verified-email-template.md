# Verified 申请邮件模板（中英）

## 中文模板

**收件人：** builder@polymarket.com  
**主题：** Builders Program Verified 申请（CryptoPulse Predict Bot / Telegram）

你好，Polymarket Builders 团队：

我们正在构建并已开始内测一个面向 Telegram 频道用户的交易机器人：**CryptoPulse Predict Bot**，用于在 Telegram 内完成 Polymarket 交易闭环（gas-free，通过官方 relayer + Safe/Proxy），并通过 **Builder Attribution Headers** 将交易量归因到我们的 Builder Profile。

我们希望申请将 Builders Program 从 Unverified 提升到 Verified（或提高交易限额），以支持后续公开上线与增长。

**项目概述**
- 产品：CryptoPulse Predict Bot（Telegram Bot + 管理员后台）
- 目标用户：Telegram 频道加密交易用户（当前频道规模：约 10,000+）
- 用例：市场搜索/详情 → 市价/限价下单 → 仓位/订单 → CTF 操作（split/merge/redeem）

**技术实现（对齐官方最佳实践）**
- CLOB：@polymarket/clob-client
- Attribution：@polymarket/builder-signing-sdk（remote signing，密钥不落地、不出现在客户端）
- Relayer：@polymarket/builder-relayer-client（Safe/Proxy，覆盖 deploy/approve/execute/CTF）
- 钱包：优先 Privy + Safe（或 Magic Link + Safe），并保留兜底签名流程

**当前进展**
- 已完成：端到端内测交易（数量：___ 笔），下单与归因验证通过
- 计划：在未来 ___ 周内正式上线，预期交易量 ___（例如 weekly volume / 日均单量）

**我们需要的支持**
- 提升/解除 Unverified 阶段交易限额（目前限制影响公开测试与增长）
- 如需进一步信息，我们可以提供：Bot 链接、后台截图、日志/归因验证结果等

**关键信息**
- Builder Profile：___（可填 Profile 链接或账号标识）
- Builder API Key（仅 Key 标识）：___
- 项目/团队联系方式：___
- Telegram Bot/频道链接：___

感谢你们的支持！期待获得 Verified，以便更好地为 Telegram 用户提供 gas-free 的交易体验并推动生态交易增长。

此致  
___（姓名/团队）  
___（公司/组织，可选）

---

## English Template

**To:** builder@polymarket.com  
**Subject:** Request for Verified Tier (CryptoPulse Predict Bot / Telegram)

Hello Polymarket Builders Team,

We are building and currently testing a Telegram-native trading bot called **CryptoPulse Predict Bot** that enables users to discover and trade Polymarket markets directly inside Telegram. All trades are routed **gas-free** via the official relayer infrastructure (Safe/Proxy), and every order includes **Builder Attribution Headers** so volume is fully attributed to our Builder Profile.

We’d like to request an upgrade from Unverified to Verified (or an increased transaction limit) to support public launch and scale.

**Project Overview**
- Product: CryptoPulse Predict Bot (Telegram bot + admin dashboard)
- Target users: crypto trading audience in Telegram (channel size: ~10,000+)
- Use case: search/market details → market/limit orders → portfolio/orders → CTF operations (split/merge/redeem)

**Implementation (aligned with official best practices)**
- CLOB: `@polymarket/clob-client`
- Attribution: `@polymarket/builder-signing-sdk` (remote signing; builder secrets never exposed client-side)
- Relayer: `@polymarket/builder-relayer-client` (Safe/Proxy; deploy/approve/execute/CTF)
- Wallet onboarding: Privy + Safe preferred (Magic Link + Safe as fallback), with a signature-based fallback flow

**Current Status**
- Completed: ___ end-to-end test trades; order submission and attribution validation confirmed
- Launch plan: production launch in ___ weeks; expected volume ___ (weekly volume / daily orders)

**Request**
- Increase the Unverified transaction limits / upgrade to Verified to enable public beta and growth
- We can provide additional details upon request: bot link, dashboard screenshots, logs, attribution verification results, etc.

**Key Information**
- Builder Profile: ___
- Builder API Key (key ID only): ___
- Contact: ___
- Telegram bot/channel link: ___

Thank you for your support. We’re excited to bring a seamless gas-free Telegram onboarding + trading experience to Polymarket and drive meaningful volume attribution to our builder account.

Best regards,  
___ (Name / Team)  
___ (Company / Org, optional)
