# Admin UI: Changes, Archives, and Next Steps

Date: 2025-10-26

This file summarizes the admin-focused wiring, fixes, and audit work performed so far. It describes what was changed, why, and what remains to be done. Use this as a single reference when testing, reviewing, or continuing the cleanup.

## High-level summary

- Fixed a non-functional "Add Product" flow and wired product creation to the backend mutation hook.
- Added user feedback (toasts) for admin product mutations.
- Identified orphan/duplicate admin pages and components through a repository scan.
- Created safe, non-destructive archive placeholders for legacy admin pages.
- Replaced a broken/leftover `AdminPromoCodes.tsx` with a redirect stub and removed stray code that caused compile errors.
- Wired the mobile drawer UI by replacing the inline mobile menu with the existing `MobileDrawer` component in the site header.

All edits passed `npx tsc --noEmit` locally in the dev container after the last changes.

## Files changed (not exhaustive, high-value items)

- src/pages/admin/Products.tsx
  - Fixed the "Add Product" CTA so it navigates to the new product route (replaced Link-wrapped Button with onClick navigation).

- src/pages/admin/ProductNew.tsx
  - Wired product creation to `useCreateProduct()` and navigate to the edit page on success.

- src/lib/hooks/admin/useAdminProducts.ts
  - Added toast success/error notifications to create/update/delete mutations (user feedback on mutation outcomes).

- src/components/admin/AdminLayout.tsx
  - Added Inventory, Reviews, User Profiles links to admin sidebar/navigation (makes routes reachable from the UI).

- src/components/product/ProductStockIndicator.tsx
  - Fixed field usage and defensive rendering; integrated into products table.

- src/components/admin/ProductsTable.tsx
  - Uses `<ProductStockIndicator />` in the stock column and preserves inline edit controls.

- src/App.tsx
  - Standardized toast usage by using the project `ToastProvider`.

- src/pages/admin/AdminPromoCodes.tsx
  - Replaced broken file contents with a simple redirect to `/admin/promo-codes` to resolve a compile error. The canonical page remains `src/pages/admin/PromoCodes.tsx`.

- src/components/Navbar.tsx
  - Replaced inline mobile menu with the `MobileDrawer` component (wires `src/components/ui/mobile-drawer.tsx`). This avoids duplicate UI and activates the previously unreferenced `MobileDrawer` component.

- Archive placeholders added (non-destructive):
  - src/pages/archive/admin/AdminProducts.tsx
  - src/pages/archive/admin/AdminProductNew.tsx
  - src/pages/archive/admin/AdminPromoCodes.tsx
  (These files contain archived copies of legacy content and were added to preserve the original implementations.)

## What was removed or simplified

- Removed stray legacy promo-code UI logic that remained after a redirect was added in `AdminPromoCodes.tsx`. The original UI was archived.
- Replaced several duplicate/legacy admin pages with lightweight redirect stubs to the canonical routes to avoid confusion and runtime errors.

## Orphan / candidate components found (examples)

These components were flagged by a heuristics-based scan and prioritized:

- `src/components/ui/mobile-drawer.tsx` — now wired into the `Navbar`.
- `src/components/admin/HierarchicalCategorySelect.tsx` — currently unused; consider archiving or integrating into a category manager UI.
- `src/components/checkout/*` and some responsive utilities — flagged as candidates for wiring or archiving during a follow-up pass.

Note: the repo scan output (detailed JSON) was produced during the audit and is stored in the dev session logs (ask me and I can regenerate it if you need the exact lists).

## Remaining work / prioritized TODOs

1. Finish wiring high-value orphan components/pages
   - Decide whether to integrate `HierarchicalCategorySelect` into the product admin form (if you prefer a simple <select> fallback) or archive it under `src/components/archive/`.
   - Surface other prioritized components (checkout helpers, responsive utilities) where they add value.

2. Confirm admin page replacements
   - Verify the redirect strategy and archived copies are correct. Optionally delete legacy files after a final review.

3. End-to-end verification
   - Start the dev server and manually test admin flows: Add Product, Edit Product, Stock update, Delete Product, Promo Codes flows, Inventory page, and Reviews page.
   - Note: E2E requires Supabase environment variables and an admin account.

4. Tests & CI
   - Add a couple of small integration tests that run against a seeded test database or mock Supabase responses (Product create + redirect; Product edit saves stock). This will prevent regressions.

## How to run (local smoke test)

1. Ensure environment variables are set (Supabase keys, etc.). Example (adapt to your local secrets):

```bash
export VITE_SUPABASE_URL="https://..."
export VITE_SUPABASE_ANON_KEY="public-anon-key"
# any other VITE_* env vars the app requires
```

2. Typecheck/build:

```bash
# typecheck
npx tsc --noEmit

# run dev server (vite)
npm install
npm run dev
```

3. Manually test admin flows:
- Visit `/admin/login` and sign in as an admin (or mock auth in `AuthContext` if preferred).
- Go to `/admin/products` and click "Add Product". Confirm you land on `/admin/products/new`, fill the form, and that the newly created product redirects to its edit page.
- Verify toasts appear for successful and failed operations.
- On mobile widths, open the header menu and confirm the drawer is used and closes correctly.

## QA checklist (quick)

- [ ] Typecheck passes: `npx tsc --noEmit` (done in dev container after edits)
- [ ] Dev server runs and admin pages load (requires env)
- [ ] Add Product flow creates a product and navigates to edit
- [ ] Toasts appear for create/update/delete operations
- [ ] Mobile menu uses the `MobileDrawer` and behaves correctly on small screens
- [ ] Archived pages are confirmed and final deletion is approved before removing

## Notes & assumptions

- I avoided destructive deletes; archive placeholders were used so nothing is lost and you can review the originals.
- The app uses manual route registration in `src/App.tsx`; adding new page files will not automatically register them. I only created redirect stubs and archive files — not new canonical admin page implementations (except small safe stubs where required).
- E2E tests and full manual QA require Supabase credentials and an admin user; I did not perform such runtime tests in this session.

## Next steps I can take (pick one or more)

- Wire `HierarchicalCategorySelect` into `ProductForm` (or archive it).
- Generate the full audit JSON again and include it in this repo under `scripts/` for reproducible scans.
- Add a tiny integration test that mocks Supabase for the product creation flow.
- Start the dev server (I will need the environment variables from you or you can provide sanitized test creds).

If you want, I'll now:
- Move `HierarchicalCategorySelect` to `src/components/archive/`
- Add a tiny test for the Add Product flow
- Or produce a PR-ready set of changes and a more detailed changelog with diffs per file

Tell me which next step you'd like and I will proceed. The updated todo list is tracked in the workspace.