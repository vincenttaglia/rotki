<script setup lang="ts">
import { getAddressFromEvmIdentifier, getIdentifierFromSymbolMap, isEvmIdentifier } from '@rotki/common';
import { useCurrencies } from '@/types/currencies';
import { isBlockchain } from '@/types/blockchain/chains';
import type { StyleValue } from 'vue';
import type { AssetResolutionOptions } from '@/composables/assets/retrieval';

const props = withDefaults(
  defineProps<{
    identifier: string;
    size: string;
    styled?: StyleValue;
    noTooltip?: boolean;
    circle?: boolean;
    padding?: string;
    chainIconPadding?: string;
    enableAssociation?: boolean;
    showChain?: boolean;
    flat?: boolean;
    resolutionOptions?: AssetResolutionOptions;
    chainIconSize?: string;
  }>(),
  {
    styled: undefined,
    noTooltip: false,
    circle: false,
    padding: '2px',
    chainIconPadding: '0.5px',
    enableAssociation: true,
    showChain: true,
    flat: false,
    resolutionOptions: () => ({}),
  },
);

const emit = defineEmits<{ (e: 'click'): void }>();

const { t } = useI18n();

const { identifier, padding, size, resolutionOptions, showChain, chainIconSize } = toRefs(props);

const error = ref<boolean>(false);
const pending = ref<boolean>(true);

const { currencies } = useCurrencies();

const mappedIdentifier = computed<string>(() => {
  const id = getIdentifierFromSymbolMap(get(identifier));
  return isBlockchain(id) ? id.toUpperCase() : id;
});

const currency = computed<string | undefined>(() => {
  const id = get(mappedIdentifier);

  const fiatCurrencies = get(currencies).filter(({ crypto }) => !crypto);
  return fiatCurrencies.find(({ tickerSymbol }) => tickerSymbol === id)?.unicodeSymbol;
});

const { assetInfo } = useAssetInfoRetrieval();
const { getAssetImageUrl } = useAssetIconStore();

const asset = assetInfo(mappedIdentifier, resolutionOptions);
const isCustomAsset = computed(() => get(asset)?.isCustomAsset ?? false);
const chain = computed(() => get(asset)?.evmChain);
const symbol = computed(() => get(asset)?.symbol);
const name = computed(() => get(asset)?.name);

const displayAsset = computed<string>(() => {
  const currencySymbol = get(currency);
  if (currencySymbol)
    return currencySymbol;

  return get(symbol) ?? get(name) ?? get(mappedIdentifier) ?? '';
});

const tooltip = computed(() => {
  if (get(isCustomAsset)) {
    return {
      symbol: get(name),
      name: '',
    };
  }

  return {
    symbol: get(symbol),
    name: get(name),
  };
});

const url = reactify(getAssetImageUrl)(mappedIdentifier);

const usedChainIconSize = computed(() => get(chainIconSize) || `${(Number.parseInt(get(size)) * 50) / 100}px`);
const chainIconMargin = computed(() => `-${get(usedChainIconSize)}`);

const placeholderStyle = computed(() => {
  const pad = get(padding);
  const width = get(size);
  const prop = `calc(${pad} + ${pad} + ${width})`;
  return {
    width: prop,
    height: prop,
  };
});

watch([symbol, identifier], () => {
  set(pending, true);
  set(error, false);
});

const { copy } = useCopy(identifier);
</script>

<template>
  <RuiTooltip
    :popper="{ placement: 'top' }"
    :open-delay="400"
    :disabled="noTooltip"
    persist-on-tooltip-hover
  >
    <template #activator>
      <div
        class="relative"
        :style="placeholderStyle"
        @click="emit('click')"
      >
        <div
          v-if="showChain && chain"
          class="chain"
          :class="{
            [$style.circle]: true,
            [$style.chain]: true,
          }"
        >
          <EvmChainIcon
            :chain="chain"
            :size="usedChainIconSize"
          />
        </div>

        <div
          :style="styled"
          class="flex items-center justify-center cursor-pointer h-full w-full icon-bg"
          :class="{
            [$style.circle]: circle,
          }"
        >
          <GeneratedIcon
            v-if="!currency && pending"
            class="absolute"
            :custom-asset="isCustomAsset"
            :asset="displayAsset"
            :size="size"
            :flat="flat"
          />

          <GeneratedIcon
            v-if="currency || error"
            :custom-asset="isCustomAsset"
            :asset="displayAsset"
            :size="size"
            :flat="flat"
          />

          <AppImage
            v-else
            v-show="!pending"
            contain
            :alt="displayAsset"
            :src="url"
            :size="size"
            @loadstart="pending = true"
            @load="pending = false"
            @error="
              error = true;
              pending = false;
            "
          />
        </div>
      </div>
    </template>

    <div>
      {{ t('asset_icon.tooltip', tooltip) }}
    </div>
    <div class="font-mono flex items-center gap-2 -my-1">
      {{ (isEvmIdentifier(identifier) ? getAddressFromEvmIdentifier(identifier) : identifier) }}
      <RuiButton
        size="sm"
        variant="text"
        icon
        @click="copy()"
      >
        <template #prepend>
          <RuiIcon
            name="file-copy-line"
            size="16"
            class="!text-rui-grey-400"
          />
        </template>
      </RuiButton>
    </div>
  </RuiTooltip>
</template>

<style module lang="scss">
.circle {
  @apply rounded-full overflow-hidden #{!important};
}

.chain {
  @apply bg-white absolute z-[1] flex items-center justify-center rounded-lg shadow-sm;
  @apply border border-rui-grey-200;
  margin-top: v-bind(chainIconMargin);
  margin-left: v-bind(chainIconMargin);
  bottom: -4px;
  right: -4px;
}

:global(.dark) {
  .chain {
    @apply border-rui-grey-900;
  }
}
</style>
