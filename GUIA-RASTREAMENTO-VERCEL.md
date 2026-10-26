# Correção de rastreamento — Deveu Perdeu / Lovable / Vercel / SkalePay

**Status:** Código preparado e revisado estaticamente. NÃO publicado, NÃO validado com suas credenciais e NÃO testado com um pagamento real. A aplicação exige configurações de infraestrutura antes de atualizar a produção.

## Problemas encontrados no ZIP original

1. A região do visitante era consultada com `/cdn-cgi/trace` (Cloudflare), mas o site está na Vercel. Falhas retornavam `XX`, que bloqueava os scripts.
2. O checkout consultava pagamento `paid` a cada 5 segundos **na aba do comprador** e só então enviava a venda para a UTMify: se a aba fechasse, nada era enviado.
3. A criação do Pix não definia `postbackUrl`, apesar de a SkalePay disponibilizar notificação server-to-server.
4. O site tinha pixel da **UTMify**, mas não havia código `fbq` nem envio do evento `Purchase` para a **Meta**.
5. Não havia registro persistente do pedido, das UTMs e dos identificadores necessários para atribuir o Pix quando o usuário saísse do site.
6. A função antiga `reportUtmifySale` aceitava valores da venda informados pelo navegador, o que poderia permitir eventos falsos. Ela foi removida.

## Correções implementadas

- GET `/api/advertising-region`: tenta ler geolocalização do país usando cabeçalho enviado pela Vercel; regiões desconhecidas continuam bloqueadas por prudência.
- Captura UTMs na landing antes da navegação para o checkout; preserva parâmetros em `sessionStorage` e envia ao servidor na criação do pedido.
- Solicitação visível de aceite/recusa de tecnologias de publicidade; respeita recusas, GPC e DNT.
- `createPix` guarda pedido, UTMs, consentimento e dados de cliente em **Upstash Redis server-side**, TTL de 14 dias, sem chaves expostas no navegador.
- O Pix passa `metadata.localOrderId` e `postbackUrl` para a SkalePay.
- POST `/api/webhooks/skale` valida a transação consultando a própria API SkalePay. Só considera venda quando o gateway confirma `paid` e quando há correspondência com o pedido salvo.
- Envia `paid` à UTMify, utilizando um `orderId` estável e o token no servidor.
- O envio opcional do `Purchase` à Meta via CAPI usa IDs estáveis para deduplicação com o Pixel do navegador, e envia dados pessoais normalizados/hash quando houver consentimento.
- Chaves de idempotência por destino impedem reenvio de vendas já registradas.
- A consulta do status no navegador continua funcionando como fallback.
- Cron diário protegido com `CRON_SECRET` tenta recuperar pagamentos pendentes e falhas temporárias. Em grande volume, amplie o processamento em lotes.

## MUITO IMPORTANTE: configurar antes de publicar

1. Faça backup do site atual e do repositório. Não sobrescreva uma loja em produção sem configurar o ambiente.
2. Crie um banco **Upstash Redis** com REST API e copie os valores `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. Essa integração é obrigatória neste patch, pois armazenar dados de pedidos só na memória não funciona de forma confiável na Vercel.
3. No painel Vercel > Project > Settings > Environment Variables, configure:
   - `SKALE_API_KEY` (a mesma chave privada que já usa no gateway)
   - `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
   - `UTMIFY_API_TOKEN` (credencial API de envio de pedidos; não é o ID do pixel)
   - `PUBLIC_SITE_URL=https://devsperdeshop.vercel.app` (ou domínio próprio HTTPS)
   - `CRON_SECRET` (gere um segredo aleatório longo, não compartilhe publicamente)
4. Para Meta CAPI direto, configure **também**:
   - `META_PIXEL_ID` (ID numérico no Gerenciador de Eventos da Meta)
   - `META_CAPI_ACCESS_TOKEN` (token de Conversions API desse pixel)
   - `VITE_META_PIXEL_ID` (o mesmo ID numérico, é público e precisa existir no build)
