import styled from "styled-components";

export const StatGrid = styled.div`
  min-width: 6rem;
  min-height: 6rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  place-items: center;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray};
  width: 6rem;
  height: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  .label {
    color: ${({ theme }) => theme.colors.grayText};
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
  }
  .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.numberColor};
    margin-bottom: 1rem;
  }
`;

export const BarChart = styled.div`
  display: flex;
  flex-direction: column;
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

export const BarFill = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export const ChartTitle = styled.h3`
  text-align: center;
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 1.1rem;
`;
