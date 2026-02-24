
export interface GammaEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  open_interest: number;
  sortBy: string;
  markets: GammaMarket[];
  tags: Tag[];
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  resolvedBy: string;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  questionID: string;
  enableOrderBook: boolean;
  orderPriceMin: string;
  orderPriceMax: string;
  orderMinSize: string;
  orderMinSizeStep: string;
  tag: string;
  clobTokenIds: string[];
  umaBond: string;
  umaReward: string;
  volume24hr: string;
  clobRewards: ClobReward[];
  acceptingOrders: boolean;
  negRisk: boolean;
  negRiskMarketID: string;
  negRiskRequestID: string;
  commentCount: number;
  _sync: boolean;
}

export interface Tag {
  id: string;
  label: string;
  slug: string;
  forceAdmin: boolean;
  _sync: boolean;
}

export interface ClobReward {
  id: string;
  conditionId: string;
  assetAddress: string;
  rewardsAmount: number;
  rewardsDailyRate: number;
  startDate: string;
  endDate: string;
}

export interface GammaQuery {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  slug?: string;
  id?: string;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  new?: boolean;
  featured?: boolean;
  restricted?: boolean;
  liquidity_min?: number;
  volume_min?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  tag_id?: string;
  q?: string;
}

export class GammaClient {
  private baseUrl: string;

  constructor(baseUrl: string = "https://gamma-api.polymarket.com") {
    this.baseUrl = baseUrl;
  }

  async getEvents(query: GammaQuery = {}): Promise<GammaEvent[]> {
    const params = new URLSearchParams();
    
    if (!query.limit) params.append("limit", "20");
    if (query.active === undefined) params.append("active", "true");
    if (query.closed === undefined) params.append("closed", "false");
    if (query.archived === undefined) params.append("archived", "false");

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch events from Gamma API:", error);
      throw error;
    }
  }

  async getEvent(id: string): Promise<GammaEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      throw error;
    }
  }

  async getMarket(id: string): Promise<GammaMarket | null> {
    try {
        const response = await fetch(`${this.baseUrl}/markets/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch market ${id}:`, error);
        throw error;
    }
  }
}
