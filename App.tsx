import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

/* ═══════════════════════ Theme ═══════════════════════ */

const C = {
  bg: '#080611',
  surface: '#120F24',
  surfaceAlt: '#16122B',
  border: 'rgba(138,92,246,0.25)',
  borderMuted: '#2A2242',
  borderSoft: 'rgba(138,92,246,0.14)',
  text: '#FFFFFF',
  muted: '#94A3B8',
  mutedSoft: '#64748B',
  label: '#A78BFA',
  violet: '#A855F7',
  violetHot: '#8B5CF6',
  violetDim: 'rgba(139,92,246,0.14)',
  violetBorder: 'rgba(168,85,247,0.45)',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  pill: '#7C3AED',
  yes: '#2DD4BF',
  yesDeep: '#059669',
  yesDim: 'rgba(45,212,191,0.15)',
  yesBorder: '#2DD4BF',
  yesBar: 'rgba(45,212,191,0.72)',
  no: '#F43F5E',
  noDeep: '#BE123C',
  noDim: 'rgba(244,63,94,0.15)',
  noBorder: '#F43F5E',
  noBar: 'rgba(244,63,94,0.68)',
  overlay: 'rgba(6,4,14,0.86)',
  white: '#FFFFFF',
} as const;

const noSelect =
  Platform.OS === 'web'
    ? ({ userSelect: 'none', WebkitUserSelect: 'none' } as const)
    : {};

/* ═══════════════════════ Types ═══════════════════════ */

type Lang = 'en' | 'zh';
type CategoryId = 'all' | 'weather' | 'transit' | 'economy' | 'local';
type Side = 'YES' | 'NO';
type Tab = 'markets' | 'bets' | 'leaderboard';
type LeaderboardSort = 'accuracy' | 'points';
type Status = 'ACTIVE' | 'SETTLED';
type Result = 'WIN' | 'LOSS';

type Market = {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  emoji: string;
  titleEn: string;
  titleZh: string;
  endsInEn: string;
  endsInZh: string;
  participants: number;
  ptsStaked: number;
  yesPct: number;
  yesOdds: number;
  noOdds: number;
  featured?: boolean;
};

type UserPrediction = {
  id: string;
  marketId: string;
  titleEn: string;
  titleZh: string;
  emoji: string;
  endsInEn: string;
  endsInZh: string;
  side: Side;
  stake: number;
  odds: number;
  potentialPayout: number;
  timestamp: number;
  status: Status;
  result?: Result;
  settledPnl?: number;
};

type Leader = {
  id: string;
  username: string;
  accuracy: number;
  badgeEn: string;
  badgeZh: string;
  points: number;
  emoji: string;
  isYou?: boolean;
};

type AccountData = {
  points: number;
  predictions: UserPrediction[];
};

type PersistBlob = {
  currentUser: string;
  lang: Lang;
  accounts: Record<string, AccountData>;
};

/* ═══════════════════════ i18n ═══════════════════════ */

const T = {
  en: {
    brand: 'RightPick',
    balance: 'BALANCE',
    standing: 'STANDING',
    markets: 'Markets',
    myBets: 'My Bets',
    leaderboard: 'Leaderboard',
    all: 'All',
    weather: 'Weather',
    transit: 'Transit',
    economy: 'Economy',
    local: 'Local Life',
    featured: 'POPULAR',
    trending: 'Trending Markets',
    open: 'open',
    endsIn: 'Ends in',
    participants: 'participants',
    predictors: 'predictors',
    ptsStaked: 'PTS staked',
    youPredicted: 'You predicted',
    with: 'with',
    bullish: 'Bullish',
    bearish: 'Bearish',
    predictYes: 'Predict YES',
    predictNo: 'Predict NO',
    totalStaked: 'Total Staked',
    potentialWin: 'Potential Win',
    accuracy: 'Accuracy',
    active: 'Active',
    settled: 'Settled',
    noActive: 'No active bets. Stake on a market to see it here.',
    noSettled: 'No settled bets yet. Use Simulate controls on Active bets.',
    staked: 'Staked',
    potentialReturn: 'Potential return',
    payout: 'Payout',
    resolveTitle: 'Resolution Simulator',
    resolveHint: 'Demo control — settle this market as YES or NO wins.',
    simYes: 'Simulate YES Win',
    simNo: 'Simulate NO Win',
    rankings: 'Local Rankings',
    rankingsSub: 'Rankings based on total accumulated PTS.',
    rankingsSubAcc: 'Rankings based on prediction accuracy rate.',
    rankingsSubPts: 'Rankings based on total accumulated PTS.',
    lbAcc: '🎯 Accuracy (% Acc)',
    lbPts: '💰 Total Points (PTS)',
    you: 'You',
    stakeAmount: 'STAKE AMOUNT',
    available: 'Available',
    predicting: 'Predicting',
    winPlus: 'Win',
    returnIf: 'Return',
    ifCorrect: 'PTS if correct',
    confirm: 'Confirm Prediction',
    cancel: 'Cancel',
    insufficient: 'Insufficient PTS balance',
    account: 'Account',
    switchAccount: 'Switch Account',
    username: 'Username',
    usernamePh: 'Enter username',
    login: 'Load / Create Account',
    close: 'Close',
    pts: 'PTS',
    win: 'WIN',
    loss: 'LOSS',
    locked: 'Locked',
    potential: 'potential',
    credited: 'credited to your balance',
    langToggle: 'EN / 中文',
    acc: 'Acc',
  },
  zh: {
    brand: 'RightPick',
    balance: '點數餘額',
    standing: '排名',
    markets: '預測市場',
    myBets: '我的預測',
    leaderboard: '排行榜',
    all: '全部',
    weather: '天氣',
    transit: '交通',
    economy: '經濟',
    local: '本地社區',
    featured: '熱門',
    trending: '熱門市場',
    open: '個開放中',
    endsIn: '剩餘',
    participants: '位參與者',
    predictors: '位預測者',
    ptsStaked: 'PTS 已押注',
    youPredicted: '你已預測',
    with: '押注',
    bullish: '看漲',
    bearish: '看跌',
    predictYes: '預測 YES',
    predictNo: '預測 NO',
    totalStaked: '總押注',
    potentialWin: '潛在回報',
    accuracy: '準確率',
    active: '進行中',
    settled: '已結算',
    noActive: '尚無進行中的預測。請先在市場押注。',
    noSettled: '尚無已結算預測。請在進行中使用模擬結算。',
    staked: '已押注',
    potentialReturn: '潛在回報',
    payout: '派彩',
    resolveTitle: '結算模擬器',
    resolveHint: '示範控制 — 將此市場結算為 YES 或 NO 勝出。',
    simYes: '模擬 YES 勝出',
    simNo: '模擬 NO 勝出',
    rankings: '本地排行榜',
    rankingsSub: '排名按累積 PTS 總額計算。',
    rankingsSubAcc: '排名按預測準確率計算。',
    rankingsSubPts: '排名按累積 PTS 總額計算。',
    lbAcc: '🎯 準確率 (% Acc)',
    lbPts: '💰 總點數 (PTS)',
    you: '你',
    stakeAmount: '押注金額',
    available: '可用餘額',
    predicting: '預測方向',
    winPlus: '可贏',
    returnIf: '若正確可獲',
    ifCorrect: 'PTS',
    confirm: '確認預測',
    cancel: '取消',
    insufficient: '點數餘額不足',
    account: '帳戶',
    switchAccount: '切換帳戶',
    username: '用戶名稱',
    usernamePh: '輸入用戶名稱',
    login: '載入／建立帳戶',
    close: '關閉',
    pts: 'PTS',
    win: '勝出',
    loss: '落敗',
    locked: '已鎖定',
    potential: '潛在',
    credited: '已存入餘額',
    langToggle: 'EN / 中文',
    acc: '準確率',
  },
} as const;

