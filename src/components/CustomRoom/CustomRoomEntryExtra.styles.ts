import styled from "styled-components";

export const RoomTypeRow = styled.div`
  display: flex;
  gap: 16px;
  margin: 8px 0;
  @media (max-width: 899px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const ModeInput = styled.input`
  width: 60px;
  @media (max-width: 899px) {
    width: 100%;
    max-width: 80px;
  }
`;
