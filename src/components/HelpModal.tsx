import React from "react";
import { useNavigate } from "react-router-dom";
import engrenagemIcone from "../img/engrenagem-icone.png";
import cadeadoIcone from "../img/cadeado-icone.png";
import pessoaComemorandoIcone from "../img/pessoa-comemorando-icone.png";

const steps = [
  {
    image: engrenagemIcone,
    alt: "Engrenagem",
    step: "01",
    title: "Descubra o código oculto",
    description:
      "Use as dicas para encontrar o código correto. Cada modo possui sua própria forma de dar feedback.",
    accent: "bg-brand/10 text-brand",
  },
  {
    image: cadeadoIcone,
    alt: "Cadeado",
    step: "02",
    title: "Insira o código",
    description:
      "Digite combinações de números e envie suas tentativas até acertar a sequência.",
    accent: "bg-success/10 text-success",
  },
  {
    image: pessoaComemorandoIcone,
    alt: "Pessoa comemorando",
    step: "03",
    title: "Resolva o desafio",
    description:
      "Quebre o código com o menor número de tentativas e conquiste o topo do ranking.",
    accent: "bg-[#f59e0b]/10 text-[#d97706]",
  },
];

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-24 top-12 size-[380px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-[420px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Guia rápido
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Como Jogar
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Três passos simples para começar a decifrar códigos e subir no
              ranking.
            </p>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {steps.map((step) => (
              <article
                key={step.title}
                className="group flex flex-col rounded-2xl border border-border/60 bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md sm:p-7"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${step.accent}`}
                  >
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="size-8 object-contain sm:size-9"
                    />
                  </span>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-bold tracking-wider text-ink-muted">
                    {step.step}
                  </span>
                </div>

                <h2 className="text-lg font-bold leading-snug text-ink sm:text-xl">
                  {step.title}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted sm:text-base">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-surface/80 px-6 py-8 text-center shadow-sm backdrop-blur-sm sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-lg font-semibold text-ink">
                Pronto para testar?
              </p>
              <p className="mt-1 text-sm text-ink-muted sm:text-base">
                Escolha um modo e comece sua primeira partida agora.
              </p>
            </div>

            <button
              type="button"
              className="btn-success w-full shrink-0 sm:w-auto"
              onClick={() => navigate("/desafios")}
            >
              Começar a jogar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
