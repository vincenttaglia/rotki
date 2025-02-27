import { AddressNamePriority } from '@/types/settings/address-name-priorities';
import { PriceOracle } from '@/types/settings/price-oracle';
import type { PrioritizedListItemData } from '@/types/settings/prioritized-list-data';

export const EmptyListId = 'empty_list_id';

export type PrioritizedListId = AddressNamePriority | PriceOracle | typeof EmptyListId;

export const BLOCKCHAIN_ACCOUNT_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.BLOCKCHAIN_ACCOUNT,
};

export const ENS_NAMES_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.ENS_NAMES,
};

export const ETHEREUM_TOKENS_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.ETHEREUM_TOKENS,
};

export const GLOBAL_ADDRESSBOOK_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.GLOBAL_ADDRESSBOOK,
};

export const HARDCODED_MAPPINGS_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.HARDCODED_MAPPINGS,
};

export const PRIVATE_ADDRESSBOOK_PRIO_LIST_ITEM: PrioritizedListItemData<AddressNamePriority> = {
  identifier: AddressNamePriority.PRIVATE_ADDRESSBOOK,
};

export const CRYPTOCOMPARE_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.CRYPTOCOMPARE,
  icon: './assets/images/services/cryptocompare.svg',
};

export const COINGECKO_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.COINGECKO,
  icon: './assets/images/services/coingecko.svg',
};

export const DEFILAMA_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.DEFILLAMA,
  icon: './assets/images/services/defillama.svg',
};

export const UNISWAP2_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.UNISWAP2,
  icon: './assets/images/protocols/uniswap.svg',
};

export const UNISWAP3_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.UNISWAP3,
  icon: './assets/images/protocols/uniswap.svg',
};

export const MANUAL_PRIO_LIST_ITEM: PrioritizedListItemData<PriceOracle> = {
  identifier: PriceOracle.MANUAL,
  icon: './assets/images/oracles/book.svg',
};
