// src/styles/AppStyles.ts
import styled, { keyframes, css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 1rem;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 2rem;
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
  width: 2.5rem;
  height: 2.5rem;
  text-align: center;
  font-size: 1.25rem;
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
  margin-top: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark};
  }
`;

export const WinnerMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.successText};
  padding: 1rem;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

export const GuessRowContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

export const GuessDigit = styled.div<{ color: string }>`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.black};
`;

export const HardModeText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

// Contador de tentativas
export const Counter = styled.div`
  font-size: 1rem;
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
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

/** Container interno limita largura e adiciona sombra */
export const Content = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.colors.white};
  min-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
`;

/** Painel de controles: título, contador e modo */
export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/** Linha de inputs + botão */
export const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

export const Badge = styled.span<{ variant: "success" | "warning" }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${({ variant, theme }) =>
    variant === "success" ? theme.colors.green : theme.colors.yellow};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.85rem;
  font-weight: 500;
`;

export const GuessTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
`;

export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const TableHeader = styled.th`
  padding: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  font-weight: 500;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.gray};
  }
`;

export const TableCell = styled.td`
  padding: 0.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayText};
  border: 1px solid ${({ theme }) => theme.colors.gray};
`;

// Mode Toggle Components
export const ModeToggleGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ModeToggleButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.gray};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.grayText};
  font-weight: ${({ active }) => (active ? "600" : "400")};
  transition: background-color 0.2s;
`;
