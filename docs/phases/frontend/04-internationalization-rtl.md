# Phase 18 — Internationalization (i18n) & English/Arabic RTL Engine

## Objective
Deliver first-class bilingual support with seamless English and Arabic language translation and dynamic Right-to-Left (RTL) layout rendering.

## Architecture & Implementation
- **`LanguageContext.tsx`:** Provides centralized language state (`en` | `ar`) and translation dictionaries for all navigation, actions, order statuses, and common labels.
- **Dynamic Directionality:** Automatically applies `dir="rtl"` to `document.documentElement` when Arabic is selected and flips to `dir="ltr"` for English.
- **Persistence:** User language choice is persisted in `localStorage` (`mwb_language`) across browser reloads.
- **Navigation Toggle:** Interactive globe language switcher integrated into the main header navigation.

