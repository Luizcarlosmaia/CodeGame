import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";

const LG_BREAKPOINT = 900;

export const MainMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setOpen(false);

  const handleMenuLinkClick = (
    e: React.MouseEvent,
    to: string,
    mobileOnly = false
  ) => {
    if (mobileOnly && window.innerWidth < LG_BREAKPOINT) {
      e.preventDefault();
      setOpen(false);
      setTimeout(() => navigate(to), 180);
    } else {
      setOpen(false);
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand/8 hover:text-brand lg:text-[0.9375rem]",
      isActive && "bg-brand/10 font-semibold text-brand"
    );

  const menuItems = [
    { to: "/ajuda", label: "Como Jogar" },
    { to: "/desafios", label: "Desafios Diários" },
    { to: "/custom/criar", label: "Criar Sala" },
    { to: "/custom/entrar", label: "Entrar em Sala" },
    { to: "/sobre", label: "Sobre" },
  ];

  return (
    <>
      <nav className="fixed left-0 top-0 z-[100] w-full border-b border-border/50 bg-surface/90 shadow-[0_1px_12px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/home"
            onClick={(e) => handleMenuLinkClick(e, "/home", true)}
            className="shrink-0 text-lg font-extrabold tracking-tight text-ink no-underline transition-colors hover:text-brand sm:text-xl"
          >
            CODE<span className="text-brand">GAME</span>
          </NavLink>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-ink transition-colors hover:bg-brand/8 lg:hidden"
          >
            <span className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      <button
        type="button"
        aria-label="Fechar menu"
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-[250] bg-black/40 transition-opacity lg:hidden",
          open ? "block" : "hidden"
        )}
      />

      <ul
        className={cn(
          "fixed left-0 top-0 z-[300] flex h-screen w-[min(320px,85vw)] flex-col gap-1 border-r border-border/50 bg-surface px-4 pb-8 pt-20 shadow-[4px_0_24px_rgba(0,0,0,0.08)] transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {menuItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(linkClass({ isActive }), "block w-full px-4 py-3 text-base")
              }
              onClick={(e) => handleMenuLinkClick(e, item.to, true)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );
};
