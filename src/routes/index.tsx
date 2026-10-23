import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { StoreSection } from "@/components/landing/StoreSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caixas Surpresa de Eletrônicos — a partir de R$ 49,70" },
      { name: "description", content: "Caixas surpresa por peso com eletrônicos, gadgets e acessórios. Frete grátis para todo o Brasil." },
      { property: "og:title", content: "Caixas Surpresa de Eletrônicos" },
      { property: "og:description", content: "Escolha o peso da sua caixa e se surpreenda. Frete grátis para todo o Brasil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Header />
      <HeroSection />
      <BenefitsSection />
      <HowItWorks />
      <Testimonials />
      <StoreSection />
      <PricingSection />
      <FAQSection />
      <Footer />
      <StickyCTA />
    </main>
  );
}