5. Atenção: o `site.tracking.pixelId` pré-existente é o pixel **UTMify**, e **NÃO** substitui o ID Meta (numérico).
6. Se a **UTMify já encaminha eventos de compra para Meta** na sua configuração, **não habilite Meta CAPI direto até confirmar a deduplicação**. Duas integrações diferentes com IDs de evento diferentes podem contar a mesma compra duas vezes.
7. Envie o projeto corrigido ao GitHub, confira o deploy Vercel e os logs de build. Variáveis VITE_ são injetadas no build, exigindo novo deployment após configuração.
8. Confira a URL de webhook que o projeto enviará para o gateway: `https://devsperdeshop.vercel.app/api/webhooks/skale`. O postback é configurado na criação de **novas** transações Pix. Se preferir, configure também a URL no painel SkalePay para o evento `paid`, evitando que o segredo do painel seja copiado para o repositório.
9. O endpoint deve responder HTTPS; não teste com payload `paid` falso. O servidor sempre confirmará status na API Skale.

**Atenção: sem Upstash configurado, este patch recusa a criação de novos Pix para não receber vendas sem persistência de pedido!** Configure as variáveis e valide em um deployment de preview antes de migrar a loja de produção.

## Testar com segurança

1. Abra `https://SEU_DOMINIO/api/advertising-region` na Vercel. A resposta deve indicar `country: "BR"` para visitante brasileiro com geolocalização disponibilizada pela Vercel. `XX` bloqueia os scripts e demanda investigação dos cabeçalhos no ambiente Vercel.
2. Abra a landing em aba anônima com `?utm_source=facebook&utm_campaign=teste&utm_medium=teste&utm_content=anuncioA`.
3. Aceite publicidade na faixa apresentada e verifique no DevTools/Network se carrega `utms/latest.js`, `pixel.js` e `fbevents.js` (este último apenas quando `VITE_META_PIXEL_ID` estiver configurado).
4. Navegue ao checkout, gere um Pix **apenas em teste autorizado** (em ambiente de teste do gateway se disponível). Confirme que o pedido foi persistido e que `postbackUrl` foi enviado ao gateway.
5. Faça uma transação legítima de validação (se necessário), confirme no painel SkalePay o status `paid` e o webhook entregue. Acompanhe logs da função Vercel `/api/webhooks/skale`.
6. Verifique a venda na UTMify, e o evento `Purchase` na aba **Testar Eventos** do Gerenciador de Eventos Meta. O Pixel e CAPI devem enviar o mesmo `eventID`/`event_id` quando ambos estiverem ativos.
7. Teste especificamente pagar com a aba fechada, para garantir que o webhook registre a venda sem depender do navegador.
8. Caso UTMify/Meta devolvam erros, veja logs da Vercel. O cron `/api/jobs/retry-tracking` tentará recuperar depois (na programação diária configurada).

## Sobre a venda já ocorrida antes da mudança

Para recuperar a venda anterior, seria necessário localizar o ID da transação paga na SkalePay **e** algum registro das UTMs e informações do comprador; o ZIP anterior não persistia tudo isso no servidor. Este patch rastreia com confiabilidade maior as novas transações. Não crie uma venda fictícia nem atribua manualmente uma campanha sem prova da origem.

## Limites e cuidados

- O cron da Vercel está agendado diariamente em `vercel.json`. Os horários/restrições dependem do plano Vercel. A rotina processa um lote de 30 pendências por execução; ajuste para seu volume e limites de execução.
- Upstash preserva dados de cliente por 14 dias, com acesso somente pelo servidor. Configure sua política de privacidade e retenção de dados de acordo com as regras aplicáveis.
- Consentimento é baseado na escolha gravada no navegador; caso necessite comprovação/auditoria robusta de consentimento, implemente registro autenticado e revise com assessoria jurídica.
- As integrações externas dependem de configuração e políticas das plataformas; nenhum código garante 100% de atribuição no relatório Meta Ads.
- Se a SkalePay não devolver `metadata.localOrderId` no GET da transação, adapte a correspondência após verificar o payload real do gateway; não aceite `paid` exclusivamente pelo webhook.