type Dict = Record<keyof (typeof T)['en'], string>;

/* ═══════════════════════ Seed ═══════════════════════ */

const DEFAULT_USER = 'HK_Forecaster';
const INITIAL_POINTS = 1250;
const STORAGE_KEY = '@rightpick/v3';
const LEGACY_STORAGE_KEY = '@rightpick/v2';
const POINTS_RESET_FLAG = '@rightpick/pts-reset-1';

function resetAccountPoints(
  accounts: Record<string, AccountData>,
): Record<string, AccountData> {
  const next: Record<string, AccountData> = {};
  for (const [name, data] of Object.entries(accounts)) {
    next[name] = { ...data, points: INITIAL_POINTS };
  }
  return next;
}

const INITIAL_MARKETS: Market[] = [
  {
    id: 'typhoon-t8',
    category: 'weather',
    emoji: '🌀',
    titleEn: 'Will HKO issue a T8 Typhoon Signal before August 15, 2026?',
    titleZh: '天文台會否在 2026 年 8 月 15 日前發出八號風球？',
    endsInEn: '15 days',
    endsInZh: '15 天',
    participants: 1420,
    ptsStaked: 45200,
    yesPct: 68,
    yesOdds: 1.4,
    noOdds: 2.8,
    featured: true,
  },
  {
    id: 'ccl-140',
    category: 'economy',
    emoji: '📈',
    titleEn: 'Will Centa-City Leading Index (CCL) hit 140 this quarter?',
    titleZh: '中原城市領先指數 (CCL) 本季會否升至 140？',
    endsInEn: '42 days',
    endsInZh: '42 天',
    participants: 890,
    ptsStaked: 28400,
    yesPct: 41,
    yesOdds: 2.3,
    noOdds: 1.6,
  },
  {
    id: 'kwu-tung',
    category: 'transit',
    emoji: '🚇',
    titleEn: 'Will MTR Kwu Tung Station civil construction meet 2027 targets?',
    titleZh: '港鐵古洞站土木工程會否於 2027 年達標？',
    endsInEn: '90 days',
    endsInZh: '90 天',
    participants: 654,
    ptsStaked: 19800,
    yesPct: 82,
    yesOdds: 1.2,
    noOdds: 4.1,
  },
  {
    id: 'tourism-4m',
    category: 'economy',
    emoji: '✈️',
    titleEn: 'Will HK Tourism Board report over 4M arrivals this month?',
    titleZh: '旅發局本月會否公布超過 400 萬訪港人次？',
    endsInEn: '12 days',
    endsInZh: '12 天',
    participants: 1120,
    ptsStaked: 33100,
    yesPct: 64,
    yesOdds: 1.5,
    noOdds: 2.5,
  },
  {
    id: 'causeway-flagship',
    category: 'local',
    emoji: '🛍️',
    titleEn:
      'Will a major overseas retail chain announce a Causeway Bay flagship next month?',
    titleZh: '下月會否有大型海外零售品牌宣布進駐銅鑼灣旗艦店？',
    endsInEn: '28 days',
    endsInZh: '28 天',
    participants: 732,
    ptsStaked: 15600,
    yesPct: 51,
    yesOdds: 1.9,
    noOdds: 1.9,
  },
  {
    id: 'rainstorm-black',
    category: 'weather',
    emoji: '🌧️',
    titleEn: 'Will HKO issue a Black Rainstorm Warning this week?',
    titleZh: '天文台本週會否發出黑色暴雨警告？',
    endsInEn: '4 days',
    endsInZh: '4 天',
    participants: 2104,
    ptsStaked: 52300,
    yesPct: 37,
    yesOdds: 2.5,
    noOdds: 1.5,
  },
  {
    id: 'ferry-delay',
    category: 'transit',
    emoji: '⛴️',
    titleEn: 'Will Star Ferry report >10% delay rate this weekend?',
    titleZh: '天星小輪本週末延誤率會否超過 10%？',
    endsInEn: '3 days',
    endsInZh: '3 天',
    participants: 418,
    ptsStaked: 9200,
    yesPct: 29,
    yesOdds: 3.1,
    noOdds: 1.4,
  },
];

const defaultPredictions = (): UserPrediction[] => [
  {
    id: 'seed-a1',
    marketId: 'tourism-4m',
    titleEn: 'Will HK Tourism Board report over 4M arrivals this month?',
    titleZh: '旅發局本月會否公布超過 400 萬訪港人次？',
    emoji: '✈️',
    endsInEn: '12 days',
    endsInZh: '12 天',
    side: 'YES',
    stake: 150,
    odds: 1.5,
    potentialPayout: 225,
    timestamp: Date.now() - 86400000,
    status: 'ACTIVE',
  },
  {
    id: 'seed-a2',
    marketId: 'kwu-tung',
    titleEn: 'Will MTR Kwu Tung Station civil construction meet 2027 targets?',
    titleZh: '港鐵古洞站土木工程會否於 2027 年達標？',
    emoji: '🚇',
    endsInEn: '90 days',
    endsInZh: '90 天',
    side: 'YES',
    stake: 200,
    odds: 1.2,
    potentialPayout: 240,
    timestamp: Date.now() - 36000000,
    status: 'ACTIVE',
  },
  {
    id: 'seed-s1',
    marketId: 'hist-t3',
    titleEn: 'Will HKO issue a T3 Signal during last weekend?',
    titleZh: '上週末天文台有否發出三號風球？',
    emoji: '🌀',
    endsInEn: 'Settled',
    endsInZh: '已結算',
    side: 'YES',
    stake: 200,
    odds: 1.6,
    potentialPayout: 320,
    timestamp: Date.now() - 86400000 * 9,
    status: 'SETTLED',
    result: 'WIN',
    settledPnl: 280,
  },
  {
    id: 'seed-s2',
    marketId: 'hist-ferry',
    titleEn: 'Will Star Ferry cancel evening sailings last Friday?',
    titleZh: '上週五天星小輪有否取消晚間航班？',
    emoji: '⛴️',
    endsInEn: 'Settled',
    endsInZh: '已結算',
    side: 'NO',
    stake: 100,
    odds: 1.5,
    potentialPayout: 150,
    timestamp: Date.now() - 86400000 * 12,
    status: 'SETTLED',
    result: 'LOSS',
    settledPnl: -100,
  },
  {
    id: 'seed-s3',
    marketId: 'hist-retail',
    titleEn: 'Will a new flagship open in Mong Kok this quarter?',
    titleZh: '本季旺角會否有新旗艦店開幕？',
    emoji: '🛍️',
    endsInEn: 'Settled',
    endsInZh: '已結算',
    side: 'YES',
    stake: 120,
    odds: 2.0,
    potentialPayout: 240,
    timestamp: Date.now() - 86400000 * 18,
    status: 'SETTLED',
    result: 'WIN',
    settledPnl: 120,
  },
];

