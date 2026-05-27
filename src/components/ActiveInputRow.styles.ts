import styled, { css } from "styled-components";

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ArrowRow = styled.div<{
  $isCodigoMestre: boolean;
  $modoVisual: boolean;
}>`
  display: flex;
  justify-content: center;
  gap: ${({ $modoVisual, $isCodigoMestre }) =>
    $modoVisual
      ? $isCodigoMestre
        ? "24px"
        : "16px"
      : $isCodigoMestre
      ? "12px"
      : "4px"};
  min-height: ${({ $modoVisual }) => ($modoVisual ? "32px" : "24px")};
  margin-bottom: ${({ $modoVisual }) => ($modoVisual ? "6px" : "2px")};
`;

export const Arrow = styled.span<{
  $status: "correct" | "present" | "absent";
  $arrow: "up" | "down";
  $isCodigoMestre: boolean;
  $modoVisual: boolean;
}>`
  display: inline-block;
  width: ${({ $modoVisual, $isCodigoMestre }) =>
    $modoVisual
      ? $isCodigoMestre
        ? "64px"
        : "56px"
      : $isCodigoMestre
      ? "48px"
      : "48px"};
  text-align: center;
  font-size: ${({ $modoVisual, $isCodigoMestre }) =>
    $modoVisual
      ? $isCodigoMestre
        ? "38px"
        : "32px"
      : $isCodigoMestre
      ? "22px"
      : "22px"};
  height: ${({ $modoVisual }) => ($modoVisual ? "32px" : "22px")};
  font-weight: ${({ $modoVisual }) => ($modoVisual ? 700 : 400)};
  user-select: none;
  color: #bbb;
  transition: color 0.2s;
  ${({ $status, $arrow }) =>
    $status === "correct"
      ? css`
          color: #217a4b;
        `
      : $status === "present"
      ? css`
          color: ${$arrow === "up" ? "#bfa100" : "#222"};
        `
      : ""}
`;

export const InputsRow = styled.div<{
  $isCodigoMestre: boolean;
  $modoVisual: boolean;
}>`
  display: flex;
  justify-content: center;
  gap: ${({ $isCodigoMestre, $modoVisual }) =>
    $modoVisual
      ? $isCodigoMestre
        ? "24px"
        : "16px"
      : $isCodigoMestre
      ? "12px"
      : "4px"};
  margin: 0.5em 0;
`;
