import { Play } from "lucide-react";
import { createElement, useEffect } from "react";

export type VSLProps = {
  type: null | "mp4" | "youtube" | "embed" | "vturb";
  src: string;
  /** Apenas para vturb: id do player (ex.: "6adbab264b8512e83db63ac1") */
  playerId?: string;
  poster?: string;
  aspect?: string;
  title?: string;
};

function youtubeId(src: string) {
  const m = src.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : src;
}

function VturbPlayer({ src, playerId, aspect }: { src: string; playerId: string; aspect: string }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    document.head.appendChild(s);
  }, [src]);
  const [w = 9, h = 16] = aspect.split("/").map(Number);
  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-2xl">
      {createElement(
        "vturb-smartplayer",
        { id: `vid-${playerId}`, style: { display: "block", margin: "0 auto", width: "100%" } },
        <div className="vturb-player-placeholder" style={{ position: "relative", width: "100%", padding: `${(h / w) * 100}% 0 0`, zIndex: 0, backgroundColor: "black" }} />,
      )}
    </div>
  );
}

/** Player independente da VSL: MP4, YouTube, iframe externo ou VTurb. Sem src = área reservada. */
export function VSLPlayer({ type, src, playerId, poster, aspect = "9/16", title = "Vídeo de apresentação" }: VSLProps) {
  const box = "relative w-full overflow-hidden rounded-2xl bg-ink shadow-2xl";
  if (!type || !src) {
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink-line`} style={{ aspectRatio: aspect }}>
        {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
          <Play className="ml-1 h-7 w-7" fill="currentColor" />
        </span>
        <span className="relative text-xs font-semibold text-ink-muted">VSL será adicionada aqui</span>
      </div>
    );
  }
  if (type === "vturb" && playerId) return <VturbPlayer src={src} playerId={playerId} aspect={aspect} />;
  if (type === "mp4") {
    return (
      <div className={box} style={{ aspectRatio: aspect }}>
        <video src={src} poster={poster || undefined} controls playsInline preload="metadata" className="h-full w-full object-cover" />
      </div>
    );
  }
  const url = type === "youtube" ? `https://www.youtube.com/embed/${youtubeId(src)}?rel=0&playsinline=1` : src;
  return (
    <div className={box} style={{ aspectRatio: aspect }}>
      <iframe src={url} title={title} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
    </div>
  );
}
