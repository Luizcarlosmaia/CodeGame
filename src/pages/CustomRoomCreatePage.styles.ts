import styled from "styled-components";

export const CreateRoomCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.07);
  padding: 36px 40px 32px 40px;
  max-width: 520px;
  margin: 48px auto;
  width: 100%;
  @media (max-width: 800px) {
    padding: 28px 12px 24px 12px;
    max-width: 98vw;
    margin: 24px auto;
  }
  @media (min-width: 800px) {
    padding: 1rem 8rem 3rem 8rem;
    max-width: 1500px;
    width: 1000px;
    height: 700px;
  }
`;

export const SelectFake = styled.div`
  display: flex;
  align-items: center;
  background: #fafbfc;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
  margin-top: 4px;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
  opacity: 0.7;
`;

export const ModeRowStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafd;
  border-radius: 8px;
  padding: 8px 12px;
`;

export const ModeIcon = styled.span<{ $mode: string }>`
  font-size: 28px;
  margin-right: 4px;
  ${(props) =>
    props.$mode === "casual"
      ? "background: #2bb6a3; color: #fff;"
      : "background: #ffd54f; color: #b8860b;"}
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModeCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  overflow: hidden;
  margin-left: 16px;
  margin-right: 8px;
  button {
    background: none;
    border: none;
    font-size: 22px;
    width: 32px;
    height: 36px;
    color: #1976d2;
    cursor: pointer;
    transition: background 0.15s;
    &:disabled {
      color: #bdbdbd;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      background: #f0f4f8;
    }
  }
  input[type="number"] {
    border: none;
    outline: none;
    font-size: 18px;
    width: 36px;
    text-align: center;
    background: transparent;
    color: #222;
    font-weight: 600;
    padding: 0;
  }
`;
