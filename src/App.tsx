import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StickyHeader } from './components/StickyHeader';
import { CategoryChips } from './components/CategoryChips';
import { FeaturedCard } from './components/FeaturedCard';
import { MarketCard } from './components/MarketCard';
import { PredictionModal } from './components/PredictionModal';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { MyPredictionsScreen } from './components/MyPredictionsScreen';
import { ProposeBanner } from './components/ProposeBanner';
import { Toast } from './components/Toast';
import {
  MARKETS,
  USER,
  formatPts,
  INITIAL_USER_PREDICTIONS,
  getActiveStakeForMarket,
} from './data';
import type {
  ActivePrediction,
  CategoryId,
  PredictionSide,
  Market,
  UserPrediction,
} from './types';
import { colors, noSelect, spacing, useContentLayout } from './theme';

type Tab = 'markets' | 'bets' | 'leaderboard';

export default function App() {
  const layout = useContentLayout();
  const [points, setPoints] = useState(USER.initialPoints);
  const [markets, setMarkets] = useState<Market[]>(() =>
    MARKETS.map((m) => ({ ...m })),
  );
  const [filter, setFilter] = useState<CategoryId>('all');
  const [activeTab, setActiveTab] = useState<Tab>('markets');
  const [active, setActive] = useState<ActivePrediction | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>(
    INITIAL_USER_PREDICTIONS,
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return markets;
    return markets.filter((m) => m.category === filter);
  }, [filter, markets]);

  const featured = useMemo(
    () => filtered.find((m) => m.featured) ?? null,
    [filtered],
  );

  const feed = useMemo(
    () => filtered.filter((m) => !m.featured),
    [filtered],
  );

  const openPredict = useCallback((market: Market, side: PredictionSide) => {
    setActive({ market, side });
  }, []);

  const confirmPrediction = useCallback(
    (stake: number) => {
      if (!active) return;
      if (!Number.isFinite(stake) || stake <= 0 || stake < 10) return;

      const existing = getActiveStakeForMarket(
        userPredictions,
        active.market.id,
      );
      const refund = existing?.stakedAmount ?? 0;
      const available = points + refund;
      if (stake > available) return;

      const odds =
        active.side === 'YES' ? active.market.yesOdds : active.market.noOdds;
      const potentialPayout = Math.round(stake * odds);
      const gain = potentialPayout - stake;
      const marketId = active.market.id;
      const isNewParticipant = !existing;

      const entry: UserPrediction = {
        id: `pred-${Date.now()}`,
        marketId,
        marketTitle: active.market.title,
        predictionType: active.side,
        stakedAmount: stake,
        potentialPayout,
        odds,
        timestamp: Date.now(),
        status: 'ACTIVE',
        endsIn: active.market.endsIn,
      };

      setUserPredictions((prev) => {
        const withoutSame = prev.filter(
          (p) => !(p.marketId === marketId && p.status === 'ACTIVE'),
        );
        return [entry, ...withoutSame];
      });

      setPoints((p) => p + refund - stake);

      setMarkets((prev) =>
        prev.map((m) => {
          if (m.id !== marketId) return m;
          const ptsDelta = stake - refund;
          return {
            ...m,
            participants: m.participants + (isNewParticipant ? 1 : 0),
            ptsStaked: m.ptsStaked + ptsDelta,
          };
        }),
      );

      setActive(null);
      setToast(
        `Prediction locked! ${formatPts(stake)} PTS on ${active.side} · potential +${formatPts(gain)} PTS`,
      );
    },
    [active, points, userPredictions],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />

      <View style={styles.shell}>
        <StickyHeader
          points={points}
          onBalancePress={() => setActiveTab('bets')}
          onStandingPress={() => setActiveTab('leaderboard')}
        />

        <View style={styles.body}>
          {activeTab === 'markets' ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <CategoryChips active={filter} onChange={setFilter} />

              {featured ? (
                <FeaturedCard
                  market={featured}
                  userStake={getActiveStakeForMarket(
                    userPredictions,
                    featured.id,
                  )}
                  onPredict={(side) => openPredict(featured, side)}
                />
              ) : null}

              <View
                style={[styles.sectionHeader, { paddingHorizontal: layout.pad }]}
              >
                <View>
                  <Text style={styles.sectionTitle}>Trending Markets</Text>
                  <Text style={styles.sectionSub}>
                    Hyper-local Hong Kong forecasts
                  </Text>
                </View>
                <Text style={styles.sectionCount}>{feed.length} open</Text>
              </View>

              <View
                style={[
                  styles.feed,
                  {
                    paddingHorizontal: layout.pad,
                    gap: layout.cardGap,
                  },
                ]}
              >
                {feed.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    width={layout.cardWidth}
                    userStake={getActiveStakeForMarket(
                      userPredictions,
                      market.id,
                    )}
                    onPredict={(side) => openPredict(market, side)}
                  />
                ))}
                {feed.length === 0 && !featured ? (
                  <Text style={styles.empty}>
                    No markets in this category yet. Try another filter.
                  </Text>
                ) : null}
              </View>

              <View style={{ paddingHorizontal: layout.pad }}>
                <ProposeBanner
                  onSubmitted={() =>
                    setToast('Topic Submitted! Pending crowd review.')
                  }
                />
              </View>
            </ScrollView>
          ) : activeTab === 'bets' ? (
            <MyPredictionsScreen predictions={userPredictions} />
          ) : (
            <LeaderboardScreen />
          )}
        </View>

        <View style={[styles.tabBar, { paddingHorizontal: layout.pad }]}>
          <Pressable
            onPress={() => setActiveTab('markets')}
            style={[styles.tab, activeTab === 'markets' && styles.tabActive]}
          >
            <Text style={styles.tabEmoji}>📈</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'markets' && styles.tabLabelActive,
              ]}
            >
              Markets
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('bets')}
            style={[styles.tab, activeTab === 'bets' && styles.tabActive]}
          >
            <Text style={styles.tabEmoji}>📊</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'bets' && styles.tabLabelActive,
              ]}
            >
              My Bets
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('leaderboard')}
            style={[
              styles.tab,
              activeTab === 'leaderboard' && styles.tabActive,
            ]}
          >
            <Text style={styles.tabEmoji}>🏆</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'leaderboard' && styles.tabLabelActive,
              ]}
            >
              Leaderboard
            </Text>
          </Pressable>
        </View>
      </View>

      <PredictionModal
        active={active}
        points={
          points +
          (active
            ? getActiveStakeForMarket(userPredictions, active.market.id)
                ?.stakedAmount ?? 0
            : 0)
        }
        onClose={() => setActive(null)}
        onConfirm={confirmPrediction}
      />

      <Toast message={toast} onHide={() => setToast(null)} pad={layout.pad} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    ...noSelect,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    ...noSelect,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  feed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
    fontSize: 15,
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bgSoft,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: colors.brandDim,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.brand,
  },
});
