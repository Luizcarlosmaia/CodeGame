import React from "react";
import { useNavigate } from "react-router-dom";
import { GAME_GUIDE, getGameGuideLabel } from "../utils/gameGuideContent";
import { MODE_DISPLAY } from "../utils/modeLabels";

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
              Guia completo
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Como Jogar
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Três modos, uma missão: decifrar o código secreto. Cada jogo
              oferece um tipo diferente de dica — escolha o que combina com você.
            </p>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 lg:mt-14">
            {GAME_GUIDE.map((game) => {
              const display = MODE_DISPLAY[game.id];

              return (
                <article
                  key={game.id}
                  className={`overflow-hidden rounded-2xl border bg-surface shadow-sm ring-1 ${game.accent} ${game.ringClass}`}
                >
                  <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:gap-10">
                    <div className="flex shrink-0 flex-col items-start gap-4 lg:w-56">
                      <span className="text-4xl" aria-hidden>
                        {game.icon}
                      </span>
                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${game.badgeClass}`}
                        >
                          {display.difficulty}
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold text-ink">
                          {display.label}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-ink-muted">
                          {display.subtitle}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {game.objective}
                      </p>
                      <p className="text-xs font-semibold text-ink-muted">
                        Até {game.maxTries} tentativas por partida
                      </p>
                      <button
                        type="button"
                        className="btn-success w-full text-base sm:w-auto"
                        onClick={() => navigate(game.route)}
                      >
                        Jogar {getGameGuideLabel(game.id)}
                      </button>
                    </div>

                    <div className="grid flex-1 gap-5 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/50 bg-background/80 p-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                          Passo a passo
                        </h3>
                        <ol className="mt-3 space-y-2.5">
                          {game.howToPlay.map((step, index) => (
                            <li
                              key={step}
                              className="flex gap-3 text-sm leading-relaxed text-ink-soft"
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/80 p-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                          {game.feedbackTitle}
                        </h3>
                        <ul className="mt-3 space-y-3">
                          {game.feedbackItems.map((item) => (
                            <li key={item.label} className="flex gap-3">
                              {item.swatch ? (
                                <span
                                  className={`mt-0.5 size-4 shrink-0 rounded-full ${item.swatch}`}
                                  aria-hidden
                                />
                              ) : (
                                <span
                                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-xs font-bold text-brand"
                                  aria-hidden
                                >
                                  •
                                </span>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-ink">
                                  {item.label}
                                </p>
                                <p className="text-sm leading-snug text-ink-muted">
                                  {item.description}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 rounded-lg bg-brand/5 px-3 py-2 text-xs leading-relaxed text-ink-soft">
                          <strong className="font-semibold text-ink">Dica:</strong>{" "}
                          {game.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="mx-auto mt-10 max-w-6xl rounded-2xl border border-border/60 bg-surface p-6 shadow-sm sm:p-8 lg:mt-14">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              Salas multiplayer
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Crie uma sala, convide amigos com o código e monte rodadas com um
              ou mais modos. Cada jogador avança no seu ritmo; o ranking mostra
              quem decifrou com menos tentativas.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn-success w-full sm:w-auto"
                onClick={() => navigate("/custom/criar")}
              >
                Criar sala
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-brand/40 hover:text-brand sm:w-auto"
                onClick={() => navigate("/custom/entrar")}
              >
                Entrar em sala
              </button>
            </div>
          </section>

          <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-surface/80 px-6 py-8 text-center shadow-sm backdrop-blur-sm sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-lg font-semibold text-ink">Pronto para começar?</p>
              <p className="mt-1 text-sm text-ink-muted sm:text-base">
                Escolha um desafio diário ou monte uma partida com amigos.
              </p>
            </div>
            <button
              type="button"
              className="btn-success w-full shrink-0 sm:w-auto"
              onClick={() => navigate("/desafios")}
            >
              Ver desafios do dia
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
