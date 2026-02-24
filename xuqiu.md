**产品需求文档 (PRD) V2.0**  
**项目名称**：CryptoPulse Predict Bot（加密脉冲预测机器人）  
**产品类型**：Polymarket Builders Program 专属 Telegram Bot + 管理员后台管理系统  
**版本日期**：2026年2月22日  
**文档作者**：基于官方最新 Builders 文档（2026.2）优化  
**目标用户**：Telegram 频道 1 万+ 虚拟货币/区块链散户（金融交易爱好者）  
**核心价值**：频道内容直接转化为 gas-free Polymarket 加密预测交易工具，所有交易量 100% 归属 Builder 账户，3 个月内冲上 Leaderboard 并获取 Weekly USDC Rewards + Grants  

---

### 1. 产品概述
CryptoPulse Predict Bot 是专为你的 Telegram 频道打造的 Polymarket 加密专区交易基础设施。  
用户可在 Bot 内搜索、浏览、实时交易所有加密相关预测市场（BTC/ETH 价格、监管、ETF、链上 TVL 等），全程 **gas-free**（Relayer + Safe/Proxy 钱包代付）。  
所有订单必须携带 **Builder Attribution Headers**，确保交易量 100% 计入你的 Builder Profile。  
官方 Builders 页面：https://builders.polymarket.com  
官方文档入口：https://docs.polymarket.com/builders/overview  

---

### 2. 业务目标与 KPI
**短期（上线 1 个月）**  
- 绑定用户 ≥ 500  
- 周交易量 ≥ 50 万 USD  
- 频道留存率提升 ≥ 25%  

**中期（3 个月）**  
- 进入 Builder Leaderboard 前 100  
- 成功升级 Verified+（每周 USDC Rewards + 工程支持）  
- 申请并获得 Grants（$2.5M+ 池，AI/复制交易等创新项目优先）  

**长期**：形成「频道内容 → Bot 交易 → 付费社群」闭环变现  

**Verified 升级路径（官方最新）**：  
Unverified（默认 100 tx/day）→ 邮件 builder@polymarket.com 提交 Builder API Key + 用例 + Telegram 链接 → 几天内审批至 3000 tx/day  

---

### 3. 用户画像与使用场景
- **画像**：25-45 岁男性，加密散户，日均交易 1-5 次，高度关注 BTC/ETH/SOL、监管新闻、链上事件  
- **痛点**：手动切换 Polymarket 网站麻烦、gas 费高、操作繁琐  
- **场景**：频道发布市场分析后，用户直接在 Bot 一键交易；手机端边看新闻边下单  

---

### 4. 功能需求

#### 4.1 用户入口与账户绑定（P0）
- `/start` 欢迎消息 + 一键绑定按钮（支持 Privy / Magic Link / Wallet Connect + Safe Wallet）  
- 绑定成功后显示「已绑定 Polymarket 账户，享受 gas-free 交易，所有交易量计入频道 Builder 奖励」  
- 支持解绑、切换账户  
- 首次绑定赠送新手教程 + 频道专属推广链接  

#### 4.2 市场发现（P0）
- 全局搜索（关键词：BTC、ETH、SOL、监管、ETF、TVL 等）  
- 热门分类 Tab：今日热点（24h 成交量排序）、加密价格、监管政策、链上数据、短线市场  
- Inline Keyboard 分页展示，每页 8 个市场  
- WebSocket 实时刷新赔率与成交量  

#### 4.3 市场详情页（P0）
- 完整标题、描述、到期时间、当前 Yes/No 赔率、多 outcome 支持  
- 实时 Orderbook（最佳买卖价、深度）  
- 24h/7d 成交量、流动性、简单历史走势图  
- 「买入 Yes」「买入 No」「限价单」按钮 + 分享到频道按钮  

#### 4.4 交易下单（P0 核心）
- Market Order / Limit Order  
- 输入 USDC 金额  
- 确认页显示「Gas-Free（Relayer 代付）」+「本次交易量归属频道 Builder」+ 滑点提示  
- 一键确认 → 后端 Relayer 执行（支持 Batch Approvals）  
- 成功后推送确认消息 + 查看仓位按钮  

#### 4.5 我的仓位与订单（P0）
- 未平仓仓位列表（持仓金额、当前价值、实时盈亏）  
- 未完成限价单  
- 已结算历史（支持一键分享收益截图）  
- 一键 Split / Merge / Redeem CTF 代币  

#### 4.6 通知与自动化（P1）
- 管理员后台推送「今日热点」给全体用户  
- 用户自定义价格警报  
- 每日早报（Top 5 加密市场动态）  

#### 4.7 管理员后台（P0）
- 简易 Web 面板（FastAPI + React / Next.js）  
- 推送管理、交易量统计（总 volume、Top 用户、归因确认）  
- 用户管理 & 黑名单  
- Builder API Key 安全管理（仅管理员可见）  

