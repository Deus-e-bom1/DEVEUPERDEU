import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { AD_CHOICE_KEY, NOTICE_VERSION, getAdvertisingRegion, readAdvertisingChoice } from "@/lib/advertising";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Privacidade e publicidade — Deveu Perdeu" },
    { name: "description", content: "Dados de pedidos, medição de anúncios e escolhas de privacidade da Deveu Perdeu." },
    { property: "og:title", content: "Privacidade e publicidade — Deveu Perdeu" },
    { property: "og:description", content: "Consulte o uso de dados e altere sua escolha de publicidade." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Privacy,
});
function Privacy() {
  const [choice, setChoice] = useState<boolean | null>(null);
  useEffect(() => { setChoice(readAdvertisingChoice()?.advertising ?? null); }, []);
  const save = async (advertising: boolean) => {
    const previous = readAdvertisingChoice();
    const region = await getAdvertisingRegion();
    localStorage.setItem(AD_CHOICE_KEY, JSON.stringify({ advertising, at: new Date().toISOString(), notice: NOTICE_VERSION, visitor: previous?.visitor ?? crypto.randomUUID(), region, previousAcceptance: previous?.advertising ? previous.at : previous?.previousAcceptance }));
    window.location.reload();
  };
  return <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
    <Link to="/" className="text-primary underline">{site.brand.name}</Link>
    <h1 className="text-3xl font-bold">Privacidade e publicidade</h1>
    <section className="space-y-3"><h2 className="text-xl font-bold">Pedidos e pagamentos</h2><p>Nome, CPF, e-mail, telefone e endereço são enviados à SkalePayments para criar a cobrança PIX e identificar o pedido. Esses dados não são enviados à UTMify como comprovante de venda nesta instalação.</p></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">Medição de anúncios</h2><p>O script de UTMs da UTMify preserva os parâmetros da campanha nos links. Ele fica bloqueado onde o consentimento é exigido ou quando não conseguimos identificar a região, salvo escolha expressa. Recusas, o sinal de privacidade global e “Não rastrear” são respeitados.</p><p>O pixel UTMify só é carregado após aceite expresso. Ele pode coletar nome, e-mail e telefone digitados em formulários, endereço IP, navegador, páginas, identificadores de publicidade e interações, usando cookies e armazenamento local. A UTMify e as plataformas de anúncios vinculadas ao pixel, incluindo Facebook e Instagram (Meta), recebem esses dados para medição e otimização de anúncios.</p><p>Início do checkout não é uma venda. A geração do PIX também não comprova pagamento. O envio de vendas confirmadas ainda não está conectado.</p></section>
    <section id="publicidade" className="space-y-3"><h2 className="text-xl font-bold">Sua escolha de publicidade</h2><p>Você pode recusar ou retirar o aceite a qualquer momento aqui, sem afetar sua compra. Registramos neste navegador sua escolha, data, região e a versão deste aviso ({NOTICE_VERSION}); uma retirada preserva a data do aceite anterior. Eventos bloqueados não serão reenviados.</p><p className="font-semibold">{choice === true ? "Publicidade aceita neste navegador." : choice === false ? "Publicidade recusada neste navegador." : "Nenhum aceite de publicidade registrado."}</p><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => void save(false)}>Recusar publicidade</Button><Button onClick={() => void save(true)}>Aceitar publicidade</Button></div></section>
    <p>Dúvidas ou pedidos sobre seus dados: <a href={`mailto:${site.brand.email}`} className="underline">{site.brand.email}</a>.</p>
  </main>;
}