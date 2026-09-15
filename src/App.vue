<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  darkTheme,
  NButton,
  NButtonGroup,
  NConfigProvider,
  NDialogProvider,
  NIcon,
  NMessageProvider,
  zhTW,
  dateZhTW,
} from 'naive-ui'
import { DesktopOutline, MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import { darkThemeOverrides, themeOverrides } from '@/theme/theme-overrides'
import ApplyStepper from '@/components/apply/ApplyStepper.vue'
import { useApplySteps } from '@/composables/useApplySteps'

const route = useRoute()
const router = useRouter()
const { steps } = useApplySteps()

type ThemePreference = 'system' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'goldenf-company-apply-theme'
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
const themePreference = ref<ThemePreference>(
  storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
    ? storedTheme
    : 'system',
)
const systemPrefersDark = ref(mediaQuery.matches)

const showStepper = computed(() => Boolean(route.meta.stepLabel) || route.name === 'select-combo')
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (themePreference.value === 'system') return systemPrefersDark.value ? 'dark' : 'light'
  return themePreference.value
})
const isDarkTheme = computed(() => resolvedTheme.value === 'dark')

function setThemePreference(preference: ThemePreference) {
  themePreference.value = preference
}

function handleSystemThemeChange(event: MediaQueryListEvent) {
  systemPrefersDark.value = event.matches
}

watch(themePreference, (preference) => window.localStorage.setItem(THEME_STORAGE_KEY, preference))

watch(
  isDarkTheme,
  (isDark) => document.documentElement.classList.toggle('theme-dark', isDark),
  { immediate: true },
)

onMounted(() => {
  mediaQuery.addEventListener('change', handleSystemThemeChange)
})
onBeforeUnmount(() => {
  mediaQuery.removeEventListener('change', handleSystemThemeChange)
  document.documentElement.classList.remove('theme-dark')
})

function navigateStep(path: string) {
  router.push(path)
}
</script>

<template>
  <NConfigProvider
    :theme="isDarkTheme ? darkTheme : null"
    :theme-overrides="isDarkTheme ? darkThemeOverrides : themeOverrides"
    :locale="zhTW"
    :date-locale="dateZhTW"
  >
    <NMessageProvider>
      <NDialogProvider>
        <div
          class="app-shell"
          :class="{ 'has-stepper': showStepper }"
        >
          <header class="app-shell__header">
            <div class="app-shell__brand">
              <span class="app-shell__logo" aria-hidden="true">GF</span>
              <div class="app-shell__title-group">
                <span class="app-shell__title">開線申請</span>
                <span class="app-shell__subtitle">Company Apply</span>
              </div>
            </div>
            <div class="app-shell__actions">
              <NButtonGroup class="theme-switcher" aria-label="顯示模式 Display mode">
                <NButton
                  v-for="item in [
                    { value: 'system' as const, label: '系統', labelEn: 'System', icon: DesktopOutline },
                    { value: 'light' as const, label: '淺色', labelEn: 'Light', icon: SunnyOutline },
                    { value: 'dark' as const, label: '深色', labelEn: 'Dark', icon: MoonOutline },
                  ]"
                  :key="item.value"
                  :type="themePreference === item.value ? 'primary' : 'default'"
                  :secondary="themePreference === item.value"
                  :aria-pressed="themePreference === item.value"
                  :aria-label="`${item.label}模式 ${item.labelEn} mode`"
                  size="small"
                  @click="setThemePreference(item.value)"
                >
                  <template #icon>
                    <NIcon :component="item.icon" aria-hidden="true" />
                  </template>
                  <span class="theme-switcher__label">
                    {{ item.label }} <small>{{ item.labelEn }}</small>
                  </span>
                </NButton>
              </NButtonGroup>
              <RouterLink to="/apply/preview" class="app-shell__preview-link">
                畫面總覽 <small>Preview</small>
              </RouterLink>
            </div>
          </header>

          <Teleport to="body">
            <div v-if="showStepper" class="app-shell__stepper">
              <div class="app-shell__stepper-inner">
                <ApplyStepper :steps="steps" @navigate="navigateStep" />
              </div>
            </div>
          </Teleport>

          <main class="app-shell__main">
            <RouterView v-slot="{ Component }">
              <Transition name="fade-slide" mode="out-in">
                <component :is="Component" />
              </Transition>
            </RouterView>
          </main>
        </div>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
