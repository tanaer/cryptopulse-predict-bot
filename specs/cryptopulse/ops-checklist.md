# 上线 Checklist

## 上线前（账号与权限）

- 创建 Builder Profile，确认可在 builders.polymarket.com 看到 Profile（Unverified 状态即可）。
- 确认环境变量齐全：`.env.example` 中所有必需项都已在部署环境配置完成。
- 确认后台单管理员口令 `ADMIN_TOKEN` 已设置且仅团队掌握。
- 确认 `SIGNING_TOKEN` 已设置，且签名端点仅服务端可访问。

## 上线前（交易闭环验证）

- 在测试群完成端到端流程：
  - 绑定（Privy/Magic 或兜底签名）
  - 搜索/详情（含 WebSocket 更新或降级轮询）
  - 首次下单（触发 Safe/Proxy 自动部署/初始化）
  - 下单回执与订单状态更新
  - 仓位/CTF 操作（Split/Merge/Redeem）
- 完成 10-20 笔真实测试交易（控制 Unverified 限额），确认无系统性失败。

## 归因验证（自动化脚本）

- 目标：验证每笔订单的 Builder Attribution Headers 生效，且 Builder 交易量统计有增长。
- 推荐两层校验：
  1. 订单级：下单后记录 orderId/txHash，并调用 CLOB 查询订单/成交状态（成功、失败、部分成交）。
  2. Builder 级：定时查询 builder trades/volume（通过 builder methods）并与本地订单聚合结果对账。
- 脚本输出建议：
  - 时间窗口内订单数、成交数、失败原因 Top
  - builder 侧查询到的 trades 数与本地成交数差异
  - 归因成功率（如按“本地下单成功且 builder trades 可查到”为成功）

## Verified 申请（建议在小规模验证后尽早做）

- 完成上述 10-20 笔交易验证后，准备申请邮件材料：
  - Builder API Key（仅 Key 标识，不要在邮件里包含 Secret/Passphrase）
  - Bot/Telegram 链接与用例说明
  - 预期交易量与用户规模
- 发送邮件至 `builder@polymarket.com` 申请提高限额（Unverified → Verified）。

## 上线后监控

- 每日监控：
  - 下单成功率、Relayer 失败率
  - WebSocket 断线/重连次数
  - 归因成功率与 builder volume 增长
- 每周监控：
  - Leaderboard 排名变化
  - 用户留存与关键漏斗（start→bind→search→order）
