import React from "react";
import { useNavigate } from "react-router-dom";

const pillars = [
  {
    icon: "🤝",
    title: "Quebrar o gelo",
    description:
      "Perfeito para começar reuniões, workshops e encontros — todo mundo joga junto em poucos minutos.",
    accent: "bg-brand/10 text-brand",
  },
  {
    icon: "🏆",
    title: "Competição saudável",
    description:
      "Ranking, rodadas e salas multiplayer transformam cada palpite numa disputa leve e divertida.",
    accent: "bg-success/10 text-success",
  },
  {
    icon: "🧠",
    title: "Aprendizado",
    description:
      "Lógica, dedução e estratégia em três modos diferentes — do visual ao desafio puro de contagem.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: "💬",
    title: "Aproximação",
    description:
      "Com amigos, colegas ou família: comentários, vitórias e derrotas viram assunto na hora.",
    accent: "bg-[#f59e0b]/10 text-[#d97706]",
  },
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 size-[380px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Nossa ideia
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Mais do que adivinhar números
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
              O Code Game nasceu para aproximar pessoas — em reuniões, entre
              amigos ou em qualquer grupo que queira uma pausa divertida antes
              (ou no meio) do dia a dia.
            </p>
          </div>

          <article className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-base leading-relaxed text-ink sm:text-lg">
              Criamos uma experiência leve de competição e raciocínio: você
              decifra códigos, compara resultados no ranking e, nas salas
              customizadas, joga várias rodadas com quem quiser convidar.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              A proposta é simples —{" "}
              <strong className="font-semibold text-ink">
                trazer competição, aprendizado e aproximação
              </strong>{" "}
              sem complicação. Uma rodada rápida já muda o clima da sala; várias
              rodadas viram tradição entre o grupo.
            </p>
          </article>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:mt-14 lg:gap-6">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="flex flex-col rounded-2xl border border-border/60 bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl text-2xl ${pillar.accent}`}
                  aria-hidden
                >
                  {pillar.icon}
                </span>
                <h2 className="mt-4 text-lg font-bold text-ink sm:text-xl">
                  {pillar.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted sm:text-base">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-surface/80 px-6 py-8 text-center shadow-sm backdrop-blur-sm sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-lg font-semibold text-ink">
                Experimente com seu time ou amigos
              </p>
              <p className="mt-1 text-sm text-ink-muted sm:text-base">
                Desafio diário solo ou sala multiplayer — escolha o formato que
                combina com o momento.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                className="btn-success w-full sm:w-auto"
                onClick={() => navigate("/custom/criar")}
              >
                Criar sala
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-surface px-6 py-3.5 text-base font-semibold text-ink-soft transition-colors hover:border-brand/40 hover:text-brand sm:w-auto"
                onClick={() => navigate("/desafios")}
              >
                Desafios diários
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
