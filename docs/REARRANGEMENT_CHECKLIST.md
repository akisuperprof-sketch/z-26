# Verification Checklist (Frontend Monorepo Rearrangement)

## Target
Restore the stability of the MPA architecture and move LP and App into separate root directories `/lp` and `/app` to avoid overlapping configurations and styles. Maintain functionality.

## Action Plan
1. Move static LP assets, `index.html` (the LP), and corresponding CSS to a new `lp` directory.
2. Move App entry files (`index.tsx`, `App.tsx`), `app/index.html` (moved up to `app` directly if not already), `components`, and `styles` to a new `app` directory.
3. Update `vite.config.ts` to recognize `lp/index.html` as the default root and `app/index.html` as the app entry.
4. Update imports in `app` and `lp` files to reflect new relative paths.
5. Apply necessary changes to `vercel.json` if building two separate inputs or ensure `vite build` handles the output correctly into `dist/lp` and `dist/app`.

## Manual Verification (To be checked by human)
- [ ] `npm run dev` works without module resolution errors.
- [ ] `http://localhost:3000/` properly redirects to or loads the LP (we will configure Vite root/entry accordingly).
- [ ] `http://localhost:3000/app` correctly loads the React app without 404s on reload.
- [ ] UI is not artificially broken by the move.
- [ ] No `coreEngine.ts` logic or SSoT mappings were modified.