const BOT_LEADERS: Leader[] = [
  {
    id: '1',
    username: 'HK_Weather_Guru',
    accuracy: 89,
    badgeEn: 'HKO Prophet',
    badgeZh: '天文台先知',
    points: 18420,
    emoji: '🌀',
  },
  {
    id: '2',
    username: 'MTR_Insider',
    accuracy: 84,
    badgeEn: 'Transit Specialist',
    badgeZh: '交通專家',
    points: 15210,
    emoji: '🚆',
  },
  {
    id: '3',
    username: 'Property_Whiz',
    accuracy: 81,
    badgeEn: 'Property Hawk',
    badgeZh: '樓市觀察家',
    points: 14100,
    emoji: '🏙️',
  },
  {
    id: '4',
    username: 'Causeway_Pulse',
    accuracy: 80,
    badgeEn: 'Local Life Ace',
    badgeZh: '本地生活達人',
    points: 12880,
    emoji: '🛍️',
  },
  {
    id: '5',
    username: 'Harbour_Stats',
    accuracy: 79,
    badgeEn: 'Economy Scout',
    badgeZh: '經濟偵察員',
    points: 11950,
    emoji: '📊',
  },
  {
    id: '6',
    username: 'Typhoon_Tracker',
    accuracy: 79,
    badgeEn: 'HKO Prophet',
    badgeZh: '天文台先知',
    points: 10840,
    emoji: '💨',
  },
];

const STAKE_PRESETS = [50, 100, 250, 500];
const MIN_STAKE = 10;
const MAX_STAKE = 500;

const fmt = (n: number) => Math.round(n).toLocaleString('en-HK');

function calcAccuracy(predictions: UserPrediction[]) {
  const settled = predictions.filter((p) => p.status === 'SETTLED');
  if (!settled.length) return 0;
  return Math.round(
    (settled.filter((p) => p.result === 'WIN').length / settled.length) * 100,
  );
}

function activeStakeFor(preds: UserPrediction[], marketId: string) {
  return preds.find((p) => p.marketId === marketId && p.status === 'ACTIVE');
}

function defaultAccount(): AccountData {
  return { points: INITIAL_POINTS, predictions: defaultPredictions() };
}

/* ═══════════════════════ Mini sparkline ═══════════════════════ */

function Sparkline({ color }: { color: string }) {
  const bars = [4, 7, 5, 9, 6, 11, 8, 12, 10, 14];
  return (
    <View style={styles.spark}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[
            styles.sparkBar,
            {
              height: h,
              backgroundColor: color,
              opacity: 0.35 + (i / bars.length) * 0.65,
            },
          ]}
        />
      ))}
    </View>
  );
}

function ProbabilityBar({ yesPct, large }: { yesPct: number; large?: boolean }) {
  const noPct = 100 - yesPct;
  return (
    <View style={{ gap: large ? 10 : 8, width: '100%' }}>
      <View style={styles.barLabels}>
        <Text style={[styles.yesLabel, large && { fontSize: 15 }]}>
          {yesPct}% YES
        </Text>
        <Text style={[styles.noLabel, large && { fontSize: 15 }]}>
          {noPct}% NO
        </Text>
      </View>
      <View style={[styles.barTrack, { height: large ? 14 : 9 }]}>
        <View style={[styles.barYes, { width: `${yesPct}%` }]} />
        <View style={[styles.barNo, { width: `${noPct}%` }]} />
      </View>
    </View>
  );
}

