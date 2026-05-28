import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../img/home-hero-friends.png";

const features = [
  {
    title: "Desafios Diários",
    description: "Quebre o seu recorde todo dia",
    accent: "bg-success/10 text-success",
    icon: "🎯",
  },
  {
    title: "Multiplayer",
    description: "Crie uma sala e desafie os amigos",
    accent: "bg-brand/10 text-brand",
    icon: "👥",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div className="flex w-full flex-1 flex-col items-start gap-6 lg:max-w-xl">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Quebra-cabeça numérico
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Desafie a sua mente.
              <span className="mt-1 block text-brand">Decifre o código.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
              Escolha seu desafio e teste sua lógica — sozinho ou com amigos em
              salas multiplayer.
            </p>

            <div className="grid w-full gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg ${feature.accent}`}
                  >
                    {feature.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-ink-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                className="btn-success w-full sm:w-auto"
                onClick={() => navigate("/desafios")}
              >
                Iniciar Jogo
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-surface px-8 py-3.5 text-base font-semibold text-ink-soft transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand sm:w-auto"
                onClick={() => navigate("/ajuda")}
              >
                Como jogar
              </button>
            </div>
          </div>

          <div className="flex w-full flex-[1.15] items-center justify-center lg:justify-end">
            <div className="w-full max-w-[min(100%,440px)] sm:max-w-[540px] lg:max-w-[620px] xl:max-w-[680px]">
              <img
                src={heroImg}
                alt="Amigos jogando CodeGame juntos no celular e no tablet"
                className="h-auto w-full rounded-2xl object-contain drop-shadow-[0_24px_48px_rgba(25,118,210,0.14)] sm:rounded-3xl"
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
