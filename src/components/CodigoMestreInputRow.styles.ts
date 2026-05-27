import styled, { css } from "styled-components";

export const CodigoMestreRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CodigoMestreArrowRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  min-height: 32px;
  margin-bottom: 6px;
`;

export const CodigoMestreArrow = styled.span<{
  $status: "correct" | "present" | "absent";
  $arrow: "up" | "down";
}>`
  display: inline-block;
  width: 64px;
  text-align: center;
  font-size: 38px;
  height: 32px;
  font-weight: 700;
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

export const CodigoMestreInputsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 0.5em 0;
`;

export const CodigoMestreDigitInput = styled.input`
  width: 80px;
  height: 80px;
  text-align: center;
  font-size: 44px;
  font-weight: 700;
  border-width: 3px;
  border-color: #888;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
  margin: 0;
`;
