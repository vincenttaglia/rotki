<script lang="ts" setup>
import type { AccountingRuleEntry } from '@/types/settings/accounting';

const props = withDefaults(
  defineProps<{
    editableItem?: AccountingRuleEntry | null;
    loading?: boolean;
  }>(),
  {
    editableItem: null,
    loading: false,
  },
);

const { editableItem } = toRefs(props);

const { openDialog, submitting, closeDialog, trySubmit, stateUpdated } = useAccountingRuleForm();

const { t } = useI18n();

const title = computed<string>(() => {
  const item = get(editableItem);
  return item && item.identifier > 0 ? t('accounting_settings.rule.edit') : t('accounting_settings.rule.add');
});
</script>

<template>
  <BigDialog
    :display="openDialog"
    :title="title"
    :primary-action="t('common.actions.save')"
    :action-disabled="loading"
    :loading="submitting"
    :prompt-on-close="stateUpdated"
    @confirm="trySubmit()"
    @cancel="closeDialog()"
  >
    <AccountingRuleForm :editable-item="editableItem" />
  </BigDialog>
</template>
