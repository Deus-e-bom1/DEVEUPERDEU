# Deveu Perdeu — deploy na Vercel

1. Suba todos estes arquivos para um repositório no GitHub (sem a pasta node_modules).
2. Na Vercel: Add New > Project > importe o repositório. Framework: "Other" (deixe os comandos padrão; o vercel.json já configura).
3. Em Settings > Environment Variables adicione:
   - SKALE_API_KEY = sua chave secreta da SkalePayments (sk_...)
   - UTMIFY_API_TOKEN = token de API da UTMify (painel UTMify > Integrações > API)
4. Clique em Deploy. Depois de mudar variáveis, faça "Redeploy".

Textos, preços e links: src/config/site.ts. Imagens: public/assets.
