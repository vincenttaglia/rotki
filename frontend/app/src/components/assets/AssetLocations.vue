<script setup lang="ts">
import { type BigNumber, Blockchain } from '@rotki/common';
import { CURRENCY_USD } from '@/types/currencies';
import { isBlockchain } from '@/types/blockchain/chains';
import type { AddressData, AssetBreakdown, BlockchainAccount } from '@/types/blockchain/accounts';
import type { DataTableColumn, DataTableSortData, TablePaginationData } from '@rotki/ui-library';

type AssetLocations = AssetLocation[];

interface AssetLocation extends AssetBreakdown {
  readonly account?: BlockchainAccount;
  readonly label: string;
}

const props = defineProps<{ identifier: string }>();

const { t } = useI18n();

const { identifier } = toRefs(props);

const sort = ref<DataTableSortData<AssetLocation>>({
  column: 'amount',
  direction: 'desc',
});

const pagination = ref({
  page: 1,
  itemsPerPage: 10,
});

const onlyTags = ref<string[]>([]);
const locationFilter = ref<string>('');
const selectedAccounts = ref<BlockchainAccount<AddressData>[]>([]);

const { currencySymbol } = storeToRefs(useGeneralSettingsStore());
const { getAccountByAddress } = useBlockchainStore();
const { detailsLoading } = storeToRefs(useStatusStore());
const { assetPriceInfo } = useAggregatedBalances();
const { assetBreakdown } = useBalancesBreakdown();
const { addressNameSelector } = useAddressesNamesStore();
const { getChainName, getChain } = useSupportedChains();

const totalUsdValue = computed<BigNumber>(() => get(assetPriceInfo(identifier)).usdValue);

const assetLocations = computed<AssetLocations>(() => {
  const breakdowns = get(assetBreakdown(get(identifier)));
  return breakdowns.map((item: AssetBreakdown) => {
    const account = item.address ? getAccountByAddress(item.address, item.location) : undefined;
    return {
      ...item,
      account,
      label: account?.label ?? '',
    };
  });
});

const visibleAssetLocations = computed<AssetLocations>(() => {
  const locations = get(assetLocations).map(item => ({
    ...item,
    label:
      (isBlockchain(item.location) ? get(addressNameSelector(item.address, item.location)) : null)
      || item.label
      || item.address,
  }));

  const tagsFilter = get(onlyTags);
  const location = get(locationFilter);
  const accounts = get(selectedAccounts);

  return locations.filter((assetLocation) => {
    const tags = assetLocation.tags ?? [];
    const includedInTags = tagsFilter.every(tag => tags.includes(tag));
    const currentLocation = assetLocation.location;
    const locationToCheck = get(getChainName(currentLocation));
    const locationMatches = !location || locationToCheck === toSentenceCase(location);
    const accountMatches = accounts.length === 0 || accounts.some(account =>
      getAccountAddress(account) === assetLocation.address,
    );

    return includedInTags && locationMatches && accountMatches;
  });
});

function getPercentage(usdValue: BigNumber): string {
  const percentage = get(totalUsdValue).isZero() ? 0 : usdValue.div(get(totalUsdValue)).multipliedBy(100);

  return percentage.toFixed(2);
}

function setTablePagination(event: TablePaginationData | undefined) {
  if (!isDefined(event))
    return;

  const { page, limit } = event;
  set(pagination, {
    page,
    itemsPerPage: limit,
  });
}

function setPage(page: number) {
  set(pagination, {
    ...get(pagination),
    page,
  });
}

const headers = computed<DataTableColumn<AssetLocation>[]>(() => {
  const visibleItemsLength = get(visibleAssetLocations).length;
  const eth2Length = get(visibleAssetLocations).filter(account => account?.location === Blockchain.ETH2).length;

  const labelAccount = t('common.account');
  const labelValidator = t('asset_locations.header.validator');

  let label: string;
  if (eth2Length === 0)
    label = labelAccount;
  else if (eth2Length === visibleItemsLength)
    label = labelValidator;
  else label = `${labelAccount} / ${labelValidator}`;

  return [
    {
      label: t('common.location'),
      key: 'location',
      align: 'center',
      cellClass: 'w-36',
      sortable: true,
    },
    {
      label,
      key: 'label',
      sortable: true,
    },
    {
      label: t('common.amount'),
      key: 'amount',
      align: 'end',
      sortable: true,
    },
    {
      label: t('asset_locations.header.value', {
        symbol: get(currencySymbol) ?? CURRENCY_USD,
      }),
      key: 'usdValue',
      align: 'end',
      sortable: true,
    },
    {
      label: t('asset_locations.header.percentage'),
      key: 'percentage',
      sortable: false,
      align: 'end',
    },
  ];
});

watch(locationFilter, (location) => {
  if (location && !getChain(location, null)) {
    set(selectedAccounts, []);
  }
});

watch(selectedAccounts, (accounts) => {
  if (accounts.length > 0 && !getChain(get(locationFilter), null)) {
    set(locationFilter, '');
  }
});

watch([onlyTags, locationFilter, selectedAccounts], () => {
  setPage(1);
});
</script>

<template>
  <RuiCard>
    <template #header>
      {{ t('asset_locations.title') }}
    </template>
    <div class="flex flex-col md:flex-row justify-end gap-2">
      <div class="w-full md:w-[20rem]">
        <LocationSelector
          v-model="locationFilter"
          :label="t('common.location')"
          dense
          clearable
          hide-details
        />
      </div>

      <BlockchainAccountSelector
        v-model="selectedAccounts"
        class="w-full md:w-[20rem]"
        variant="outlined"
        dense
        multichain
        hide-chain-icon
        unique
      />

      <div class="w-full md:w-[20rem]">
        <TagFilter v-model="onlyTags" />
      </div>
    </div>
    <RuiDataTable
      v-model:sort="sort"
      :pagination="{
        page: pagination.page,
        limit: pagination.itemsPerPage,
        total: visibleAssetLocations.length,
      }"
      :cols="headers"
      :rows="visibleAssetLocations"
      outlined
      dense
      row-attr="location"
      :loading="detailsLoading"
      @update:pagination="setTablePagination($event)"
    >
      <template #item.location="{ row }">
        <LocationDisplay
          :identifier="row.location"
          :detail-path="row.detailPath"
          class="py-2"
        />
      </template>
      <template #item.label="{ row }">
        <div class="py-4">
          <LabeledAddressDisplay
            v-if="row.account"
            :account="row.account"
          />
          <TagDisplay
            v-if="row.tags"
            :tags="row.tags"
            small
          />
        </div>
      </template>
      <template #item.amount="{ row }">
        <AmountDisplay :value="row.amount" />
      </template>
      <template #item.usdValue="{ row }">
        <AmountDisplay
          show-currency="symbol"
          :amount="row.amount"
          :price-asset="identifier"
          fiat-currency="USD"
          :value="row.usdValue"
        />
      </template>
      <template #item.percentage="{ row }">
        <PercentageDisplay :value="getPercentage(row.usdValue)" />
      </template>
    </RuiDataTable>
  </RuiCard>
</template>
