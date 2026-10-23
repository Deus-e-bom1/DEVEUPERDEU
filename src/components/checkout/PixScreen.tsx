import { useEffect, useState } from "react";
import { CircleCheck, Clock, Loader2, QrCode } from "lucide-react";
import QR from "qrcode";

const TILES = ["Celular", "JBL", "Apple Watch", "MacBook"];

/** Tela "PIX gerado". `code` vem do provedor PIX; sem ele, mostra aviso de não conectado. */
type Props = { image?: string | undefined; code?: string | undefined; loading?: boolean; error?: string | null; paid?: boolean; onRetry?: () => void };

export function PixScreen({ code, image, loading, error, paid, onRetry }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (image) return setQr(image.startsWith("data:") || image.startsWith("http") ? image : `data:image/png;base64,${image}`);
    if (!code) return setQr(null);
    QR.toDataURL(code, { width: 384, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [code, image]);
  const [left, setLeft] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-ink p-4 text-center text-primary-foreground">
        <div className="relative mx-auto h-44 max-w-xs">
          <div className="absolute inset-x-0 top-0 flex justify-center gap-1.5">
            {TILES.map((t, i) => (
              <span key={t} style={{ animationDelay: `${i * 0.3}s` }} className="animate-pix-float">
                <span style={{ transform: `rotate(${(i - 1.5) * 9}deg) translateY(${Math.abs(i - 1.5) * 12}px)` }} className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/20 text-[8px] font-black uppercase shadow-lg backdrop-blur-sm">
                  <span className="text-2xl leading-none">?</span>{t}
                </span>
              </span>
            ))}
          </div>
          <div className="animate-pix-wobble absolute bottom-0 left-1/2 h-24 w-48 -translate-x-1/2">
            <div className="absolute inset-x-0 top-0 h-4 rounded-md bg-primary brightness-110 shadow-md" />
            <div className="absolute inset-x-2 bottom-0 top-3 rounded-b-xl bg-primary shadow-glow" />
            <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-primary-foreground/25" />
            <span className="absolute left-1/2 top-[55%] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-2xl font-black text-primary">?</span>
          </div>
        </div>
        <h3 className="mt-3 text-lg font-black">Sua caixa está <span className="text-primary">reservada</span> 📦</h3>
        <p className="mt-1 text-sm">Pague o Pix para garantir. O que vem dentro é surpresa: você só descobre quando a caixa chegar e você abrir em casa.</p>
        <p className="mt-2 text-[10px] text-primary-foreground/60">Pode conter celulares, JBL, Apple Watch, MacBook e mais. Conteúdo aleatório, itens ilustrativos.</p>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-orange-soft py-2.5 font-black">
        <Clock className="h-4 w-4" /> Expira em: <span className="tabular-nums">{mm}:{ss}</span>
      </div>

      <div className="text-center">
        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-4 border-muted bg-card">
          {qr ? <img src={qr} alt="QR code PIX" className="h-full w-full rounded-lg p-1" /> : loading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <QrCode className="h-24 w-24 text-muted-foreground/40" />}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Escaneie com o app do seu banco</p>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-bold">Ou copie o código Pix:</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3">
          <code className="min-w-0 flex-1 break-all text-[10px] text-muted-foreground">{code ?? (loading ? "Gerando seu código Pix..." : "Código Pix indisponível.")}</code>
          <button type="button" disabled={!code} onClick={() => code && navigator.clipboard.writeText(code).then(() => setCopied(true))} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-glow disabled:opacity-50">
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm font-semibold text-destructive">
          {error} {onRetry && <button type="button" onClick={onRetry} className="ml-1 underline">Tentar novamente</button>}
        </div>
      )}
      {paid ? (
        <p className="flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success-soft p-3 font-black text-success-ink">
          <CircleCheck className="h-5 w-5" /> Pagamento confirmado! Você receberá o rastreio por e-mail.
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" /> Aguardando confirmação do pagamento...
        </p>
      )}
    </div>
  );
}
