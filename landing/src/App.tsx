import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// ─── Utility Components ───────────────────────────────────────────────

interface CounterProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  label: string;
}

function MetricCard({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2000,
  label,
}: CounterProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * end;
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          startAnimation();
        }
      },
      { threshold: 0.25 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, end]);

  return (
    <div
      ref={containerRef}
      onClick={() => startAnimation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 cursor-pointer select-none hover:bg-white/[0.02]"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 pointer-events-none ${isHovered ? "opacity-100" : ""}`} />
      <div className="relative z-10 text-center">
        <span className="font-mono-numbers text-[38px] sm:text-[42px] font-light text-white tracking-[-0.02em] leading-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
          {prefix}
          {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
          {suffix}
        </span>
      </div>
      <p className="relative z-10 mt-2 text-[13.5px] sm:text-[14px] text-[#8a8a8a] text-center font-normal tracking-normal transition-colors duration-200 group-hover:text-[#b0b0b0]">
        {label}
      </p>
    </div>
  );
}

function BlurRevealText({
  text,
  className = "",
  delayOffset = 0,
  staggerMs = 22,
  duration = 750,
  threshold: _threshold = 0.1,
}: {
  text: string;
  className?: string;
  delayOffset?: number;
  staggerMs?: number;
  duration?: number;
  threshold?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const timer = setTimeout(() => setIsRevealed(true), 60);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "100px 0px 20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <span ref={containerRef} className={`inline ${className}`}>
      {words.map((word, wordIdx) => {
        const wordChars = Array.from(word);
        const startIndex = globalCharIndex;
        globalCharIndex += wordChars.length + 1;
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {wordChars.map((char, charIdx) => {
              const charGlobalIdx = startIndex + charIdx;
              return (
                <span
                  key={charIdx}
                  style={{
                    display: "inline-block",
                    transition: `filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                    transitionDelay: `${delayOffset + charGlobalIdx * staggerMs}ms`,
                    filter: isRevealed ? "blur(0px)" : "blur(14px)",
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? "translate3d(0, 0, 0)" : "translate3d(0, 8px, 0)",
                    willChange: "filter, opacity, transform",
                  }}
                >
                  {char}
                </span>
              );
            })}
            {wordIdx < words.length - 1 && (
              <span style={{ display: "inline-block", transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`, transitionDelay: `${delayOffset + (startIndex + wordChars.length) * staggerMs}ms`, opacity: isRevealed ? 1 : 0 }}>
                &nbsp;
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

// ─── Feature Cards ────────────────────────────────────────────────────

function ProvideCard() {
  const [gpuModel, setGpuModel] = useState("RTX 4080");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const gpus = ["RTX 4080", "RTX 4090", "RTX 3090", "RTX 5090"];

  const handleStart = () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    setTimeout(() => { setIsRunning(false); setIsDone(true); setTimeout(() => setIsDone(false), 2400); }, 900);
  };

  return (
    <div className="group relative flex flex-col justify-between h-[525px] rounded-[28px] p-6 sm:p-7 bg-white/[0.035] bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-xl border border-white/[0.1] hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[270px] mx-auto">
        <div className="relative flex flex-col items-center justify-center">
          <span className="font-mono-numbers text-[42px] sm:text-[48px] font-light text-white tracking-[-0.03em] leading-none select-none">⚡ {gpuModel}</span>
        </div>
        <div className="relative mt-4 z-30">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {gpus.map((gpu) => (
              <button key={gpu} type="button" onClick={() => setGpuModel(gpu)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-normal transition-all cursor-pointer border ${gpuModel === gpu ? "bg-white/[0.12] border-white/[0.2] text-white" : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.08]"}`}>
                {gpu}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full mt-6 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <div className="flex justify-between text-[13px]">
            <span className="text-white/50">Ставка</span>
            <span className="text-emerald-400 font-mono-numbers">$0.35/час</span>
          </div>
          <div className="flex justify-between text-[13px] mt-1.5">
            <span className="text-white/50">Выплата каждые</span>
            <span className="text-white font-mono-numbers">10 мин</span>
          </div>
        </div>
        <div className="w-full mt-2.5">
          <button type="button" onClick={handleStart} disabled={isRunning}
            className="group/btn relative w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/80 hover:text-white text-[13.5px] font-medium transition-all duration-200 cursor-pointer overflow-hidden shadow-sm active:scale-98 flex items-center justify-center gap-2">
            {isRunning ? (
              <span className="flex items-center gap-2 text-white/70">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Подключение ноды...
              </span>
            ) : isDone ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Подключено!
              </span>
            ) : (<span>Подключить GPU</span>)}
          </button>
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-white text-[11.5px] font-semibold tracking-[0.08em] uppercase">
          <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" /></svg>
          <span>ПРЕДОСТАВЬ МОЩНОСТИ</span>
        </div>
        <p className="mt-2 text-[13.5px] leading-[1.48] text-[#8e8e93] font-normal">
          RTX 30xx/40xx/50xx. Монетизируй простой видеокарты — <span className="text-white">$0.35/час</span> чистыми на кошелек Solana.
        </p>
      </div>
    </div>
  );
}

function ComputeCard() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const tasks = [
    { id: 1, name: "Llama 3.3 Inference", time: "Сейчас, 12:04", amountUSD: "$0.48", amountCrypto: "2x RTX 4080",
      icon: <svg className="w-5 h-5 text-white/85" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> },
    { id: 2, name: "Blender Render", time: "Сегодня, 10:30", amountUSD: "$1.20", amountCrypto: "4x RTX 4090",
      icon: <svg className="w-5 h-5 text-white/85" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> },
    { id: 3, name: "PyTorch Training", time: "Сегодня, 08:15", amountUSD: "$2.40", amountCrypto: "8x RTX 3090",
      icon: <svg className="w-5 h-5 text-white/85" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
  ];

  return (
    <div className="group relative flex flex-col justify-between h-[525px] rounded-[28px] p-6 sm:p-7 bg-white/[0.035] bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-xl border border-white/[0.1] hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col justify-center flex-1 w-full space-y-2.5 my-auto">
        {tasks.map((tx, idx) => (
          <div key={tx.id} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}
            className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${hoveredIdx === idx ? "bg-white/[0.08] border-white/20 translate-x-1 shadow-lg shadow-black/40" : "bg-white/[0.035] border-white/[0.06] hover:bg-white/[0.06]"}`}>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">{tx.icon}</div>
              <div>
                <p className="text-[14px] font-medium text-white leading-tight">{tx.name}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">{tx.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-mono-numbers font-medium text-white leading-tight">{tx.amountUSD}</p>
              <p className="text-[12px] font-mono-numbers text-[#71717a] mt-0.5">{tx.amountCrypto}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-white text-[11.5px] font-semibold tracking-[0.08em] uppercase">
          <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
          <span>ЗАПУСКАЙ ЗАДАЧИ</span>
        </div>
        <p className="mt-2 text-[13.5px] leading-[1.48] text-[#8e8e93] font-normal">
          ИИ-инференс, обучение моделей, 3D-рендеринг. Мощности от <span className="text-white">$0.50/час</span> — в 6–10 раз выгоднее AWS.
        </p>
      </div>
    </div>
  );
}

function EarningsCard() {
  const [progress, setProgress] = useState(0.81);
  const containerRef = useRef<HTMLDivElement>(null);
  const days = progress >= 0.8 && progress <= 0.82 ? 180 : Math.round(progress * 220);
  const amountNumber = Math.round(50 + Math.pow(progress, 2.5) * 4200);
  const formattedAmount = progress >= 0.8 && progress <= 0.82 ? "$3,240" : `$${amountNumber.toLocaleString("en-US")}`;
  const width = 320;
  const height = 190;
  const currentX = Math.round((15 + progress * 280) * 10) / 10;
  const currentY = Math.round((height - 10 - Math.pow(progress, 2.3) * (height - 25)) * 10) / 10;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setProgress(Math.max(0.05, Math.min(x / rect.width, 0.98)));
  };

  return (
    <div className="group relative flex flex-col justify-between h-[525px] rounded-[28px] p-6 sm:p-7 bg-white/[0.035] bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-xl border border-white/[0.1] hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setProgress(0.81)}
        className="relative flex flex-col justify-center flex-1 w-full my-auto cursor-crosshair select-none pt-2 pb-1 overflow-hidden">
        <div className="absolute top-1 left-3 z-20 px-3.5 py-2.5 rounded-xl bg-[#141417]/95 border border-white/[0.12] backdrop-blur-md shadow-2xl transition-all duration-150">
          <p className="text-[11.5px] text-white/50 font-mono leading-none">День {days}</p>
          <div className="flex items-center justify-between gap-4 mt-1.5">
            <span className="flex items-center gap-1.5 text-[12.5px] text-white font-normal">
              <span className="w-2 h-2 rounded-[2px] bg-white inline-block" />USDC заработано
            </span>
            <span className="font-mono-numbers text-[13.5px] font-medium text-white tracking-tight">{formattedAmount}</span>
          </div>
        </div>
        <div className="w-full pt-14 pb-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-hidden">
            <line x1="15" y1="5" x2="15" y2={height - 10} stroke="rgba(255,255,255,0.18)" strokeDasharray="2.5 2.5" strokeWidth="1" />
            <line x1="15" y1={height - 10} x2={width} y2={height - 10} stroke="rgba(255,255,255,0.18)" strokeDasharray="2.5 2.5" strokeWidth="1" />
            <path d={`M 15 ${height - 10} C 90 ${height - 11}, 180 ${height - 25}, 240 ${height - 85} C 275 ${height - 120}, 305 30, 318 5`} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx={currentX} cy={currentY} r="4" fill="white" />
            <circle cx={currentX} cy={currentY} r="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
              <animate attributeName="r" values="4;11;4" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-white text-[11.5px] font-semibold tracking-[0.08em] uppercase">
          <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          <span>ЗАРАБАТЫВАЙ ПОКА СПИШЬ</span>
        </div>
        <p className="mt-2 text-[13.5px] leading-[1.48] text-[#8e8e93] font-normal">
          GPU работает ночью, пока ты спишь. Выплаты в $USDC на Solana-кошелёк каждые 10 минут.
        </p>
      </div>
    </div>
  );
}

// ─── Features Section ─────────────────────────────────────────────────

function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [beamIntensity, setBeamIntensity] = useState(0.2);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setCardsVisible(true); }, { threshold: 0.12 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let animId: number;
    const handleScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const wh = window.innerHeight;
        const dist = Math.abs(rect.top + rect.height / 2 - wh / 2);
        const progress = Math.max(0, Math.min(1 - dist / (wh * 1.4), 1));
        setBeamIntensity(0.08 + Math.pow(progress, 1.3) * 0.34);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-28 pb-40 sm:pt-36 sm:pb-48">
      <div style={{ opacity: beamIntensity, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)" }}
        className="pointer-events-none absolute -top-72 -bottom-72 sm:-top-[460px] sm:-bottom-[460px] left-1/2 -translate-x-1/2 w-screen min-w-[100vw] overflow-hidden select-none -z-10 mix-blend-screen transition-[opacity,filter] duration-150 ease-out">
        <img src="/feature-beam-bg.png" alt="" className="w-full h-full object-cover object-[52%_46%] scale-105" />
      </div>
      <div className="max-w-xl text-left mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          <span className="w-2.5 h-1.5 rounded-full bg-white/40 border border-white/30" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 font-medium">КАК ЭТО РАБОТАЕТ</span>
        </div>
        <h2 className="text-[36px] sm:text-[44px] md:text-[48px] font-normal tracking-[-0.03em] leading-[1.12] text-white">
          <BlurRevealText text="Одна сеть. Три суперсилы." delayOffset={50} staggerMs={22} />
        </h2>
        <p className="mt-3.5 text-[15px] sm:text-[16px] leading-[1.45] text-[#9ca3af] font-normal max-w-[420px]">
          <BlurRevealText text="Всё, что нужно для монетизации GPU, запуска ИИ-задач и заработка — на блокчейне Solana." delayOffset={120} staggerMs={10} />
        </p>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {[ProvideCard, ComputeCard, EarningsCard].map((Card, i) => (
          <div key={i} className={`h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${cardsVisible ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0"}`} style={{ transitionDelay: `${i * 150}ms` }}>
            <Card />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Orb Card ─────────────────────────────────────────────────────────

function TensorGridOrbCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [isRippling, setIsRippling] = useState(false);

  return (
    <div onClick={() => { setIsRippling(true); setTimeout(() => setIsRippling(false), 700); }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full max-w-[440px] h-[550px] sm:h-[590px] mx-auto rounded-[32px] sm:rounded-[36px] bg-[#0b0b0d]/80 backdrop-blur-2xl border border-white/[0.12] hover:border-white/30 transition-all duration-500 overflow-hidden flex items-center justify-center p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] select-none cursor-pointer">
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 opacity-45 mix-blend-screen">
        <img src="/feature-beam-bg.png" alt="" className="w-full h-full object-cover object-center scale-125 transition-transform duration-700 group-hover:scale-130" />
      </div>
      <div className="relative flex items-center justify-center my-auto">
        <div className={`w-[260px] h-[260px] sm:w-[290px] sm:h-[290px] rounded-full border border-white/[0.05] absolute flex items-center justify-center pointer-events-none anim-ring-3 transition-transform duration-500 ${isHovered ? "scale-105" : ""}`} />
        <div className={`w-[185px] h-[185px] sm:w-[210px] sm:h-[210px] rounded-full border border-white/[0.08] absolute flex items-center justify-center pointer-events-none anim-ring-2 transition-transform duration-500 ${isHovered ? "scale-105" : ""}`} />
        <div className={`w-[125px] h-[125px] sm:w-[145px] sm:h-[145px] rounded-full border border-white/[0.13] absolute flex items-center justify-center pointer-events-none anim-ring-1 transition-transform duration-500 ${isHovered ? "scale-105" : ""}`} />
        {isRippling && <div className="absolute w-[95px] h-[95px] rounded-full border border-white/40 animate-ping pointer-events-none" />}
        <div className="relative z-10 w-[90px] h-[90px] sm:w-[96px] sm:h-[96px] rounded-full bg-gradient-to-b from-[#25252c] via-[#1a1a21] to-[#121217] border border-white/[0.22] anim-orb flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-white/45">
          <div className="flex items-center justify-center text-[28px]">⚡</div>
          <span className="text-[12px] font-medium text-white tracking-tight mt-0.5">TensorGrid</span>
        </div>
      </div>
    </div>
  );
}

// ─── Getting Started ──────────────────────────────────────────────────

function GettingStartedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(1950);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { id: 1, number: "01", title: "Скачай агент", desc1: "Установи фоновый агент", desc2: "на свой ПК или сервер.", x: 95, y: 190, lineBottomY: 340, centerProgress: 0.22 },
    { id: 2, number: "02", title: "Подключи GPU", desc1: "Агент определит видеокарту", desc2: "и начнёт мониторить простой.", x: 380, y: 330, lineBottomY: 480, centerProgress: 0.44 },
    { id: 3, number: "03", title: "Привяжи кошелёк", desc1: "Phantom, Solflare — любой.", desc2: "Выплаты в USDC на Solana.", x: 680, y: 450, lineBottomY: 595, centerProgress: 0.68 },
    { id: 4, number: "04", title: "Получай выплаты", desc1: "Микровыплаты каждые 10 мин.", desc2: "Kill-Switch при движении мыши.", x: 935, y: 540, lineBottomY: 685, centerProgress: 0.88 },
  ];
  const curvePath = "M 560 15 C 360 70, 80 130, 42 230 C 16 300, 42 325, 95 340 C 200 375, 300 435, 380 480 C 480 540, 580 575, 680 595 C 780 620, 860 655, 935 685 C 1020 720, 1095 755, 1125 805";

  useEffect(() => {
    let animId: number;
    if (pathRef.current) { const l = pathRef.current.getTotalLength(); if (l > 0) setPathLength(l); }
    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const raw = (window.innerHeight * 0.7 - rect.top) / (rect.height * 0.85);
        setScrollProgress(Math.max(0, Math.min(raw, 1)));
        if (pathRef.current) { const l = pathRef.current.getTotalLength(); if (l > 0) setPathLength(l); }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("scroll", onScroll); };
  }, []);

  const getStepState = (cp: number, id: number) => {
    if (hoveredStep === id) return { opacity: 1, isActive: true };
    const s = cp - 0.09, e = cp + 0.03;
    if (scrollProgress >= e) return { opacity: 1, isActive: true };
    if (scrollProgress >= s) { const f = (scrollProgress - s) / (e - s); return { opacity: 0.28 + f * 0.72, isActive: f > 0.35 }; }
    return { opacity: 0.28, isActive: false };
  };

  return (
    <section ref={containerRef} id="getting-started" className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-40 pb-56 sm:pt-48 sm:pb-68 flex flex-col items-center">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          <span className="w-2.5 h-1.5 rounded-full bg-white/40 border border-white/30" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 font-medium">БЫСТРЫЙ СТАРТ</span>
        </div>
        <h2 className="text-[36px] sm:text-[45px] md:text-[50px] font-normal tracking-[-0.035em] leading-[1.12] text-white">
          <BlurRevealText text="От нуля до заработка. За минуты." delayOffset={50} staggerMs={22} />
        </h2>
        <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-[#9ca3af] font-normal">
          <BlurRevealText text="Никакого опыта не нужно. TensorGrid проведёт через каждый шаг." delayOffset={120} staggerMs={10} />
        </p>
      </div>
      {/* Desktop */}
      <div className="hidden lg:block relative w-full max-w-5xl h-[820px] mx-auto select-none">
        <svg viewBox="0 0 1152 820" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" /><stop offset="25%" stopColor="#818cf8" stopOpacity="0.9" /><stop offset="70%" stopColor="#6366f1" stopOpacity="0.95" /><stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
          </defs>
          <path ref={pathRef} d={curvePath} fill="none" stroke="transparent" strokeWidth="1" />
          <path d={curvePath} fill="none" stroke="rgba(99, 102, 241, 0.35)" strokeWidth="5" strokeDasharray={pathLength} strokeDashoffset={pathLength * (1 - Math.max(0.04, scrollProgress))} filter="url(#glowEffect)" style={{ transition: "stroke-dashoffset 0.08s ease-out" }} />
          <path d={curvePath} fill="none" stroke="url(#curveGradient)" strokeWidth="1.4" strokeDasharray={pathLength} strokeDashoffset={pathLength * (1 - Math.max(0.04, scrollProgress))} style={{ transition: "stroke-dashoffset 0.08s ease-out" }} />
          {steps.map((step) => {
            const { isActive } = getStepState(step.centerProgress, step.id);
            return <line key={`c-${step.id}`} x1={step.x} y1={step.y + 12} x2={step.x} y2={step.lineBottomY} stroke={isActive ? "#818cf8" : "rgba(99, 102, 241, 0.2)"} strokeDasharray="2.5 3" strokeWidth={isActive ? "1.5" : "1"} className="transition-colors duration-300" />;
          })}
        </svg>
        {steps.map((step) => {
          const { opacity, isActive } = getStepState(step.centerProgress, step.id);
          return (
            <div key={`s-${step.id}`} onMouseEnter={() => setHoveredStep(step.id)} onMouseLeave={() => setHoveredStep(null)}
              style={{ left: `${step.x + 8}px`, top: `${step.y}px`, opacity, transform: isActive ? "translateY(-4px)" : "translateY(0px)" }}
              className="absolute z-10 cursor-pointer transition-all duration-500 ease-out group whitespace-nowrap min-w-[220px]">
              <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
                <span className={`font-mono text-[13.5px] transition-colors duration-300 ${isActive ? "text-indigo-400 font-semibold drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]" : "text-white/60"}`}>{step.number}</span>
                <span className="text-white/30 text-[12px]">·</span>
                <h3 className={`text-[14.5px] transition-colors duration-300 ${isActive ? "text-white font-medium" : "text-white/60 font-normal"}`}>{step.title}</h3>
              </div>
              <p className={`text-[13.5px] leading-[1.48] mt-2 transition-colors duration-300 ${isActive ? "text-[#f3f4f6]" : "text-[#71717a]"}`}>{step.desc1}<br />{step.desc2}</p>
            </div>
          );
        })}
      </div>
      {/* Mobile */}
      <div className="lg:hidden w-full max-w-md mx-auto mt-6 space-y-6">
        {steps.map((step) => {
          const { opacity, isActive } = getStepState(step.centerProgress, step.id);
          return (
            <div key={`m-${step.id}`} onClick={() => setHoveredStep(step.id === hoveredStep ? null : step.id)}
              style={{ opacity: Math.max(0.45, opacity) }}
              className={`relative pl-7 border-l transition-all duration-300 cursor-pointer ${isActive ? "border-indigo-500 bg-white/[0.03] p-4 rounded-r-2xl" : "border-white/15"}`}>
              <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${isActive ? "bg-indigo-400 border-indigo-400 scale-125 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-[#050505] border-white/40"}`} />
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[13px] font-medium transition-colors ${isActive ? "text-indigo-400" : "text-white/60"}`}>{step.number}</span>
                <span className="text-white/30 text-[12px]">·</span>
                <h3 className={`text-[15px] font-medium transition-colors ${isActive ? "text-white" : "text-white/60"}`}>{step.title}</h3>
              </div>
              <p className={`text-[13.5px] leading-relaxed mt-1.5 transition-colors ${isActive ? "text-[#e5e7eb]" : "text-[#71717a]"}`}>{step.desc1} {step.desc2}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────

function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);

  const testimonials = [
    { id: 1, quote: "Мой игровой ПК стоял без дела ночью. Теперь он приносит $250 в месяц через TensorGrid.", author: "Алексей К.", location: "Алматы", avatar: "/avatars/marcus.jpg", delay: "0ms" },
    { id: 2, quote: "В 6 раз дешевле AWS. Запускаю инференс Llama на 8 RTX-ках за копейки.", author: "Дмитрий С.", location: "Москва", avatar: "/avatars/liam.jpg", delay: "120ms" },
    { id: 3, quote: "Kill-Switch работает мгновенно — двинул мышку и GPU вернулся мне. Гениально.", author: "Анна В.", location: "Берлин", avatar: "/avatars/sophie.jpg", delay: "240ms" },
    { id: 4, quote: "Подключил 20 ПК в компьютерном клубе. Пассивный доход в USDC на автомате.", author: "Марат Б.", location: "Нур-Султан", avatar: "/avatars/elena.jpg", delay: "160ms" },
    { id: 5, quote: "Docker-контейнеры полностью изолированы. Безопасно и прозрачно.", author: "Сергей Т.", location: "Киев", avatar: "/avatars/aisha.jpg", delay: "280ms" },
    { id: 6, quote: "Выплаты в USDC каждые 10 минут прямо на Phantom. Это будущее.", author: "Олег М.", location: "Варшава", avatar: "/avatars/marcus.jpg", delay: "400ms" },
  ];

  return (
    <section ref={ref} id="testimonials" className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-36 pb-48 sm:pt-44 sm:pb-56 flex flex-col items-center">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          <span className="w-2.5 h-1.5 rounded-full bg-white/40 border border-white/30" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 font-medium">РАННИЙ ДОСТУП</span>
        </div>
        <h2 className="text-[36px] sm:text-[45px] md:text-[50px] font-normal tracking-[-0.035em] leading-[1.12] text-white">
          <BlurRevealText text="Что говорят первые участники." delayOffset={50} staggerMs={22} />
        </h2>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {testimonials.map((t) => (
          <div key={t.id} className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${vis ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`} style={{ transitionDelay: t.delay }}>
            <div className="relative h-full min-h-[330px] sm:min-h-[355px] rounded-[30px] sm:rounded-[32px] p-7 sm:p-8 bg-[#0b0b0e]/90 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_45px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between group hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-screen z-10" style={{ backgroundImage: "url('/noise.png')", backgroundRepeat: "repeat", backgroundSize: "140px 140px" }} />
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 mb-6">
                  <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                </div>
                <p className="text-[15.5px] sm:text-[16px] leading-[1.52] text-white/90 font-normal">{t.quote}</p>
              </div>
              <div className="relative z-20 mt-8 pt-4.5 border-t border-white/[0.07]">
                <p className="text-[14px] font-medium text-white leading-tight">{t.author}</p>
                <p className="text-[12.5px] text-[#8e8e93] mt-0.5">{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────

function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.12 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);

  const faqItems = [
    { question: "Что такое TensorGrid?", answer: "TensorGrid — это децентрализованный DePIN-протокол на блокчейне Solana, который объединяет простаивающие GPU (видеокарты) в глобальную вычислительную сеть для инференса нейросетей, обучения ИИ и 3D-рендеринга." },
    { question: "Как я могу заработать?", answer: "Установите наш фоновый агент на ПК с видеокартой NVIDIA RTX 30xx/40xx/50xx. Агент автоматически определит простой системы и начнёт выполнять задачи. Выплаты в $USDC идут на ваш Solana-кошелёк каждые 10 минут. Ставка — от $0.35/час за GPU." },
    { question: "Безопасно ли предоставлять свой ПК?", answer: "Да. Все задачи выполняются в изолированных Docker/WASM контейнерах без доступа к вашим файлам. Kill-Switch мгновенно сбрасывает задачу при движении мыши или клавиатуры. Ваши данные полностью защищены." },
    { question: "Какие видеокарты поддерживаются?", answer: "TensorGrid поддерживает NVIDIA RTX серий 3000, 4000 и 5000 с VRAM от 8GB. Чем мощнее GPU, тем выше ставка. RTX 4090 зарабатывает примерно в 2 раза больше, чем RTX 3060." },
    { question: "Как устроена экономика протокола?", answer: "70% ($0.35/час) — выплата владельцу оборудования. 20% ($0.10/час) — развитие протокола и инфраструктуры. 10% ($0.05/час) — страховой пул и вознаграждение валидаторам. Базовая ставка — $0.50/час за RTX 4080." },
    { question: "Почему Solana?", answer: "Solana обеспечивает микротранзакции в реальном времени с комиссией всего $0.00025. Это позволяет стримить выплаты каждые 10 минут без потерь на газ. Плюс Solana Blinks & Actions для мониторинга доходности прямо из Telegram и X." },
  ];

  return (
    <section ref={ref} id="faq" className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-32 pb-48 sm:pt-40 sm:pb-56">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className={`lg:col-span-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${vis ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <span className="w-2.5 h-1.5 rounded-full bg-white/40 border border-white/30" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 font-medium">FAQ</span>
          </div>
          <h2 className="text-[38px] sm:text-[46px] md:text-[50px] font-normal tracking-[-0.035em] leading-[1.08] text-white">
            <BlurRevealText text="Всё, что нужно" delayOffset={50} staggerMs={22} /><br />
            <BlurRevealText text="знать." delayOffset={50 + 15 * 22} staggerMs={22} />
          </h2>
          <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed text-[#9ca3af] font-normal">
            <BlurRevealText text="Остались вопросы? Мы всё объясним." delayOffset={120} staggerMs={10} />
          </p>
        </div>
        <div className={`lg:col-span-7 space-y-3 sm:space-y-3.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${vis ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`} style={{ transitionDelay: "150ms" }}>
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.question} className="group relative rounded-2xl bg-[#0e0e11]/75 hover:bg-[#131317]/85 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-screen z-0" style={{ backgroundImage: "url('/noise.png')", backgroundRepeat: "repeat", backgroundSize: "140px 140px" }} />
                <button type="button" onClick={() => setOpenIdx(openIdx === idx ? null : idx)} className="w-full flex items-center justify-between text-left px-5 sm:px-6 py-4 sm:py-4.5 cursor-pointer relative z-10 select-none">
                  <span className="text-[15px] sm:text-[15.5px] font-normal text-white/90 group-hover:text-white transition-colors pr-4 leading-snug">{item.question}</span>
                  <span className={`w-5 h-5 flex items-center justify-center shrink-0 text-white/60 group-hover:text-white transition-transform duration-300 ${isOpen ? "rotate-45 text-white" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out relative z-10 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-5 px-5 sm:px-6" : "grid-rows-[0fr] opacity-0 pb-0 px-5 sm:px-6"}`}>
                  <div className="overflow-hidden">
                    <p className="text-[14px] text-[#8e8e93] leading-relaxed pt-1 border-t border-white/[0.05]">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA & Footer ──────────────────────────────────────────────

function FinalCtaFooterSection({ onOpenModal }: { onOpenModal: () => void }) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [logoY, setLogoY] = useState(85);
  const [logoScale, setLogoScale] = useState(0.8);
  const [logoOpacity, setLogoOpacity] = useState(0.25);

  useEffect(() => {
    let animId: number;
    const handleScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        if (!ctaRef.current) return;
        const rect = ctaRef.current.getBoundingClientRect();
        const wh = window.innerHeight;
        const raw = (wh * 0.95 - rect.top) / (wh * 0.6);
        const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, raw)), 2.5);
        setLogoY((1 - ease) * 85);
        setLogoScale(0.8 + ease * 0.2);
        setLogoOpacity(0.25 + ease * 0.75);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <section ref={ctaRef} id="get-access" className="relative z-20 w-full pt-28 sm:pt-36 pb-16 bg-[#050505] flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-indigo-500/[0.07] blur-[130px] rounded-full pointer-events-none -z-10" />
      <div style={{ transform: `translate3d(0, ${logoY}px, 0) scale(${logoScale})`, opacity: logoOpacity }} className="relative mb-7 transition-transform duration-75 ease-out will-change-transform select-none">
        <div className="w-[106px] h-[106px] sm:w-[122px] sm:h-[122px] rounded-[30px] sm:rounded-[34px] bg-gradient-to-b from-[#242428] via-[#161619] to-[#0c0c0e] border border-white/[0.13] p-6 sm:p-7 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_25px_50px_rgba(0,0,0,0.85)] group cursor-pointer hover:border-white/30 hover:scale-[1.03] transition-all duration-300">
          <span className="text-[48px]">⚡</span>
        </div>
      </div>
      <h2 className="text-[36px] sm:text-[45px] md:text-[52px] font-normal tracking-[-0.035em] leading-[1.12] text-white max-w-2xl px-6 mb-4">
        <BlurRevealText text="Подключи свой GPU." delayOffset={50} staggerMs={22} /><br />
        <BlurRevealText text="Начни зарабатывать сейчас." delayOffset={50 + 20 * 22} staggerMs={22} />
      </h2>
      <p className="text-[15px] sm:text-[16px] leading-[1.45] text-[#9ca3af] font-normal max-w-md px-6 mb-7">
        <BlurRevealText text="Присоединяйся к глобальной сети GPU на Solana. Ранний доступ открыт." delayOffset={50 + 46 * 22 + 80} staggerMs={10} />
      </p>
      <div className="mb-24 sm:mb-28">
        <button type="button" onClick={onOpenModal} className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[14px] font-normal text-white transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.18] hover:border-white/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <span className="relative z-10 flex items-center">Получить ранний доступ</span>
        </button>
      </div>
      <footer className="w-full max-w-6xl mx-auto px-6 sm:px-10 pt-10 border-t border-white/[0.07] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-left">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2.5">
            <span className="text-[20px]">⚡</span>
            <span className="font-normal text-[17px] tracking-tight text-white">TensorGrid</span>
          </div>
          <p className="mt-2.5 text-[13px] text-[#8e8e93] leading-normal max-w-[280px]">Децентрализованный DePIN-протокол на Solana. Объединяем GPU мира в суперкомпьютер.</p>
        </div>
        <div className="flex items-start gap-12 sm:gap-16">
          <div>
            <div className="text-[12.5px] font-medium text-[#8e8e93] mb-2.5">Навигация</div>
            <div className="flex flex-col gap-1.5">
              <a href="#features" className="text-[13.5px] text-white/80 hover:text-white transition-colors">Возможности</a>
              <a href="#getting-started" className="text-[13.5px] text-white/80 hover:text-white transition-colors">Быстрый старт</a>
              <a href="#faq" className="text-[13.5px] text-white/80 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <div className="text-[12.5px] font-medium text-[#8e8e93] mb-2.5">Соцсети</div>
            <div className="flex items-center gap-3 text-white/70">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="X"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Discord"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────

export default function App() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setMouseOffset({ x: (e.clientX / window.innerWidth - 0.5) * 12, y: (e.clientY / window.innerHeight - 0.5) * 12 });
      });
    };
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("scroll", handleScroll); cancelAnimationFrame(frameId); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubmitted(true);
    confetti({ particleCount: 65, spread: 60, origin: { y: 0.75 }, colors: ["#ffffff", "#6366f1", "#818cf8", "#f3f4f6"] });
    setTimeout(() => { setIsModalOpen(false); setTimeout(() => setIsSubmitted(false), 400); }, 2200);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.035] mix-blend-screen" style={{ backgroundImage: "url('/noise.png')", backgroundRepeat: "repeat", backgroundSize: "180px 180px" }} />

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 anim-nav ${isScrolled ? "bg-[#050505]/85 backdrop-blur-md py-4 sm:py-5" : "bg-transparent py-8 md:py-9"}`}>
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          <a href="#" className="group flex items-center gap-3 text-white no-underline transition-opacity duration-200 hover:opacity-90">
            <span className="text-[22px] transition-transform duration-300 group-hover:scale-105">⚡</span>
            <span className="font-normal text-[17.5px] tracking-tight text-white"><BlurRevealText text="TensorGrid" delayOffset={80} staggerMs={35} /></span>
          </a>
          <nav className="hidden md:flex items-center gap-9 text-[15px] text-white/70">
            <a href="#features" className="hover:text-white transition-colors"><BlurRevealText text="Возможности" delayOffset={240} staggerMs={28} /></a>
            <a href="#getting-started" className="hover:text-white transition-colors"><BlurRevealText text="Старт" delayOffset={460} staggerMs={28} /></a>
            <a href="#faq" className="hover:text-white transition-colors"><BlurRevealText text="FAQ" delayOffset={660} staggerMs={28} /></a>
          </nav>
          <button type="button" onClick={() => setIsModalOpen(true)} className="text-[15px] font-normal text-white/90 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0">
            <BlurRevealText text="Ранний доступ" delayOffset={780} staggerMs={28} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen w-full flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[15%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-indigo-600/12 via-violet-600/6 to-transparent blur-[120px] rounded-full" />
          <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{ transform: `translate3d(${mouseOffset.x * 0.35}px, ${mouseOffset.y * 0.35}px, 0) scale(1.04)` }}>
            <div className="absolute inset-0 bg-no-repeat animate-ray-pulse" style={{ backgroundImage: "url('/hero-hand-light.jpg')", backgroundPosition: "center 36%", backgroundSize: "cover" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-transparent" />
          </div>
          <div className="absolute inset-0 pointer-events-none z-10">
            {[
              { top: "24%", left: "31%", size: "1.5px", anim: "twinkleStar", dur: "3.2s", del: "0s" },
              { top: "26%", left: "34%", size: "2px", anim: "twinkleStarAlt", dur: "4.1s", del: "0.8s" },
              { top: "28%", left: "37%", size: "1px", anim: "twinkleStar", dur: "3.6s", del: "1.2s" },
              { top: "29%", left: "39%", size: "2.5px", anim: "twinkleStarAlt", dur: "4.5s", del: "0.3s" },
              { top: "31%", left: "42%", size: "1.5px", anim: "twinkleStar", dur: "3.8s", del: "1.5s" },
              { top: "33%", left: "44%", size: "2px", anim: "twinkleStarAlt", dur: "4.0s", del: "0.6s" },
              { top: "27%", left: "41%", size: "1.5px", anim: "twinkleStar", dur: "3.4s", del: "2.1s" },
              { top: "30%", left: "46%", size: "2px", anim: "twinkleStarAlt", dur: "3.9s", del: "1.1s" },
              { top: "34%", left: "48%", size: "1px", anim: "twinkleStar", dur: "2.8s", del: "0.4s" },
              { top: "36%", left: "47%", size: "2.5px", anim: "twinkleStar", dur: "4.2s", del: "1.7s" },
              { top: "32%", left: "40%", size: "2px", anim: "floatMote", dur: "7s", del: "0s" },
              { top: "35%", left: "44%", size: "1.5px", anim: "floatMote", dur: "8s", del: "2.5s" },
            ].map((s, i) => (
              <div key={i} className="absolute rounded-full bg-white blur-[0.2px]" style={{ top: s.top, left: s.left, width: s.size, height: s.size, boxShadow: "0 0 3px #ffffff, 0 0 7px rgba(140, 160, 255, 0.85)", animation: `${s.anim} ${s.dur} ease-in-out infinite`, animationDelay: s.del }} />
            ))}
          </div>
        </div>
        <div className="relative z-20 w-full max-w-2xl mx-auto px-6 pb-20 sm:pb-24 md:pb-28 flex flex-col items-center text-center">
          <h1 className="font-normal text-[36px] sm:text-[45px] md:text-[52px] leading-[1.14] tracking-[-0.035em] text-white">
            <BlurRevealText text="Объедини GPU мира." delayOffset={180} staggerMs={25} /><br />
            <BlurRevealText text="Создай суперкомпьютер." delayOffset={180 + 20 * 25} staggerMs={25} />
          </h1>
          <p className="mt-4 max-w-[500px] text-[14.5px] sm:text-[15px] leading-[1.42] text-[#9ca3af] font-normal">
            <BlurRevealText text="TensorGrid — DePIN-протокол на Solana, который превращает простаивающие видеокарты в глобальную сеть для ИИ-инференса и 3D-рендеринга. От $0.50/час." delayOffset={180 + 42 * 25 + 100} staggerMs={10} />
          </p>
          <div className="anim-btn mt-6 sm:mt-7">
            <button type="button" onClick={() => setIsModalOpen(true)} className="group relative inline-flex items-center justify-center px-6 py-2 rounded-full text-[13.5px] font-normal text-white transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.18] hover:border-white/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              <span className="relative z-10 flex items-center">Получить ранний доступ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-32 pb-32 sm:pt-40 sm:pb-40 flex flex-col items-center justify-center">
        <div className="text-center mb-14 sm:mb-16">
          <p className="text-[19px] sm:text-[20px] font-normal tracking-[-0.02em] leading-[1.3] text-white">Глобальная GPU-сеть на Solana.</p>
          <p className="text-[19px] sm:text-[20px] font-normal tracking-[-0.02em] leading-[1.3] text-[#a1a1aa] mt-0.5">В 6–10 раз дешевле облачных монополистов.</p>
        </div>
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start justify-center">
          <MetricCard end={0.50} prefix="$" suffix="/час" decimals={2} duration={2000} label="Базовая ставка GPU" />
          <MetricCard end={0.00025} prefix="$" decimals={5} duration={2000} label="Комиссия Solana" />
          <MetricCard end={70} suffix="%" duration={2000} label="Поставщику GPU" />
          <MetricCard end={10} suffix=" мин" duration={2000} label="Интервал выплат" />
        </div>
      </section>

      <FeaturesSection />

      {/* Smart Zero-Lag Section */}
      <section className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-28 pb-44 sm:pt-36 sm:pb-52 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <span className="w-2.5 h-1.5 rounded-full bg-white/40 border border-white/30" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 font-medium">SMART ZERO-LAG</span>
          </div>
          <h2 className="text-[36px] sm:text-[45px] md:text-[50px] font-normal tracking-[-0.035em] leading-[1.12] text-white">
            <BlurRevealText text="Работает незаметно." delayOffset={50} staggerMs={22} />
          </h2>
          <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-[#9ca3af] font-normal">
            <BlurRevealText text="Агент запускается при простое и мгновенно освобождает GPU при движении мыши." delayOffset={120} staggerMs={10} />
          </p>
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <TensorGridOrbCard />
          <div className="flex flex-col justify-center text-left lg:pl-2">
            <p className="text-[17px] sm:text-[19px] leading-[1.55] text-white/90 font-normal">
              <BlurRevealText text="Фоновый агент определяет простой системы, запускает контейнеры с задачами и мгновенно сбрасывает их при активности пользователя." delayOffset={80} staggerMs={7} />
            </p>
            <div className="mt-8 sm:mt-10 space-y-7">
              {[
                { title: "Docker-песочница", desc: "Задачи в изолированных контейнерах. Нет доступа к вашим файлам.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
                { title: "Kill-Switch", desc: "Движение мыши = мгновенный сброс задачи. Нулевая задержка.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> },
                { title: "Solana Escrow", desc: "Смарт-контракт удерживает депозит заказчика и стримит выплаты каждые 10 мин.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
              ].map((f) => (
                <div key={f.title} className="group flex items-start gap-3.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-white/80 group-hover:text-white transition-colors">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">{f.icon}</svg>
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-medium text-white leading-tight">{f.title}</h3>
                    <p className="text-[14px] text-[#8e8e93] mt-1 leading-[1.45]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-9 sm:mt-11">
              <button type="button" onClick={() => setIsModalOpen(true)} className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[14px] font-normal text-white transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.18] hover:border-white/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10 flex items-center">Получить ранний доступ</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <GettingStartedSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaFooterSection onOpenModal={() => setIsModalOpen(true)} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer" />
          <div className="relative w-full max-w-md bg-zinc-950/95 border border-white/15 rounded-3xl p-8 shadow-2xl overflow-hidden z-10" style={{ boxShadow: "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.95)" }}>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer" aria-label="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {isSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ты в списке!</h3>
                <p className="text-white/60 text-sm">Мы отправим приглашение на <span className="text-white font-mono">{email}</span> как только всё будет готово.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2"><span className="text-[18px]">⚡</span><span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">Ранний доступ</span></div>
                <h3 className="text-2xl font-medium text-white mb-2">Подключись к TensorGrid</h3>
                <p className="text-white/60 text-sm mb-6">Будь среди первых, кто зарабатывает на простаивающем GPU через Solana.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="email" required placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                  <button type="submit" className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer">Запросить доступ</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
