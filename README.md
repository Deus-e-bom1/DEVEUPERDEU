# Deveu Perdeu — Lovable / GitHub / Vercel

**Leia o arquivo [`GUIA-RASTREAMENTO-VERCEL.md`](GUIA-RASTREAMENTO-VERCEL.md) antes de publicar.**

O rastreamento dos Pix pagos foi refeito usando webhook SkalePay, persistência Upstash Redis, UTMify API e Meta CAPI opcional. A nova infraestrutura deve estar configurada na Vercel antes do deploy: sem Upstash, o checkout não criará novas cobranças Pix.

No painel da Vercel, configure as variáveis indicadas em `.env.example` (sem publicar segredos no GitHub). Suba os arquivos sem a pasta `node_modules`, ative o build e teste com uma transação legítima.

Conteúdo comercial e preços ficam em `src/config/site.ts`. Imagens: `public/assets`.
