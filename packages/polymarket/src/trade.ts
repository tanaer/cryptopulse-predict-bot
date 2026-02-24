
import { ClobClient, Side, OrderType, type UserMarketOrder } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";

export class TradeClient {
  private clob: ClobClient;

  constructor(args: { privateKey: string; clobHost?: string; chainId?: number }) {
    const host = args.clobHost ?? "https://clob.polymarket.com";
    const chainId = (args.chainId ?? 137) as any;
    const signer = new Wallet(args.privateKey);
    this.clob = new ClobClient(host, chainId, signer);
  }

  async deriveApiKey() {
    return this.clob.deriveApiKey();
  }

  async createAndPostMarketOrder(args: { tokenID: string; side: "BUY" | "SELL"; amount: number; price?: number }) {
    const order: UserMarketOrder = {
      tokenID: args.tokenID,
      side: args.side === "BUY" ? Side.BUY : Side.SELL,
      amount: args.amount,
      price: args.price
    };
    return this.clob.createAndPostMarketOrder(order, undefined, OrderType.FOK);
  }
}
