<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Avatar, Button, Input, InfoBanner } from '@/modules/ui';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';

interface Props {
  isOpen: boolean;
  initialName: string;
  colorSeed: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const { isDark } = useTheme();

const draftName = ref('');
const previewUrl = ref<string | null>(null);
const photoError = ref('');
const nameError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);

const modalTitleId = 'store-identity-modal-title';

function revokePreview(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      draftName.value = props.initialName;
      photoError.value = '';
      nameError.value = '';
      revokePreview();
      if (fileInputRef.value) fileInputRef.value.value = '';
    } else {
      revokePreview();
      if (fileInputRef.value) fileInputRef.value.value = '';
    }
  }
);

function validateName(): boolean {
  const t = draftName.value.trim();
  if (t.length < STORE_FORM_LIMITS.STORE_NAME_MIN) {
    nameError.value = `El nombre debe tener al menos ${String(STORE_FORM_LIMITS.STORE_NAME_MIN)} caracteres.`;
    return false;
  }
  if (t.length > STORE_FORM_LIMITS.STORE_NAME_MAX) {
    nameError.value = `El nombre no puede superar ${String(STORE_FORM_LIMITS.STORE_NAME_MAX)} caracteres.`;
    return false;
  }
  nameError.value = '';
  return true;
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  photoError.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    photoError.value = 'Selecciona un archivo de imagen.';
    input.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    photoError.value = 'La imagen no debe superar 5 MB.';
    input.value = '';
    return;
  }
  revokePreview();
  previewUrl.value = URL.createObjectURL(file);
}

function clearPhoto(): void {
  revokePreview();
  if (fileInputRef.value) fileInputRef.value.value = '';
  photoError.value = '';
}

function handleClose(): void {
  emit('close');
}

function handleSave(): void {
  if (!validateName()) return;
  emit('save');
}

function onOverlayClick(e: MouseEvent): void {
  if (e.target === overlayRef.value) handleClose();
}

onKeyStroke('Escape', () => {
  if (props.isOpen) handleClose();
});

const avatarSrc = computed(() => previewUrl.value ?? undefined);

const panelClasses = computed(() =>
  [
    'relative w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]',
    isDark.value ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200',
  ].join(' ')
);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        ref="overlayRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        :class="isDark ? 'bg-black/60' : 'bg-gray-900/50'"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        @click="onOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="isOpen" :class="panelClasses" @click.stop>
            <div
              class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 border-b shrink-0"
              :class="isDark ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'"
            >
              <h2
                :id="modalTitleId"
                class="text-lg font-semibold min-w-0"
                :class="isDark ? 'text-white' : 'text-gray-900'"
              >
                Editar identidad
              </h2>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 transition-colors duration-200 cursor-pointer min-h-11 min-w-11 inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                :class="
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                "
                aria-label="Cerrar"
                @click="handleClose"
              >
                <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>

            <div class="overflow-y-auto flex-1 min-h-0 p-4 sm:p-5 flex flex-col gap-5">
              <InfoBanner
                variant="info"
                title="Cambios locales"
                description="El nombre y la foto aún no se guardan en el servidor. Esta vista es solo para probar el flujo."
              />

              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar
                  :name="draftName.trim() || initialName"
                  :color-seed="colorSeed"
                  :src="avatarSrc"
                  size="lg"
                  class="shrink-0"
                />
                <div class="flex flex-col gap-2 w-full min-w-0">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    aria-label="Seleccionar foto de perfil"
                    @change="onFileChange"
                  />
                  <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      class="touch-manipulation min-h-11"
                      :icon="['fas', 'image']"
                      @click="fileInputRef?.click()"
                    >
                      Cambiar foto
                    </Button>
                    <Button
                      v-if="previewUrl"
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="touch-manipulation min-h-11"
                      @click="clearPhoto"
                    >
                      Quitar foto
                    </Button>
                  </div>
                  <p v-if="photoError" class="text-sm text-error" role="alert">
                    {{ photoError }}
                  </p>
                </div>
              </div>

              <Input
                id="store-identity-name"
                v-model="draftName"
                label="Nombre de la tienda"
                placeholder="Nombre visible"
                :prefix-icon="['fas', 'store']"
                :error="!!nameError"
                :error-message="nameError"
                :maxlength="STORE_FORM_LIMITS.STORE_NAME_MAX"
                :helper-text="`Entre ${String(STORE_FORM_LIMITS.STORE_NAME_MIN)} y ${String(STORE_FORM_LIMITS.STORE_NAME_MAX)} caracteres.`"
                full-width
                name="store-identity-name"
                autocomplete="organization"
              />
            </div>

            <div
              class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end p-4 sm:p-5 border-t shrink-0"
              :class="isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'"
            >
              <Button
                type="button"
                variant="ghost"
                class="w-full sm:w-auto min-h-11 touch-manipulation"
                @click="handleClose"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                class="w-full sm:w-auto min-h-11 touch-manipulation"
                @click="handleSave"
              >
                Guardar
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