function StakeSlider({
  value,
  min,
  max,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const trackRef = useRef<View>(null);
  const widthRef = useRef(0);
  const pageXRef = useRef(0);
  const dragging = useRef(false);
  const [w, setW] = useState(0);
  const range = Math.max(1, max - min);
  const ratio = Math.min(1, Math.max(0, (value - min) / range));

  const snap = (raw: number) => {
    const stepped = Math.round(raw / 10) * 10;
    return Math.min(max, Math.max(min, stepped));
  };

  const fromPageX = (pageX: number) => {
    if (widthRef.current <= 0) return value;
    return snap(min + ((pageX - pageXRef.current) / widthRef.current) * range);
  };

  const measure = () => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      pageXRef.current = x;
      widthRef.current = width;
      setW(width);
    });
  };

  return (
    <View
      ref={trackRef}
      onLayout={(e: LayoutChangeEvent) => {
        widthRef.current = e.nativeEvent.layout.width;
        setW(e.nativeEvent.layout.width);
        measure();
      }}
      style={styles.sliderHit}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e: GestureResponderEvent) => {
        dragging.current = true;
        measure();
        onDragStart?.();
        onChange(fromPageX(e.nativeEvent.pageX));
      }}
      onResponderMove={(e) => {
        if (!dragging.current) return;
        onChange(fromPageX(e.nativeEvent.pageX));
      }}
      onResponderRelease={(e) => {
        onChange(fromPageX(e.nativeEvent.pageX));
        dragging.current = false;
        onDragEnd?.();
      }}
      onResponderTerminate={() => {
        dragging.current = false;
        onDragEnd?.();
      }}
    >
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${ratio * 100}%` }]} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.sliderThumb,
          { transform: [{ translateX: Math.max(0, ratio * w - 14) }] },
        ]}
      />
    </View>
  );
}

function Toast({
  message,
  onHide,
}: {
  message: string | null;
  onHide: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 2400);
    return () => clearTimeout(t);
  }, [message, onHide]);
  if (!message) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

/* ═══════════════════════ App ═══════════════════════ */

function RightPickApp() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pad = Math.round(Math.max(18, Math.min(width, 1000) * 0.05));
  const inner = Math.min(width, 1000) - pad * 2;
  const isWide = width >= 860;
  const cardGap = isWide ? 16 : 12;
  const cardWidth = isWide ? (inner - cardGap) / 2 : inner;

  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [accounts, setAccounts] = useState<Record<string, AccountData>>({
    [DEFAULT_USER]: defaultAccount(),
  });
  const [markets, setMarkets] = useState(() =>
    INITIAL_MARKETS.map((m) => ({ ...m })),
  );
  const [activeTab, setActiveTab] = useState<Tab>('markets');
  const [filter, setFilter] = useState<CategoryId>('all');
  const [betsSegment, setBetsSegment] = useState<'active' | 'settled'>('active');
  const [leaderboardSort, setLeaderboardSort] =
    useState<LeaderboardSort>('accuracy');
  const [toast, setToast] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loginName, setLoginName] = useState('');

  const [modalMarket, setModalMarket] = useState<Market | null>(null);
  const [modalSide, setModalSide] = useState<Side>('YES');
  const [stake, setStake] = useState(100);
  const [sliding, setSliding] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const slidingRef = useRef(false);
  const backdropOrigin = useRef<{ x: number; y: number } | null>(null);
  const persistReady = useRef(false);

  const t: Dict = T[lang];
  const account = accounts[currentUser] ?? defaultAccount();
  const points = account.points;
  const predictions = account.predictions;

  const titleOf = (m: { titleEn: string; titleZh: string }) =>
    lang === 'zh' ? m.titleZh : m.titleEn;
  const endsOf = (m: { endsInEn: string; endsInZh: string }) =>
    lang === 'zh' ? m.endsInZh : m.endsInEn;

  const accuracy = useMemo(() => calcAccuracy(predictions), [predictions]);

  const leaders = useMemo(() => {
    const you: Leader = {
      id: 'you',
      username: currentUser,
      accuracy,
      badgeEn: 'Rising Predictor',
      badgeZh: '新晉預測者',
      points,
      emoji: '🇭🇰',
      isYou: true,
    };
    const list = [...BOT_LEADERS, you];
    return list.sort((a, b) => {
      if (leaderboardSort === 'accuracy') {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.points - a.points;
      }
      if (b.points !== a.points) return b.points - a.points;
      return b.accuracy - a.accuracy;
    });
  }, [accuracy, currentUser, leaderboardSort, points]);

  const youRank = leaders.findIndex((l) => l.isYou) + 1;

  /* ── Persistence ── */
  useEffect(() => {
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        }
        const alreadyReset = await AsyncStorage.getItem(POINTS_RESET_FLAG);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistBlob;
          if (parsed.accounts && parsed.currentUser) {
            const accounts =
              alreadyReset === '1'
                ? parsed.accounts
                : resetAccountPoints(parsed.accounts);
            setAccounts(accounts);
            setCurrentUser(parsed.currentUser);
            setLang(parsed.lang === 'zh' ? 'zh' : 'en');
            if (alreadyReset !== '1') {
              await AsyncStorage.setItem(POINTS_RESET_FLAG, '1');
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  currentUser: parsed.currentUser,
                  lang: parsed.lang === 'zh' ? 'zh' : 'en',
                  accounts,
                } satisfies PersistBlob),
              );
            }
          }
        } else if (alreadyReset !== '1') {
          await AsyncStorage.setItem(POINTS_RESET_FLAG, '1');
        }
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        /* keep defaults */
      } finally {
        setHydrated(true);
        persistReady.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!persistReady.current || !hydrated) return;
    const blob: PersistBlob = { currentUser, lang, accounts };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blob)).catch(() => {});
  }, [accounts, currentUser, lang, hydrated]);

  const patchAccount = useCallback(
    (updater: (prev: AccountData) => AccountData) => {
      setAccounts((prev) => {
        const cur = prev[currentUser] ?? defaultAccount();
        return { ...prev, [currentUser]: updater(cur) };
      });
    },
    [currentUser],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return markets;
    return markets.filter((m) => m.category === filter);
  }, [filter, markets]);
  const featured = filtered.find((m) => m.featured) ?? null;
  const feed = filtered.filter((m) => !m.featured);

  const activeBets = useMemo(
    () =>
      predictions
        .filter((p) => p.status === 'ACTIVE')
        .sort((a, b) => b.timestamp - a.timestamp),
    [predictions],
  );
  const settledBets = useMemo(
    () =>
      predictions
        .filter((p) => p.status === 'SETTLED')
        .sort((a, b) => b.timestamp - a.timestamp),
    [predictions],
  );
  const totalStaked = activeBets.reduce((s, p) => s + p.stake, 0);
  const potentialWin = activeBets.reduce((s, p) => s + p.potentialPayout, 0);

  const categories = [
    { id: 'all' as const, emoji: '🔥', label: t.all },
    { id: 'transit' as const, emoji: '🚇', label: t.transit },
    { id: 'weather' as const, emoji: '🌧️', label: t.weather },
    { id: 'economy' as const, emoji: '📊', label: t.economy },
    { id: 'local' as const, emoji: '🛍️', label: t.local },
  ];

  const availableForModal = useMemo(() => {
    if (!modalMarket) return points;
    const existing = activeStakeFor(predictions, modalMarket.id);
    return points + (existing?.stake ?? 0);
  }, [modalMarket, points, predictions]);

  const maxStake = Math.min(MAX_STAKE, Math.max(0, availableForModal));
  const canStake = maxStake >= MIN_STAKE;
  const odds = modalMarket
    ? modalSide === 'YES'
      ? modalMarket.yesOdds
      : modalMarket.noOdds
    : 1;
  const insufficient =
    !canStake || stake > availableForModal || stake < MIN_STAKE || stake <= 0;

  const openStake = (market: Market, side: Side) => {
    setModalMarket(market);
    setModalSide(side);
    setAttempted(false);
    const existing = activeStakeFor(predictions, market.id);
    const available = points + (existing?.stake ?? 0);
    const max = Math.min(MAX_STAKE, Math.max(0, available));
    setStake(Math.min(100, Math.max(MIN_STAKE, max || MIN_STAKE)));
  };

  const closeModal = () => {
    if (slidingRef.current) return;
    setModalMarket(null);
  };

  const confirmStake = () => {
    setAttempted(true);
    if (!modalMarket || insufficient) return;
    const existing = activeStakeFor(predictions, modalMarket.id);
    const refund = existing?.stake ?? 0;
    const payout = Math.round(stake * odds);
    const entry: UserPrediction = {
      id: `pred-${Date.now()}`,
      marketId: modalMarket.id,
      titleEn: modalMarket.titleEn,
      titleZh: modalMarket.titleZh,
      emoji: modalMarket.emoji,
      endsInEn: modalMarket.endsInEn,
      endsInZh: modalMarket.endsInZh,
      side: modalSide,
      stake,
      odds,
      potentialPayout: payout,
      timestamp: Date.now(),
      status: 'ACTIVE',
    };

    patchAccount((prev) => ({
      points: prev.points + refund - stake,
      predictions: [
        entry,
        ...prev.predictions.filter(
          (p) => !(p.marketId === modalMarket.id && p.status === 'ACTIVE'),
        ),
      ],
    }));

    setMarkets((prev) =>
      prev.map((m) =>
        m.id !== modalMarket.id
          ? m
          : {
              ...m,
              participants: m.participants + (existing ? 0 : 1),
              ptsStaked: m.ptsStaked + (stake - refund),
            },
      ),
    );
    setModalMarket(null);
    setToast(
      `${t.locked} ${fmt(stake)} ${t.pts} ${modalSide} · ${t.potential} +${fmt(payout - stake)}`,
    );
  };

  const settleBet = (pred: UserPrediction, winningSide: Side) => {
    if (pred.status !== 'ACTIVE') return;
    const won = pred.side === winningSide;
    const payout = Math.round(pred.stake * pred.odds);
    const pnl = won ? payout - pred.stake : -pred.stake;
    const credit = won ? payout : 0;

    patchAccount((prev) => ({
      points: prev.points + credit,
      predictions: prev.predictions.map((p) =>
        p.id === pred.id
          ? {
              ...p,
              status: 'SETTLED' as const,
              result: (won ? 'WIN' : 'LOSS') as Result,
              settledPnl: pnl,
              endsInEn: 'Settled',
              endsInZh: '已結算',
            }
          : p,
      ),
    }));
    setBetsSegment('settled');
    setToast(
      won
        ? `${t.win}! +${fmt(pnl)} ${t.pts} ${t.credited}`
        : `${t.loss} · −${fmt(pred.stake)} ${t.pts}`,
    );
  };

  const switchAccount = () => {
    const name = loginName.trim() || DEFAULT_USER;
    setAccounts((prev) => {
      if (prev[name]) return prev;
      return {
        ...prev,
        [name]:
          name === DEFAULT_USER
            ? defaultAccount()
            : { points: INITIAL_POINTS, predictions: [] },
      };
    });
    setCurrentUser(name);
    setAccountOpen(false);
    setLoginName('');
    setActiveTab('markets');
    setToast(`${t.account}: ${name}`);
  };

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={C.violet} size="large" />
      </View>
    );
  }

  /* ── Header ── */
  const renderHeader = () => (
    <View style={[styles.header, { paddingHorizontal: pad }]}>
      <View style={[styles.headerRow, isWide && styles.headerRowWide]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('markets')}
          style={styles.brandBtn}
        >
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconGlyph}>🎯</Text>
          </View>
          <View>
            <Text style={styles.brandName}>{t.brand}</Text>
            <Text style={styles.brandUser}>{currentUser}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
            style={styles.langBtn}
          >
            <Text style={styles.langText}>🌐 EN / 中文</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setLoginName(currentUser);
              setAccountOpen(true);
            }}
            style={styles.accountBtn}
          >
            <Text style={styles.accountBtnText}>{t.account}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pills}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setActiveTab('bets')}
          style={[
            styles.statPill,
            activeTab === 'bets' && styles.statPillActive,
          ]}
        >
          <Text style={styles.pillLabel}>{t.balance}</Text>
          <View style={styles.pillValueRow}>
            <Text style={styles.balanceValue}>
              {fmt(points)} {t.pts} 🌕
            </Text>
            <Sparkline color={C.violet} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setActiveTab('leaderboard')}
          style={[
            styles.statPill,
            activeTab === 'leaderboard' && styles.statPillActive,
          ]}
        >
          <Text style={styles.pillLabel}>{t.standing}</Text>
          <View style={styles.pillValueRow}>
            <Text style={styles.standingValue}>
              #{youRank} · {accuracy}% {t.acc}
            </Text>
            <Sparkline color={C.amber} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ── Markets ── */
  const renderMarkets = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignSelf: 'center',
          gap: 10,
          paddingHorizontal: pad,
          paddingVertical: 16,
          width: '100%',
        }}
      >
        {categories.map((c) => {
          const on = filter === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setFilter(c.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {featured ? (
        <View style={{ paddingHorizontal: pad, marginBottom: 22 }}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>🔥 {t.featured}</Text>
              </View>
              <Text style={styles.catTag}>
                {featured.emoji}{' '}
                {categories.find((c) => c.id === featured.category)?.label}
              </Text>
            </View>
            <Text style={[styles.heroTitle, isWide && { fontSize: 28 }]}>
              {titleOf(featured)}
            </Text>
            {activeStakeFor(predictions, featured.id) ? (
              <View style={styles.stakeBadge}>
                <Text style={styles.stakeBadgeText}>
                  {t.youPredicted}{' '}
                  {activeStakeFor(predictions, featured.id)!.side} {t.with}{' '}
                  {fmt(activeStakeFor(predictions, featured.id)!.stake)} {t.pts}
                </Text>
              </View>
            ) : null}
            <Text style={styles.meta}>
              {t.endsIn} {endsOf(featured)} · {fmt(featured.participants)}{' '}
              {t.participants} · {fmt(featured.ptsStaked)} {t.ptsStaked}
            </Text>
            <ProbabilityBar yesPct={featured.yesPct} large />
            <View
              style={[styles.heroActions, isWide && { flexDirection: 'row' }]}
            >
              <TouchableOpacity
                style={[styles.yesBtn, { flex: 1 }]}
                onPress={() => openStake(featured, 'YES')}
              >
                <Text style={[styles.ctaEyebrow, { color: C.yesDeep }]}>
                  {t.bullish}
                </Text>
                <Text style={[styles.ctaText, { color: C.yes }]}>
                  {t.predictYes} · {featured.yesOdds}x
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.noBtn, { flex: 1 }]}
                onPress={() => openStake(featured, 'NO')}
              >
                <Text style={[styles.ctaEyebrow, { color: C.noDeep }]}>
                  {t.bearish}
                </Text>
                <Text style={[styles.ctaText, { color: C.no }]}>
                  {t.predictNo} · {featured.noOdds}x
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <View
        style={{
          paddingHorizontal: pad,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
          {t.trending}
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: pad,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: cardGap,
          paddingBottom: 24,
        }}
      >
        {feed.map((m) => {
          const stakeOn = activeStakeFor(predictions, m.id);
          return (
            <View key={m.id} style={[styles.card, { width: cardWidth }]}>
              <View style={styles.cardTop}>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>
                    {m.emoji} {m.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.ends}>
                  {t.endsIn} {endsOf(m)}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{titleOf(m)}</Text>
              {stakeOn ? (
                <View
                  style={[
                    styles.stakeBadge,
                    stakeOn.side === 'NO' && styles.stakeBadgeNo,
                  ]}
                >
                  <Text
                    style={[
                      styles.stakeBadgeText,
                      stakeOn.side === 'NO' && { color: C.no },
                    ]}
                  >
                    {t.youPredicted} {stakeOn.side} {t.with}{' '}
                    {fmt(stakeOn.stake)} {t.pts}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.meta}>
                {fmt(m.participants)} {t.predictors} · {fmt(m.ptsStaked)}{' '}
                {t.pts}
              </Text>
              <ProbabilityBar yesPct={m.yesPct} />
              <View style={styles.rowGap}>
                <TouchableOpacity
                  style={styles.yesOutline}
                  onPress={() => openStake(m, 'YES')}
                >
                  <Text style={styles.yesOutlineText}>YES {m.yesOdds}x</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.noOutline}
                  onPress={() => openStake(m, 'NO')}
                >
                  <Text style={styles.noOutlineText}>NO {m.noOdds}x</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  /* ── My Bets ── */
  const renderBets = () => {
    const list = betsSegment === 'active' ? activeBets : settledBets;
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { fontSize: 24, marginTop: 16 }]}>
          {t.myBets}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.metricCard}>
            <Text style={styles.summaryLabel}>{t.totalStaked}</Text>
            <Text style={styles.summaryValue}>{fmt(totalStaked)}</Text>
            <Sparkline color={C.violet} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.summaryLabel}>{t.potentialWin}</Text>
            <Text style={[styles.summaryValue, { color: C.amber }]}>
              {fmt(potentialWin)}
            </Text>
            <Sparkline color={C.amber} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.summaryLabel}>{t.accuracy}</Text>
            <Text style={[styles.summaryValue, { color: C.yes }]}>
              {accuracy}%
            </Text>
            <Sparkline color={C.violet} />
          </View>
        </View>

        <View style={styles.segment}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              betsSegment === 'active' && styles.segmentOn,
            ]}
            onPress={() => setBetsSegment('active')}
          >
            <Text
              style={[
                styles.segmentText,
                betsSegment === 'active' && styles.segmentTextOn,
              ]}
            >
              {t.active} ({activeBets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              betsSegment === 'settled' && styles.segmentOn,
            ]}
            onPress={() => setBetsSegment('settled')}
          >
            <Text
              style={[
                styles.segmentText,
                betsSegment === 'settled' && styles.segmentTextOn,
              ]}
            >
              {t.settled} ({settledBets.length})
            </Text>
          </TouchableOpacity>
        </View>

        {list.length === 0 ? (
          <Text style={styles.empty}>
            {betsSegment === 'active' ? t.noActive : t.noSettled}
          </Text>
        ) : (
          list.map((p) => (
            <View key={p.id} style={styles.betCard}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.sidePill,
                    p.side === 'YES' ? styles.yesPill : styles.noPill,
                  ]}
                >
                  <Text
                    style={{
                      color: p.side === 'YES' ? C.yes : C.no,
                      fontWeight: '800',
                      fontSize: 12,
                    }}
                  >
                    {p.emoji} {p.side} · {p.odds}x
                  </Text>
                </View>
                {p.status === 'ACTIVE' ? (
                  <Text style={styles.ends}>
                    {t.endsIn} {endsOf(p)}
                  </Text>
                ) : (
                  <View
                    style={[
                      styles.resultPill,
                      p.result === 'WIN' ? styles.winPill : styles.lossPill,
                    ]}
                  >
                    <Text
                      style={{
                        color: p.result === 'WIN' ? C.yes : C.no,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      {p.result === 'WIN'
                        ? `+${fmt(p.settledPnl ?? 0)} ${t.pts} ${t.win}`
                        : `${fmt(p.settledPnl ?? -p.stake)} ${t.pts} ${t.loss}`}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{titleOf(p)}</Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>{t.staked}</Text>
                  <Text style={styles.statValue}>
                    {fmt(p.stake)} {t.pts}
                  </Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>
                    {p.status === 'ACTIVE' ? t.potentialReturn : t.payout}
                  </Text>
                  <Text style={[styles.statValue, { color: C.amber }]}>
                    {p.status === 'ACTIVE'
                      ? `${fmt(p.potentialPayout)} ${t.pts}`
                      : p.result === 'WIN'
                        ? `+${fmt(p.settledPnl ?? 0)} ${t.pts}`
                        : `0 ${t.pts}`}
                  </Text>
                </View>
              </View>
              {p.status === 'ACTIVE' ? (
                <View style={styles.resolveBox}>
                  <Text style={styles.resolveTitle}>{t.resolveTitle}</Text>
                  <Text style={styles.resolveHint}>{t.resolveHint}</Text>
                  <View style={styles.rowGap}>
                    <TouchableOpacity
                      style={styles.simYes}
                      onPress={() => settleBet(p, 'YES')}
                    >
                      <Text style={[styles.simText, { color: C.yes }]}>
                        {t.simYes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.simNo}
                      onPress={() => settleBet(p, 'NO')}
                    >
                      <Text style={[styles.simText, { color: C.no }]}>
                        {t.simNo}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  /* ── Leaderboard ── */
  const renderLeaderboard = () => {
    const podium = leaders.slice(0, 3);
    const rest = leaders.slice(3);
    const podiumColors = ['#C4B5FD', C.cyan, C.amber];
    const byAccuracy = leaderboardSort === 'accuracy';
    const subtitle = byAccuracy ? t.rankingsSubAcc : t.rankingsSubPts;
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingHorizontal: pad,
          paddingBottom: 40,
          maxWidth: 960,
          alignSelf: 'center',
          width: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { fontSize: 24, marginTop: 16 }]}>
          {t.rankings}
        </Text>
        <Text style={[styles.sectionSub, { marginBottom: 10 }]}>
          {subtitle}
        </Text>

        <View style={styles.lbSegment}>
          <TouchableOpacity
            onPress={() => setLeaderboardSort('accuracy')}
            style={[
              styles.lbSegmentBtn,
              byAccuracy && styles.lbSegmentOn,
            ]}
          >
            <Text
              style={[
                styles.lbSegmentText,
                byAccuracy && styles.lbSegmentTextOn,
              ]}
            >
              {t.lbAcc}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLeaderboardSort('points')}
            style={[
              styles.lbSegmentBtn,
              !byAccuracy && styles.lbSegmentOn,
            ]}
          >
            <Text
              style={[
                styles.lbSegmentText,
                !byAccuracy && styles.lbSegmentTextOn,
              ]}
            >
              {t.lbPts}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.podium, isWide && { flexDirection: 'row' }]}>
          {podium.map((l, i) => (
            <View
              key={`${leaderboardSort}-${l.id}`}
              style={[
                styles.podiumCard,
                i === 0 && styles.podiumFirst,
                l.isYou && styles.youGlow,
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={[styles.rankBadgeText, { color: podiumColors[i] }]}>
                  #{i + 1}
                </Text>
              </View>
              <Text style={{ fontSize: 26 }}>{l.emoji}</Text>
              <Text style={styles.podiumName} numberOfLines={1}>
                {l.username}
                {l.isYou ? ` (${t.you})` : ''}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {lang === 'zh' ? l.badgeZh : l.badgeEn}
                </Text>
              </View>
              {byAccuracy ? (
                <>
                  <Text style={{ color: C.yes, fontWeight: '800', fontSize: 17 }}>
                    {l.accuracy}% {t.acc}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>
                    {fmt(l.points)} {t.pts}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: C.violet, fontWeight: '800', fontSize: 17 }}>
                    {fmt(l.points)} {t.pts}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>
                    {l.accuracy}% {t.acc}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
        {rest.map((l, i) => (
          <View
            key={`${leaderboardSort}-${l.id}`}
            style={[styles.leaderRow, l.isYou && styles.youGlow]}
          >
            <Text style={[styles.rankNum, l.isYou && styles.rankNumYou]}>
              #{i + 4}
            </Text>
            <Text style={{ fontSize: 20 }}>{l.emoji}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.leaderName}>
                {l.username}
                {l.isYou ? ` (${t.you})` : ''}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {lang === 'zh' ? l.badgeZh : l.badgeEn}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {byAccuracy ? (
                <>
                  <Text style={{ color: C.yes, fontWeight: '800' }}>
                    {l.accuracy}%
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>
                    {fmt(l.points)} {t.pts}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: C.violet, fontWeight: '800' }}>
                    {fmt(l.points)} {t.pts}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>
                    {l.accuracy}%
                  </Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  /* ── Stake modal ── */
  const renderStakeModal = () => {
    if (!modalMarket) return null;
    const cardW = Math.min(width * 0.88, 420);
    return (
      <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPressIn={(e) => {
              if (slidingRef.current) {
                backdropOrigin.current = null;
                return;
              }
              backdropOrigin.current = {
                x: e.nativeEvent.pageX,
                y: e.nativeEvent.pageY,
              };
            }}
            onPress={(e) => {
              if (slidingRef.current || sliding) return;
              const o = backdropOrigin.current;
              backdropOrigin.current = null;
              if (!o) return;
              if (
                Math.abs(e.nativeEvent.pageX - o.x) > 8 ||
                Math.abs(e.nativeEvent.pageY - o.y) > 8
              )
                return;
              closeModal();
            }}
          />
          <View style={[styles.modalCard, { width: cardW }]}>
            <TouchableOpacity style={styles.closeX} onPress={closeModal}>
              <Text style={{ color: C.muted, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalKicker}>{t.stakeAmount}</Text>
            <Text style={styles.modalStake}>
              {fmt(stake)} {t.pts}
            </Text>
            <Text style={styles.modalAvail}>
              {t.available} · {fmt(availableForModal)} {t.pts}
            </Text>
            <View
              style={[
                styles.sidePill,
                styles.outcomeBadge,
                modalSide === 'YES' ? styles.yesPill : styles.noPill,
              ]}
            >
              <Text style={styles.outcomeBadgeText}>
                {t.predicting} {modalSide} @ {odds}x
              </Text>
            </View>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {modalMarket.emoji} {titleOf(modalMarket)}
            </Text>
            <View style={styles.presets}>
              {STAKE_PRESETS.map((p) => {
                const disabled = p > maxStake || !canStake;
                const on = stake === p;
                return (
                  <TouchableOpacity
                    key={p}
                    disabled={disabled}
                    onPress={() => {
                      setStake(p);
                      setAttempted(false);
                    }}
                    style={[
                      styles.presetBtn,
                      on && styles.presetOn,
                      disabled && { opacity: 0.35 },
                    ]}
                  >
                    <Text style={[styles.presetText, on && styles.presetTextOn]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {canStake ? (
              <StakeSlider
                value={Math.min(Math.max(stake, MIN_STAKE), maxStake)}
                min={MIN_STAKE}
                max={Math.max(MIN_STAKE, maxStake)}
                onChange={(v) => {
                  setStake(v);
                  setAttempted(false);
                }}
                onDragStart={() => {
                  slidingRef.current = true;
                  setSliding(true);
                }}
                onDragEnd={() => {
                  requestAnimationFrame(() => {
                    slidingRef.current = false;
                    setSliding(false);
                  });
                }}
              />
            ) : (
              <Text style={styles.error}>{t.insufficient}</Text>
            )}
            {(attempted && insufficient) || !canStake ? (
              <Text style={styles.error}>{t.insufficient}</Text>
            ) : null}
            <View style={styles.calcBox}>
              <Text style={styles.calcMain}>
                {t.winPlus} +{fmt(Math.max(0, Math.round(stake * (odds - 1))))}{' '}
                {t.pts}
              </Text>
              <Text style={styles.meta}>
                {t.returnIf} {fmt(Math.round(stake * odds))} {t.ifCorrect}
              </Text>
            </View>
            <TouchableOpacity
              disabled={insufficient}
              onPress={confirmStake}
              style={[styles.accentBtn, insufficient && { opacity: 0.4 }]}
            >
              <Text style={styles.accentBtnText}>{t.confirm}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal} style={{ paddingVertical: 8 }}>
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  /* ── Account modal ── */
  const renderAccountModal = () => (
    <Modal
      visible={accountOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setAccountOpen(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setAccountOpen(false)}
        />
        <View style={[styles.modalCard, { width: Math.min(width * 0.9, 400) }]}>
          <Text style={styles.accountModalTitle}>{t.switchAccount}</Text>
          <Text style={styles.accountFieldLabel}>{t.username}</Text>
          <TextInput
            value={loginName}
            onChangeText={setLoginName}
            placeholder={t.usernamePh}
            placeholderTextColor={C.mutedSoft}
            autoCapitalize="none"
            style={styles.accountInput}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {Object.keys(accounts).map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => setLoginName(name)}
                style={[
                  styles.accountChip,
                  loginName === name && styles.accountChipOn,
                ]}
              >
                <Text
                  style={[
                    styles.accountChipText,
                    loginName === name && styles.accountChipTextOn,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.accentBtn} onPress={switchAccount}>
            <Text style={styles.accountPrimaryBtnText}>{t.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAccountOpen(false)}
            style={{ paddingVertical: 10 }}
          >
            <Text style={styles.accountCloseText}>{t.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.shell}>
        {renderHeader()}
        <View style={styles.flex}>
          {activeTab === 'markets'
            ? renderMarkets()
            : activeTab === 'bets'
              ? renderBets()
              : renderLeaderboard()}
        </View>
        <View
          style={[
            styles.tabBar,
            {
              marginBottom: 16 + Math.max(insets.bottom, 0),
              maxWidth: Math.min(width - 40, 520),
              width: width - 40,
              alignSelf: 'center',
              ...(Platform.OS === 'web'
                ? ({
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                  } as object)
                : {}),
            },
          ]}
        >
          {(
            [
              ['markets', '📈', t.markets],
              ['bets', '📊', t.myBets],
              ['leaderboard', '🏆', t.leaderboard],
            ] as const
          ).map(([id, emoji, label]) => {
            const on = activeTab === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveTab(id)}
                activeOpacity={0.85}
                style={[styles.tab, on && styles.tabOn]}
              >
                <Text style={[styles.tabIcon, on && styles.tabIconOn]}>
                  {emoji}
                </Text>
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {renderStakeModal()}
      {renderAccountModal()}
      <Toast message={toast} onHide={() => setToast(null)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RightPickApp />
    </SafeAreaProvider>
  );
}

/* ═══════════════════════ Styles ═══════════════════════ */

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    ...noSelect,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    backgroundColor: C.bg,
  },
  flex: { flex: 1 },
  header: {
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    gap: 12,
  },
  headerRow: { gap: 10 },
  headerRowWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.violetDim,
    borderWidth: 1,
    borderColor: 'rgba(138,92,246,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconGlyph: { fontSize: 20 },
  brandName: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  brandUser: {
    color: C.label,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  headerActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  langBtn: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.borderMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langText: { color: C.cyan, fontWeight: '700', fontSize: 12 },
  accountBtn: {
    backgroundColor: C.violetDim,
    borderWidth: 1,
    borderColor: C.violetBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accountBtnText: { color: C.violet, fontWeight: '800', fontSize: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill: {
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.borderMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statPillActive: {
    borderWidth: 2,
    borderColor: C.violetHot,
    backgroundColor: C.violetDim,
    shadowColor: C.violetHot,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  pillLabel: {
    color: C.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pillValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  balanceValue: { color: C.white, fontWeight: '800', fontSize: 16 },
  standingValue: { color: C.white, fontWeight: '700', fontSize: 14 },
  spark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  sparkBar: { width: 3, borderRadius: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipOn: {
    backgroundColor: C.violetDim,
    borderColor: C.violetHot,
    borderWidth: 2,
    shadowColor: C.violetHot,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  chipText: { color: C.muted, fontWeight: '700', fontSize: 13 },
  chipTextOn: { color: C.violet, fontWeight: '800' },
  hero: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: C.violetHot,
    borderColor: C.violet,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featuredBadgeText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  catTag: { color: C.cyan, fontWeight: '700', fontSize: 12 },
  heroTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  heroActions: { gap: 10, marginTop: 2 },
  sectionTitle: { color: C.white, fontSize: 19, fontWeight: '800' },
  sectionSub: {
    color: C.mutedSoft,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  sectionCount: { color: C.label, fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    gap: 11,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  catPill: {
    backgroundColor: C.bg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.borderMuted,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  catPillText: {
    color: C.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ends: { color: C.mutedSoft, fontSize: 12, fontWeight: '600' },
  cardTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  meta: { color: C.muted, fontSize: 12, lineHeight: 17 },
  stakeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.yesDim,
    borderColor: C.yesBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stakeBadgeNo: { backgroundColor: C.noDim, borderColor: C.noBorder },
  stakeBadgeText: { color: C.yes, fontWeight: '700', fontSize: 11 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  yesLabel: { color: C.yes, fontWeight: '800', fontSize: 12 },
  noLabel: { color: C.no, fontWeight: '800', fontSize: 12 },
  barTrack: {
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(42,34,66,0.9)',
    width: '100%',
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  barYes: { backgroundColor: C.yesBar, height: '100%' },
  barNo: { backgroundColor: C.noBar, height: '100%' },
  rowGap: { flexDirection: 'row', gap: 10 },
  yesBtn: {
    backgroundColor: C.yesDim,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.yesBorder,
    paddingVertical: 13,
    alignItems: 'center',
  },
  noBtn: {
    backgroundColor: C.noDim,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.noBorder,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaEyebrow: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  ctaText: { color: C.white, fontWeight: '800', fontSize: 14 },
  yesOutline: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.yesBorder,
    backgroundColor: C.yesDim,
    paddingVertical: 11,
    alignItems: 'center',
  },
  noOutline: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.noBorder,
    backgroundColor: C.noDim,
    paddingVertical: 11,
    alignItems: 'center',
  },
  yesOutlineText: { color: C.yes, fontWeight: '800' },
  noOutlineText: { color: C.no, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metricCard: {
    flexGrow: 1,
    minWidth: 100,
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 4,
  },
  summaryLabel: {
    color: C.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  summaryValue: { color: C.white, fontSize: 18, fontWeight: '800' },
  segment: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.borderMuted,
    padding: 4,
    marginVertical: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  segmentOn: {
    backgroundColor: C.violetHot,
  },
  segmentText: { color: C.muted, fontWeight: '700', fontSize: 12 },
  segmentTextOn: { color: C.white, fontWeight: '800' },
  lbSegment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 15, 37, 0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.borderMuted,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  lbSegmentBtn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbSegmentOn: {
    backgroundColor: 'rgba(138, 92, 246, 0.2)',
  },
  lbSegmentText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  lbSegmentTextOn: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  empty: {
    color: C.muted,
    textAlign: 'center',
    paddingVertical: 36,
    lineHeight: 20,
  },
  betCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 11,
    marginBottom: 11,
  },
  sidePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  yesPill: { backgroundColor: C.yesDim, borderColor: C.yesBorder },
  noPill: { backgroundColor: C.noDim, borderColor: C.noBorder },
  resultPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  winPill: { backgroundColor: C.yesDim, borderColor: C.yesBorder },
  lossPill: { backgroundColor: C.noDim, borderColor: C.noBorder },
  statsRow: { flexDirection: 'row', gap: 22 },
  statLabel: {
    color: C.mutedSoft,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: { color: C.text, fontWeight: '700', fontSize: 14, marginTop: 3 },
  resolveBox: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 7,
  },
  resolveTitle: { color: C.text, fontWeight: '800', fontSize: 12 },
  resolveHint: { color: C.muted, fontSize: 11, marginBottom: 2 },
  simYes: {
    flex: 1,
    backgroundColor: C.yesDim,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.yesBorder,
    paddingVertical: 11,
    alignItems: 'center',
  },
  simNo: {
    flex: 1,
    backgroundColor: C.noDim,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.noBorder,
    paddingVertical: 11,
    alignItems: 'center',
  },
  simText: { color: C.white, fontWeight: '800', fontSize: 12 },
  podium: { gap: 10, marginBottom: 12 },
  podiumCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    alignItems: 'center',
    gap: 5,
  },
  podiumFirst: {
    borderColor: C.borderMuted,
    borderWidth: 1.5,
    backgroundColor: C.surfaceAlt,
  },
  youGlow: {
    borderColor: C.violetHot,
    borderWidth: 2,
    backgroundColor: C.violetDim,
    shadowColor: C.violetHot,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  podiumName: { color: C.white, fontWeight: '800', fontSize: 13 },
  badge: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { color: C.cyan, fontSize: 10, fontWeight: '700' },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 9,
  },
  rankNum: { width: 34, color: C.label, fontWeight: '800' },
  rankNumYou: { color: C.violet },
  rankBadge: {
    backgroundColor: C.violetDim,
    borderWidth: 1,
    borderColor: C.violetBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rankBadgeText: { fontWeight: '800', fontSize: 15 },
  leaderName: { color: C.white, fontWeight: '700', fontSize: 13 },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(138, 92, 246, 0.2)',
    backgroundColor: 'rgba(18, 15, 37, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 22,
  },
  tabOn: {
    backgroundColor: 'rgba(138, 92, 246, 0.18)',
  },
  tabIcon: {
    fontSize: 16,
    lineHeight: 20,
    opacity: 0.72,
  },
  tabIconOn: {
    opacity: 1,
    textShadowColor: '#A855F7',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabLabelOn: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: C.overlay,
  },
  modalCard: {
    backgroundColor: '#120F25',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(138,92,246,0.2)',
    padding: 22,
    alignItems: 'center',
    gap: 9,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  closeX: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#1C1733',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalKicker: {
    color: C.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  modalStake: {
    color: C.white,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  modalAvail: {
    color: C.mutedSoft,
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
  },
  modalTitle: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  outcomeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  outcomeBadgeText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 12,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  presetBtn: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#1C1733',
  },
  presetOn: {
    backgroundColor: '#1C1733',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1.5,
  },
  presetText: { color: C.muted, fontWeight: '800', fontSize: 12 },
  presetTextOn: { color: C.white },
  sliderHit: { width: '100%', height: 42, justifyContent: 'center' },
  sliderTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: C.borderMuted,
    overflow: 'hidden',
  },
  sliderFill: { height: '100%', backgroundColor: C.violetHot },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: C.violet,
    borderWidth: 3,
    borderColor: C.white,
    shadowColor: C.violetHot,
    shadowOpacity: 0.65,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  error: {
    color: C.no,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  calcBox: {
    width: '100%',
    backgroundColor: '#0C0A16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,92,246,0.2)',
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  calcMain: { color: C.white, fontWeight: '800', fontSize: 15 },
  accentBtn: {
    width: '100%',
    backgroundColor: C.violetHot,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: C.violetHot,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  accentBtnText: { color: C.white, fontWeight: '800', fontSize: 14 },
  cancelText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  accountInput: {
    width: '100%',
    backgroundColor: '#0C0A16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  accountModalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  accountFieldLabel: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    width: '100%',
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#1C1733',
  },
  accountChipOn: {
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1.5,
  },
  accountChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  accountChipTextOn: {
    color: '#FFFFFF',
  },
  accountPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  accountCloseText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 92,
    alignSelf: 'center',
    maxWidth: 460,
    backgroundColor: '#1A1030',
    borderWidth: 1,
    borderColor: C.violetHot,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});