#### 4.8 Phase 2 增强功能（上线后迭代）
- 复制交易（Copy Top Trader 或频道管理员仓位）  
- AI 预测助手（结合频道内容自动生成观点）  
- Web Dashboard（PC 端详细图表）  
- 中英双语切换  

---

### 5. 非功能需求
- **性能**：搜索 <1s，交易确认 <3s  
- **安全性（最佳实践）**：Builder Key/Secret/Passphrase 仅存服务器环境变量；所有签名采用 remote signing；用户私钥永不接触服务器；强制使用 Safe Wallet  
- **可用性**：全 Telegram Inline Keyboard，移动端优先  
- **合规**：每条消息底部添加「本 Bot 仅为交易工具，不构成投资建议」  
- **监控**：Sentry 异常报警 + 每日交易量报表推送至你的 Telegram  
- **限流**：自动处理 Polymarket Rate Limit（Verified 后大幅提升）  

---

### 6. 技术集成要求（官方最佳实践）
- **必须使用官方 2026 最新 SDK**：  
  - CLOB Client（Python / TypeScript）  
    - Relayer Client（gas-free 全流程）  
      - Builder Signing SDK（生成 attribution headers）  
      - **钱包**：强制优先 Privy + Safe 或 Magic Link + Safe（官方推荐 Telegram onboarding 方案）  
      - **后端**：Python（aiogram 3.x）或 TypeScript  
      - **数据库**：PostgreSQL（用户绑定、仓位缓存）+ Redis（实时数据）  
      - **部署**：Docker 一键部署（Railway / Render / 阿里云）  

      **数据库 Schema 建议**：  
      - users：telegram_id, polymarket_address, safe_address, bound_at  
      - positions：user_id, condition_id, outcome, size, avg_price  
      - transactions：tx_hash, volume_usd, builder_attributed  

      ---

      ### 7. 集成最佳实践清单（必执行）
      1. 创建 Builder Profile（https://polymarket.com/settings?tab=builder）获取 API Key/Secret/Passphrase  
      2. 初始化 CLOB Client 时传入完整 BuilderConfig  
      3. 每笔订单必须附带 Builder Attribution Headers（Signing SDK 生成）  
      4. 所有 onchain 操作（deploy/approve/execute/CTF）全部走 Relayer  
      5. Fork 官方 Safe Wallet Examples（Privy/Safe、Magic Link/Safe 等）作为起点  
      6. 订阅官方 Changelog + Verified 后加入 Builders Telegram 群  
      7. 每笔交易后调用查询接口验证 attribution 是否 100% 正确  

      ---

      ### 8. 用户核心流程示例
      1. 频道置顶消息 → 点击进入 Bot  
      2. `/start` → 30 秒完成绑定  
      3. 输入「BTC」→ 选择市场 → 详情页 → 输入金额 → 确认 gas-free 下单  
      4. 「我的仓位」实时查看盈亏  

      ---

      ### 9. UI/UX 规范
      - 主色：Polymarket 绿 (#00FF9F) + 深色模式  
      - 所有交互使用 Inline Keyboard  
      - 加载提示：「⏳ 处理中…」  
      - 错误友好提示 + 重试按钮  

      ---

      ### 10. 开发里程碑与时间线（总 5 周）
      **Week 1**：Fork 官方 Safe Demo + Builder Profile + 绑定 + 市场搜索  
      **Week 2**：Relayer gasless 下单 + attribution headers 验证  
      **Week 3**：仓位/CTF + rate-limit + 内测  
      **Week 4**：管理员后台 + 安全审计  
      **Week 5**：正式上线 + Verified 申请邮件提交  

      ---

      ### 11. 风险与缓解
      - Relayer 初始 100 tx/day 限额 → 先 Unverified 快速冲量，3 天内申请 Verified  
      - Attribution 未计入 → 实时验证 + 日报提醒  
      - API 变更 → 订阅官方 Changelog  

      ---

      ### 12. 附录
      **所需立即提供的资源**：  
      1. Builder API Key / Secret / Passphrase（请今天生成并安全发送给团队）  
      信息如下（已打码，请通过安全渠道提供给工程环境变量）
      - BUILDER_API_KEY=***
      - BUILDER_SECRET=***
      - BUILDER_PASSPHRASE=***

      2. 频道 Logo、宣传文案、测试群  
      3. Verified 申请邮件模板（可另行提供）  

      **官方文档最新链接（2026.2）**：  
      - Overview: https://docs.polymarket.com/builders/overview  
      - Builder Intro & Tiers: https://docs.polymarket.com/developers/builders/builder-intro  
      - Examples & Relayer: https://docs.polymarket.com/developers/builders/examples  

      此 PRD 已完全对齐 Polymarket 官方 2026 年 2 月最新最佳实践，可直接交付工程师团队执行。
