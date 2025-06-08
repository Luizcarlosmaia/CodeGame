import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const MenuWrapper = styled.nav`
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 16px #0001;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
`;

const MenuInner = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 0.7rem 2.2rem;
  @media (max-width: 700px) {
    width: 90%;
    padding: 0.7rem 1.2rem;
  }
`;

const Logo = styled(NavLink)`
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #181c24;
  text-decoration: none;
  &:hover {
    color: #1976d2;
  }
  @media (max-width: 500px) {
    font-size: 1rem;
  }
`;

const MenuLinks = styled.ul<{ $open?: boolean }>`
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  align-items: center;
  @media (max-width: 1200px) {
    gap: 1.1rem;
  }
  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: flex-start;
    position: fixed;
    top: 0;
    left: 0;
    width: 80vw;
    max-width: 340px;
    height: 100vh;
    background: #fff;
    padding: 4.5rem 1.2rem 2rem 1.2rem;
    box-shadow: 2px 0 24px #0002;
    z-index: 300;
    transform: ${({ $open }) =>
      $open ? "translateX(0)" : "translateX(-110%)"};
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const MenuLink = styled(NavLink)`
  font-size: 1.13rem;
  color: #23272f;
  font-weight: 500;
  text-decoration: none;
  padding: 0.2rem 0.3rem;
  border-radius: 10px;
  transition: background 0.15s, color 0.15s;
  &.active {
    color: #1976d2;
    font-weight: 700;
    background: #e3eaf5;
  }
  &:hover {
    background: #f0f4fa;
    color: #23272f;
  }
`;

const BurgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 2.1rem;
  color: #181c24;
  cursor: pointer;
  @media (max-width: 1200px) {
    display: block;
    z-index: 210;
  }
`;

const Overlay = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 700px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.38);
    z-index: 250;
    transition: background 0.2s;
  }
`;

export const MainMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => setOpen(false);

  // Intercepta clique no mobile, navega manualmente, no desktop deixa NavLink agir normalmente
  const handleMenuLinkClick = (e: React.MouseEvent, to: string) => {
    if (window.innerWidth <= 700) {
      e.preventDefault();
      setOpen(false);
      setTimeout(() => {
        navigate(to);
      }, 180);
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <MenuWrapper>
        <MenuInner>
          <Logo to="/home" onClick={(e) => handleMenuLinkClick(e, "/home")}>
            CODEGAME
          </Logo>
          <BurgerButton
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menu"
          >
            ☰
          </BurgerButton>
        </MenuInner>
        <Overlay $open={open} onClick={handleClose} />
        <MenuLinks $open={open}>
          <li>
            <MenuLink
              to="/ajuda"
              onClick={(e) => handleMenuLinkClick(e, "/ajuda")}
            >
              Como Jogar
            </MenuLink>
          </li>
          <li>
            <MenuLink
              to="/desafios"
              onClick={(e) => handleMenuLinkClick(e, "/desafios")}
            >
              Desafios Diários
            </MenuLink>
          </li>
          <li>
            <MenuLink
              to="/custom/criar"
              onClick={(e) => handleMenuLinkClick(e, "/custom/criar")}
            >
              Criar Sala
            </MenuLink>
          </li>
          <li>
            <MenuLink
              to="/custom/entrar"
              onClick={(e) => handleMenuLinkClick(e, "/custom/entrar")}
            >
              Entrar em Sala
            </MenuLink>
          </li>
          <li>
            <MenuLink
              to="/sobre"
              onClick={(e) => handleMenuLinkClick(e, "/sobre")}
            >
              Sobre
            </MenuLink>
          </li>
        </MenuLinks>
      </MenuWrapper>
    </>
  );
};
