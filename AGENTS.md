<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- UTMify scripts are centralized in AdvertisingScripts with regional permission checks; the form-collecting pixel requires explicit recorded acceptance, and withdrawal reloads all open tabs to stop third-party listeners. Purchases must never be inferred from PIX creation.
- All editable landing content (texts, prices, images, VSL, checkout links) lives in src/config/site.ts; components under src/components/landing only read it, so the owner can edit without touching layout.
- Checkout lives at /checkout?plano=<id>; validation/masks/CEP lookup/total math are in src/lib/checkout.ts (tested), options in site.checkout, so rules stay testable apart from UI.
- PIX payments go through the SkalePayments connector in src/lib/pix.functions.ts; the charged amount is always recomputed server-side by priceOrder (src/lib/order.ts, tested), never taken from the browser.
