<script setup lang="ts">
import type { Auth, ExternalServicePayloadWithAuth } from '@/types/user';

const props = withDefaults(
  defineProps<{
    credential?: Auth | null;
    name: string;
    loading?: boolean;
    tooltip?: string;
    hint?: string;
    status?: { message: string; success?: boolean };
    hideActions?: boolean;
  }>(),
  {
    credential: null,
    status: undefined,
    loading: false,
    tooltip: '',
    hint: '',
    hideActions: false,
  },
);

const emit = defineEmits<{
  (e: 'delete-key', value: string): void;
  (e: 'save', value: ExternalServicePayloadWithAuth): void;
}>();

const { t } = useI18n();
const { credential, status } = toRefs(props);

const username = ref<string>('');
const password = ref<string>('');
const editMode = ref<boolean>(false);
const cancellable = ref<boolean>(false);

const errorMessages = useRefMap(status, (status) => {
  if (!status || status.success)
    return [];

  return [status.message];
});

const successMessages = useRefMap(status, (status) => {
  if (!status || !status.success)
    return [];

  return [status.message];
});

function updateStatus() {
  const credentialVal = get(credential);
  if (!credentialVal) {
    set(cancellable, false);
    set(editMode, true);
  }
  else {
    set(cancellable, true);
    set(editMode, false);
  }

  set(username, credentialVal?.username || '');
  set(password, credentialVal?.password || '');
}

function saveHandler() {
  if (get(editMode)) {
    emit('save', {
      name: props.name,
      username: get(username),
      password: get(password),
    });
    set(editMode, false);
    set(cancellable, true);
  }
  else {
    set(editMode, true);
  }
}

function cancel() {
  set(editMode, false);
  const credentialVal = get(credential);
  if (!credentialVal)
    return;
  set(username, credentialVal.username);
  set(password, credentialVal.password);
}

watch(
  credential,
  () => {
    updateStatus();
  },
  {
    immediate: true,
    deep: true,
  },
);

const allFilled = computed(() => get(username) && get(password));
defineExpose({
  saveHandler,
  allFilled,
  editMode,
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex items-start gap-4"
      data-cy="service-key__content"
    >
      <RuiTextField
        v-model.trim="username"
        variant="outlined"
        color="primary"
        class="flex-1"
        data-cy="service-key__api-key"
        :text-color="!editMode ? 'success' : undefined"
        :error-messages="errorMessages"
        :success-messages="successMessages"
        :disabled="!editMode"
        :label="t('external_services.credential.username')"
        prepend-icon="user-line"
      />

      <RuiRevealableTextField
        v-model.trim="password"
        variant="outlined"
        color="primary"
        class="flex-1"
        data-cy="service-key__api-key"
        :text-color="!editMode ? 'success' : undefined"
        :error-messages="errorMessages.length > 0 ? [' '] : undefined"
        :success-messages="successMessages.length > 0 ? [' '] : undefined"
        :disabled="!editMode"
        :label="t('external_services.credential.password')"
        prepend-icon="key-line"
      />

      <RuiTooltip
        v-if="!hideActions"
        :open-delay="400"
        :popper="{ placement: 'top' }"
      >
        <template #activator>
          <RuiButton
            icon
            variant="text"
            data-cy="service-key__delete"
            class="mt-1"
            :disabled="loading || !credential"
            color="primary"
            @click="emit('delete-key', name)"
          >
            <RuiIcon name="delete-bin-line" />
          </RuiButton>
        </template>
        {{ tooltip }}
      </RuiTooltip>
    </div>

    <slot v-if="$slots.default" />

    <div
      v-if="!hideActions"
      class="pt-4 flex gap-2"
      data-cy="service-key__buttons"
    >
      <RuiButton
        v-if="editMode && cancellable"
        data-cy="service-key__cancel"
        variant="outlined"
        color="primary"
        @click="cancel()"
      >
        {{ t('common.actions.cancel') }}
      </RuiButton>

      <RuiButton
        data-cy="service-key__save"
        color="primary"
        :disabled="(editMode && (!username || !password)) || loading"
        @click="saveHandler()"
      >
        {{ editMode ? t('common.actions.save') : t('common.actions.edit') }}
      </RuiButton>
    </div>
  </div>
</template>
