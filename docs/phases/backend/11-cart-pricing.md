# Phase 11 — Multi-Store Shared Cart, Pricing & Coupons

## Objective
Implement deterministic multi-store cart arithmetic, per-store line grouping, and coupon validations.

## Key Rules & Capabilities
- **Shared Cart:** Allows customers to place products from multiple independent stores into a single cart.
- **Store-Level Grouping:** Cart drawer and checkout screens group items by store, rendering individual subtotals.
- **Minor-Unit Money Arithmetic:** All prices and totals computed as integer minor units (cents), eliminating floating-point errors.
- **Store Coupons vs Platform Coupons:** Store-specific coupons discount only eligible items from that specific merchant within a multi-store composite cart.
- **Suspension Interception:** Adding products from stores marked `status === 'SUSPENDED'` is rejected with HTTP 400 Bad Request.
