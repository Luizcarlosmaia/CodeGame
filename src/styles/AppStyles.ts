// src/styles/AppStyles.ts
import styled, { keyframes, css } from "styled-components";

// src/styles/AppStyles.ts
export const Header = styled.header`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1rem 0.6rem;
  gap: 1rem;
`;

export const NavGroup = styled.div`
  display: flex;
  gap: 0.35rem;
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 0.25rem 0.25rem;
  border-radius: 6px;
`;
export const ThemeToggleWrapper = styled.div`
  /* sem estilos especiais por enquanto */
`;

export const ToggleWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

export const ToggleButton = styled.button`
  background: none;
  border: 2px solid ${({ theme }) => theme.colors.grayText};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  color: ${({ theme }) => theme.colors.grayText};
  cursor: pointer;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 1rem;
  max-width: 360px;
  margin: 2rem auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 0.5rem;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

export const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const ModeSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  padding: 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

export const InputRow = styled.div<{ shake?: boolean }>`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: ${({ shake }) =>
    shake
      ? css`0.3s ${keyframes`
      0%,100% { transform: translateX(0); }
      20%,60% { transform: translateX(-5px); }
      40%,80% { transform: translateX(5px); }
    `}`
      : "none"};
`;

export const DigitInput = styled.input`
  width: 2rem;
  height: 2rem;
  text-align: center;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: 4px;
`;

export const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const RestartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark};
  }
`;

export const WinnerMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.successText};
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

export const GuessRowContainer = styled.div`
  display: flex;
  gap: 0.25rem; // reduzido de 0.5rem
  flex-wrap: wrap;
  justify-content: center;
`;

export const GuessDigit = styled.div<{ color: string; textColor?: string }>`
  width: 1.8rem; // reduzido de 2.5rem
  height: 1.8rem; // reduzido de 2.5rem
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem; // reduzido de 1.25rem
  border-radius: 4px;
  background-color: ${({ color }) => color};
  color: ${({ textColor, theme }) => textColor ?? theme.colors.black};

  @media (max-width: 600px) {
    width: 1.8rem; // mantido compacto no mobile
    height: 1.8rem;
    font-size: 0.9rem; // ligeiramente menor no mobile
  }
`;

export const HardModeText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

export const Counter = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 1rem;
  text-align: center;
`;

// Histórico de códigos testados
export const HistoryList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  gap: 0.5rem;
  margin-top: 1.5rem;
  width: 100%;
`;

export const HistoryItem = styled.li`
  background-color: ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.primaryDark};
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  user-select: none;
`;

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 0.1rem;
  background-color: ${({ theme }) => theme.colors.background};

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

/** Container interno limita largura e adiciona sombra */
export const Content = styled.div`
  width: 100%;
  max-width: 360px;
  background-color: ${({ theme }) => theme.colors.white};
  min-height: calc(80vh - 2rem);
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
`;

export const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.75rem;
`;

export const HistoryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const InfoRow = styled.div`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
`;

export const GuessTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.white};
`;

export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const TableHeader = styled.th`
  padding: 0.4rem 0.6rem;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  font-weight: 400;
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.black};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.gray};
  }
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

export const TableCell = styled.td`
  padding: 0.3rem 0.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.black};
`;

export const Badge = styled.span<{ variant: "success" | "warning" }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background-color: ${({ variant, theme }) =>
    variant === "success" ? theme.colors.green : theme.colors.yellow};
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.2rem;
  text-align: center;
`;

// Mode Toggle Components
export const ModeToggleGroup = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-top: 0.5rem;
`;

export const ModeToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.7rem 0.3rem;
  font-size: 0.9rem;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accent : theme.colors.grayText};
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.accent : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.grayText};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  &:hover {
    transform: scale(1.05);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    /* Forçar um background uniforme */
    background-color: ${({ theme }) => theme.colors.gray};
    color: ${({ theme }) => theme.colors.grayText};
  }
`;

export const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 2rem);
  gap: 0.25rem;
  margin-top: 0.2rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 2.5rem);
    gap: 0.25rem;
  }
`;

export const Key = styled.button`
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.numberColor};
  cursor: pointer;

  &:active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    &:disabled {
      background-color: ${({ theme }) => theme.colors.gray};
      color: ${({ theme }) => theme.colors.grayText};
      cursor: not-allowed;
    }
  }

  @media (max-width: 600px) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
`;
export const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

// Modal de ajuda
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

export const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 1.5rem;
  max-width: 320px;
  width: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  color: ${({ theme }) => theme.colors.primaryDark};
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 400px) {
    max-width: 280px;
    padding: 1rem;
  }
`;

export const ModalHeader = styled.header`
  position: relative;
  padding: 1rem 0;
  text-align: center;
`;

export const ModalContent = styled.div`
  font-size: 0.9rem;

  ul {
    padding-left: 1.2rem;
    margin: 0.5rem 0 0;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.grayText};
  cursor: pointer;
`;

export const IconButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 1.7rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.2);
  }
`;

export const PlainIconButton = styled(IconButton)`
  background-color: transparent;
  border-color: ${({ theme }) => theme.colors.grayText};
  color: ${({ theme }) => theme.colors.grayText};
`;

export const ActiveIconButton = styled(IconButton)<{ active?: boolean }>`
  background-color: ${({ active, theme }) =>
    active ? theme.colors.accent : "transparent"};
  border-color: ${({ active, theme }) =>
    active ? theme.colors.accent : theme.colors.grayText};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.grayText};
`;
