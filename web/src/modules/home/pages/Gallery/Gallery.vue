<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import { Badge, Button, Card } from '@/modules/ui/components';
import type { BadgeVariant } from '@/modules/ui/components/Badge/Badge.ts';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { GALLERY_UI_MOCK_ITEMS, type GalleryUiMockItem } from '../../mocks/gallery-ui.mock';

defineOptions({ name: 'HomeGalleryPage' });

const { isDark } = useTheme();

/** Editable copy — heart control removes items locally */
const galleryItems = ref<GalleryUiMockItem[]>([...GALLERY_UI_MOCK_ITEMS]);

const stats = computed(() => {
  const items = galleryItems.value;
  const uniqueCategories = new Set(items.map((i) => i.category)).size;
  return [
    {
      label: 'Photos',
      value: String(items.length),
      icon: 'images',
      color: 'text-primary-500 dark:text-primary-400',
    },
    {
      label: 'Categories',
      value: String(uniqueCategories),
      icon: 'tags',
      color: 'text-success-500 dark:text-success-400',
    },
  ];
});

const selected = ref<GalleryUiMockItem | null>(null);

function openDetail(item: GalleryUiMockItem): void {
  selected.value = item;
}

function closeDetail(): void {
  selected.value = null;
}

function removeFromGallery(item: GalleryUiMockItem, event?: Event): void {
  event?.stopPropagation();
  event?.preventDefault();
  galleryItems.value = galleryItems.value.filter((i) => i.id !== item.id);
  if (selected.value?.id === item.id) {
    closeDetail();
  }
}

const categoryBadgeVariant: Record<GalleryUiMockItem['category'], BadgeVariant> = {
  Workspace: 'info',
  Retail: 'default',
  Team: 'success',
  Brand: 'warning',
};

function badgeVariant(category: GalleryUiMockItem['category']): BadgeVariant {
  return categoryBadgeVariant[category];
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeDetail();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300 py-8 px-4"
    :class="isDark ? 'text-gray-100' : 'text-gray-800'"
  >
    <div class="mx-auto flex w-full max-w-4xl flex-col space-y-8">
      <TitleCard title="Gallery" icon="images" :show-back-button="true" />

      <!-- Stats -->
      <div
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      >
        <Card
          v-for="stat in stats"
          :key="stat.label"
          variant="default"
          padding="sm"
          class="transition-all duration-300 hover:scale-[1.02]"
        >
          <div class="flex items-center gap-3">
            <FontAwesomeIcon
              :icon="['fas', stat.icon]"
              class="flex-shrink-0 text-xl"
              :class="stat.color"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm opacity-70">{{ stat.label }}</p>
              <p class="truncate text-xl font-bold sm:text-2xl">{{ stat.value }}</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Grid -->
      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 } },
        }"
      >
        <div
          v-if="galleryItems.length === 0"
          class="rounded-lg border border-dashed p-10 text-center"
          :class="isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'"
        >
          <FontAwesomeIcon :icon="['fas', 'heart']" class="mx-auto mb-3 text-3xl text-red-500" />
          <p class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
            Your gallery is empty
          </p>
          <p class="mt-1 text-xs opacity-80">Removed items stay gone until you refresh the page.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Card
            v-for="item in galleryItems"
            :key="item.id"
            variant="default"
            padding="none"
            hover
            clickable
            class="group overflow-hidden transition-all duration-300"
            :clickable-aria-label="`Open ${item.title}`"
            @click="openDetail(item)"
          >
            <div
              class="relative aspect-square bg-gradient-to-br transition-transform duration-300 group-hover:scale-[1.03]"
              :class="item.gradientClass"
            >
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              />
              <button
                type="button"
                class="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white active:scale-95 dark:bg-white/20 dark:ring-white/20 dark:hover:bg-white/30 touch-manipulation"
                title="Remove from gallery"
                aria-label="Remove from gallery"
                @click="removeFromGallery(item, $event)"
              >
                <FontAwesomeIcon :icon="['fas', 'heart']" class="h-4 w-4 text-red-500" />
              </button>
              <div class="absolute inset-0 flex items-center justify-center opacity-30">
                <FontAwesomeIcon :icon="['fas', 'image']" class="text-5xl text-white" />
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3 text-left">
                <Badge :variant="badgeVariant(item.category)" size="sm" class="mb-2">
                  {{ item.category }}
                </Badge>
                <h3
                  class="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-md"
                >
                  {{ item.title }}
                </h3>
                <p class="mt-0.5 line-clamp-1 text-xs text-white/85">
                  {{ item.subtitle }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Detail overlay -->
    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          @click="closeDetail"
        />
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'gallery-detail-title'"
          class="relative z-10 w-full max-w-lg"
        >
          <Card variant="default" padding="none" class="overflow-hidden shadow-2xl">
            <div
              class="relative aspect-[4/3] bg-gradient-to-br sm:aspect-video"
              :class="selected.gradientClass"
            >
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
              />
              <div class="absolute right-3 top-3 z-10 flex gap-2">
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white active:scale-95 dark:bg-white/20 dark:ring-white/20 dark:hover:bg-white/30 touch-manipulation"
                  title="Remove from gallery"
                  aria-label="Remove from gallery"
                  @click="removeFromGallery(selected, $event)"
                >
                  <FontAwesomeIcon :icon="['fas', 'heart']" class="h-4 w-4 text-red-500" />
                </button>
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 touch-manipulation"
                  aria-label="Close"
                  @click="closeDetail"
                >
                  <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-4 w-4" />
                </button>
              </div>
              <div class="absolute bottom-4 left-4 right-4">
                <Badge :variant="badgeVariant(selected.category)" size="sm" class="mb-2">
                  {{ selected.category }}
                </Badge>
                <h2 id="gallery-detail-title" class="text-2xl font-bold tracking-tight text-white">
                  {{ selected.title }}
                </h2>
                <p class="mt-1 text-sm text-white/90">{{ selected.subtitle }}</p>
              </div>
            </div>
            <div class="p-5" :class="isDark ? 'bg-gray-800' : 'bg-white'">
              <p
                class="text-sm leading-relaxed"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                Preview tile — replace with real asset metadata, captions, or lightbox controls when
                integrated with your API.
              </p>
              <div class="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="md"
                  :icon="['fas', 'heart']"
                  class="touch-manipulation border-red-300 text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-950/40 [&_svg]:text-red-500"
                  @click="removeFromGallery(selected, $event)"
                >
                  Remove from gallery
                </Button>
                <Button variant="primary" size="md" class="touch-manipulation" @click="closeDetail">
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  :icon="['fas', 'arrow-left']"
                  class="touch-manipulation"
                  @click="closeDetail"
                >
                  Back to grid
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Teleport>
  </div>
</template>
