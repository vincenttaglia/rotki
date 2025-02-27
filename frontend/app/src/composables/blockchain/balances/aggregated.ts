import type { AssetBalance, AssetBalanceWithPrice, BigNumber } from '@rotki/common';
import type { AssetBalances } from '@/types/balances';
import type { ComputedRef } from 'vue';
import type { MaybeRef } from '@vueuse/core';

interface UseBlockchainAggregatedBalancesReturn {
  blockchainTotal: ComputedRef<BigNumber>;
  blockchainAssets: (chains: MaybeRef<string[]>) => ComputedRef<AssetBalanceWithPrice[]>;
  locationBreakdown: ComputedRef<AssetBalances>;
}

export function useBlockchainAggregatedBalances(): UseBlockchainAggregatedBalancesReturn {
  const { isAssetIgnored } = useIgnoredAssetsStore();
  const { getAssociatedAssetIdentifier } = useAssetInfoRetrieval();
  const { assetPrice } = useBalancePricesStore();
  const { toSortedAssetBalanceWithPrice, toSortedAssetBalanceArray } = useBalanceSorting();
  const blockchainStore = useBlockchainStore();
  const { aggregatedTotalsWithFilter } = blockchainStore;
  const { aggregatedTotals } = storeToRefs(blockchainStore);

  const getTotals = (): AssetBalance[] => {
    const ownedAssets = mergeAssociatedAssets(aggregatedTotals, getAssociatedAssetIdentifier);
    return toSortedAssetBalanceArray(get(ownedAssets), asset => get(isAssetIgnored(asset)));
  };

  const blockchainTotal = computed<BigNumber>(() => bigNumberSum(getTotals().map(asset => asset.usdValue)));

  const blockchainAssets = (chains: MaybeRef<string[]> = []): ComputedRef<AssetBalanceWithPrice[]> => computed(() => {
    const ownedAssets = mergeAssociatedAssets(get(aggregatedTotalsWithFilter(chains)), getAssociatedAssetIdentifier);
    return toSortedAssetBalanceWithPrice(get(ownedAssets), asset => get(isAssetIgnored(asset)), assetPrice);
  });

  const locationBreakdown = computed<AssetBalances>(() => {
    const assets: AssetBalances = {};
    for (const asset of getTotals()) appendAssetBalance(asset, assets, getAssociatedAssetIdentifier);

    return assets;
  });

  return {
    blockchainTotal,
    blockchainAssets,
    locationBreakdown,
  };
}