:root {
  color-scheme: light;
  --app-stepper-height: 73px;
  --color-primary: #3e5b4c;
  --color-primary-hover: #334b41;
  --color-primary-pressed: #293d35;
  --color-primary-suppl: #9cafa4;
  --color-primary-soft: #e8eee9;
  --color-on-primary: #ffffff;
  --color-page: #f3f2ed;
  --color-surface: #fcfbf8;
  --color-surface-muted: #eeeee7;
  --color-surface-hover: #f5f4ef;
  --color-tag-surface: #f8f7f2;
  --color-border: #d2d5cd;
  --color-border-strong: #bcc3bb;
  --color-control-border: #9ca69f;
  --color-divider: #e1e3dc;
  --color-text: #252a27;
  --color-text-secondary: #4b5650;
  --color-text-muted: #65716b;
  --color-text-disabled: #8c958f;
  --color-warning: #a15817;
  --color-warning-soft: #f7ebdd;
  --color-warning-border: #dfc19a;
  --color-error: #a84f48;
  --color-error-strong: #7e3b36;
  --color-error-soft: #f8ecea;
  --color-error-border: #e5c5c1;
  --color-success: #47715a;
  --color-success-soft: #e8f0ea;
  --color-success-border: #bcd0c2;
  --shadow-card: 3px 4px 0 rgba(75, 86, 80, 0.08);
  --shadow-card-hover: 5px 6px 0 rgba(75, 86, 80, 0.1);
  --shadow-selected: 3px 4px 0 rgba(62, 91, 76, 0.11);
  --focus-ring: rgba(62, 91, 76, 0.32);
}

:root.theme-dark {
  color-scheme: dark;
  --color-primary: #9bb8a6;
  --color-primary-hover: #acc6b5;
  --color-primary-pressed: #83a390;
  --color-primary-suppl: #6f8979;
  --color-primary-soft: #2c3931;
  --color-on-primary: #18201a;
  --color-page: #171c19;
  --color-surface: #1f2521;
  --color-surface-muted: #282f2a;
  --color-surface-hover: #2d352f;
  --color-tag-surface: #242b26;
  --color-border: #3b453e;
  --color-border-strong: #56635a;
  --color-control-border: #69756d;
  --color-divider: #303932;
  --color-text: #f1f0e9;
  --color-text-secondary: #d1d6d0;
  --color-text-muted: #aeb8b1;
  --color-text-disabled: #7c8780;
  --color-warning: #d6a15f;
  --color-warning-soft: #332a1f;
  --color-warning-border: #725839;
  --color-error: #d28a82;
  --color-error-strong: #e0a19a;
  --color-error-soft: #352424;
  --color-error-border: #714944;
  --color-success: #8eba9b;
  --color-success-soft: #203229;
  --color-success-border: #496a55;
  --shadow-card: 3px 4px 0 rgba(4, 8, 6, 0.22);
  --shadow-card-hover: 5px 6px 0 rgba(4, 8, 6, 0.3);
  --shadow-selected: 3px 4px 0 rgba(4, 8, 6, 0.28);
  --focus-ring: rgba(155, 184, 166, 0.42);
}

html,
body {
  margin: 0;
  background: var(--color-page);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.55;
}

#app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

.n-card:not(.n-modal) {
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(37, 42, 39, 0.05),
    var(--shadow-card);
}

.n-card:not(.n-modal)::before {
  content: '';
  position: absolute;
  z-index: 1;
  top: 0;
  left: 24px;
  width: 52px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary-suppl);
}

.n-card.n-card--hoverable {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.n-card.n-card--hoverable:hover {
  transform: translate(-1px, -1px);
  box-shadow:
    0 2px 0 rgba(37, 42, 39, 0.05),
    var(--shadow-card-hover);
}
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--color-page);
}

.app-shell.has-stepper {
  padding-top: var(--app-stepper-height);
}

.app-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px clamp(16px, 4vw, 40px);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-shell__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-shell__logo {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.app-shell__actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.theme-switcher :deep(.n-button) {
  min-height: 40px;
  padding-inline: 12px;
}

.theme-switcher__label small,
.app-shell__preview-link small {
  margin-left: 3px;
  font-size: 0.82em;
  font-weight: 400;
  color: inherit;
}

.theme-switcher :deep(.n-button:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.app-shell__title-group {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.app-shell__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.app-shell__subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  letter-spacing: 0.03em;
}

.app-shell__preview-link {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.app-shell__preview-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.app-shell__stepper {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  height: var(--app-stepper-height);
  padding: 10px clamp(16px, 4vw, 40px);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(4, 8, 6, 0.04);
}

:root.theme-dark .app-shell__stepper {
  box-shadow: 0 4px 14px rgba(4, 8, 6, 0.24);
}

.app-shell__stepper-inner {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.app-shell__main {
  flex: 1;
  padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 64px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none;
  }

  .n-card.n-card--hoverable {
    transition: none;
  }

  .n-card.n-card--hoverable:hover {
    transform: none;
  }
}

@media (max-width: 620px) {
  :global(:root) {
    --app-stepper-height: 59px;
  }
  .app-shell__header {
    align-items: flex-start;
  }

  .app-shell__actions {
    gap: 6px;
  }

  .theme-switcher__label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .theme-switcher :deep(.n-button) {
    min-width: 40px;
    padding-inline: 10px;
  }

  .app-shell__preview-link {
    padding-inline: 6px;
  }
}
</style>
