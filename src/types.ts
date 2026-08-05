export type CategoryId = 'all' | 'weather' | 'transit' | 'economy' | 'local';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
};

export type Market = {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  title: string;
  endsIn: string;
  participants: number;
  ptsStaked: number;
  yesPct: number;
  yesOdds: number;
  noOdds: number;
  featured?: boolean;
};

export type Leader = {
  id: string;
  username: string;
  accuracy: number;
  badge: string;
  points: number;
  avatarEmoji: string;
};

export type PredictionSide = 'YES' | 'NO';

export type ActivePrediction = {
  market: Market;
  side: PredictionSide;
};

export type PredictionStatus = 'ACTIVE' | 'SETTLED';
export type SettlementResult = 'WIN' | 'LOSS';

export type UserPrediction = {
  id: string;
  marketId: string;
  marketTitle: string;
  predictionType: PredictionSide;
  stakedAmount: number;
  /** Total PTS returned if correct (stake × odds). */
  potentialPayout: number;
  odds: number;
  timestamp: number;
  status: PredictionStatus;
  endsIn?: string;
  result?: SettlementResult;
  /** Net PTS change after settlement (+gain or −stake). */
  settledPnl?: number;
};
