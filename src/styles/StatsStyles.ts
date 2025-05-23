import styled from "styled-components";

export const StatGrid = styled.div`
  min-width: 6rem;
  min-height: 6rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  place-items: center;
  width: 100%;
  justify-items: center;
  align-items: center;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray};
  width: 100%;
  max-width: 8rem;
  min-width: 6rem;
  height: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  text-align: center;
  .label {
    color: ${({ theme }) => theme.colors.grayText};
    padding: 0.3rem;
    font-size: 0.7rem;
    margin: 0.25rem;
    width: 100%;
    text-align: center;
    word-break: break-word;
    white-space: normal;
  }
  .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.numberColor};
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
    word-break: break-word;
    white-space: normal;
  }
`;

export const BarChart = styled.div`
  gap: 0.5rem;
`;

export const BarRow = styled.div`
  display: flex;
  align-items: center;
`;

export const BarLabel = styled.span`
  width: 2rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.black};
`;

export const BarFill = styled.div<{ $width?: number }>`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 2.2rem;
  max-width: 100%;
  width: ${({ $width }) => ($width ? `${$width}%` : "8%")};
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-sizing: border-box;
`;

export const ChartTitle = styled.h3`
  text-align: center;
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 1.1rem;
`;
