import styled from "styled-components";
export const EntryMainWrapper = styled.div`
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  display: flex;
  gap: 80px;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 1rem 2rem;
  justify-content: center;
`;

export const EntryFormCol = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 400px;
`;

export const EntryListCol = styled.div`
  flex: 1.2;
  min-width: 320px;
  max-width: 600px;
`;
export const EntryModoBadge = styled.span`
  background: none;
  color: #7a8ca3;
  font-weight: 400;
  font-size: 0.73em;
  border: 1px solid #e0e4ea;
  border-radius: 6px;
  padding: 0.2rem;
  display: inline-block;
  margin: 0.2rem;
  letter-spacing: 0.1px;
`;
// Loading box for "Criando sala permanente..."
export const EntryLoadingBox = styled.div`
  text-align: center;
  color: #1976d2;
  font-weight: 600;
  font-size: 20px;
  margin: 32px 0 24px 0;
  padding: 24px;
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.07);
`;

// Fixed type label ("Sala Fixa")
export const EntryTypeLabel = styled.div`
  font-weight: 600;
  color: #1976d2;
  margin-top: 8px;
`;

// Error message for entry forms
export const EntryErrorMsg = styled.div`
  color: #d32f2f;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 500;
`;
import { css } from "styled-components";

// Padrão consistente para CustomRoomEntry
export const EntryTabs = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
  @media (max-width: 899px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const EntryTab = styled.button<{ $active?: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "#eee"};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : "#333")};
  font-size: 1.25rem;
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  border: none;
  border-radius: 14px 14px 0 0;
  padding: 1.2rem 2.2rem;
  min-width: 120px;
  flex: 0 0 auto;
  text-align: center;
  cursor: pointer;
  margin: 0;
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 12px rgba(25, 118, 210, 0.12)" : "none"};
  transition: background 0.2s, color 0.2s;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  @media (max-width: 899px) {
    width: 100%;
    min-width: 0;
    padding: 1.1rem 0.5rem;
    font-size: 1.1rem;
    height: 54px;
  }
  
    font-size: 1.05rem;
    padding: 1rem 0;
    height: 50px;
  }
`;

export const EntryPermanentList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

export const EntryPermanentItem = styled.li`
  margin-bottom: 10px;
  border: none;
  border-radius: 14px;
  padding: 1rem;
  background: #fafdff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.06);
  transition: box-shadow 0.18s, background 0.18s;
  &:hover,
  &:active {
    background: #f1f7fb;
    box-shadow: 0 4px 18px rgba(25, 118, 210, 0.13);
  }
  @media (max-width: 899px) {
    padding: 1rem;
    border-radius: 10px;
    gap: 1rem;
  }
`;

export const EntryPermanentId = styled.span`
  color: #b0b8c9;
  font-weight: 600;
  margin-left: 4px;
  font-size: 0.73em;
`;

export const EntryPermanentModos = styled.div`
  font-size: 0.93rem;
  color: #7a8ca3;
  margin-top: 1px;
`;

export const EntryPermanentBtn = styled.button`
  margin: 0;
  margin-top: 4px;
  padding: 10px 0;
  font-size: 1rem;
  border-radius: 7px;
  background: #e3eaf5;
  color: #1976d2;
  font-weight: 700;
  border: none;
  cursor: pointer;
  width: 100%;
  box-shadow: none;
  transition: background 0.18s, color 0.18s;
  &:hover,
  &:active {
    background: #d6e3f7;
    color: #1251a3;
  }
`;
export const EntryContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin-top: 4.5rem;
  margin-left: 0;
  margin-right: 0;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Inter", "Montserrat", Arial, sans-serif;
`;

export const Section = styled.div`
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 6px;
  }
`;
export const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  ${({ required }) =>
    required &&
    css`
      &::after {
        content: " *";
        color: #d32f2f;
        font-size: 1em;
      }
    `}
`;

export const Input = styled.input<{ $error?: boolean; $shake?: boolean }>`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1.5px solid ${({ $error }) => ($error ? "#d32f2f" : "#ccc")};
  margin-bottom: 12px;
  ${({ $shake }) =>
    $shake &&
    css`
      animation: shake 0.25s linear;
    `}
`;

export const ModeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Button = styled.button`
  padding: 1rem 6rem;
  border-radius: 28px;
  border: none;
  background: #1976d2;
  color: #fff;
  font-weight: bold;
  font-size: 1.3rem;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.2s;
  &:hover {
    background: #1565c0;
  }
`;
