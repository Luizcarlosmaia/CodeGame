import styled from "styled-components";
export const GameMainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
  justify-content: center;
  margin-left: 30px;
  width: 1100px;
  @media (max-width: 899px) {
    flex-direction: column;
    gap: 4px;
    width: 300px;
    margin-left: 0;
    align-items: center;
  }
`;

export const GameLeftCol = styled.div`
  width: 450px;
  max-width: 95%;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const GameRightCol = styled.div`
  width: 450px;
  min-width: 260px;
  max-width: 95%;
  @media (max-width: 899px) {
    width: 100%;
    max-width: 100%;
  }
`;
export const RoundList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

export const RoundItem = styled.li`
  margin: 0;
  padding: 0;
  background: none;
  border: none;
`;

export const RoundCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.08);
  border: 1.5px solid #e3eaf5;
  padding: 3rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  @media (max-width: 899px) {
    border-radius: 8px;
    margin-bottom: 8px;
    display: flex
    gap: 4px;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    align-content: flex-start;
  }
`;

export const RoundTitle = styled.div`
  font-size: 17px;
  font-weight: 400;
  color: #1976d2;
  @media (max-width: 899px) {
    font-size: 0.92rem;
  }
`;

export const RoundStatus = styled.div<{ terminou: boolean; win: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${({ terminou, win }) =>
    terminou ? (win ? "#388e3c" : "#d32f2f") : "#1976d2"};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  @media (max-width: 899px) {
    font-size: 11px;
    padding: 2px 7px !important;
    border-radius: 6px !important;
  }
`;

export const RoundGuessesLabel = styled.span`
  font-size: 12px;
  color: #555;
  @media (max-width: 899px) {
    font-size: 9.5px;
  }
`;

export const RoundGuessesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0 0;
  padding: 0;
  list-style: none;
`;

export const RoundGuess = styled.li`
  background: #f1f5fa;
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 13px;
  color: #1976d2;
  font-weight: 700;
  @media (max-width: 899px) {
    font-size: 10px;
    padding: 2px 5px;
  }
`;

export const RoundPlayButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.18s;
  @media (max-width: 899px) {
    font-size: 12px;
    padding: 7px 12px;
    border-radius: 6px;
  }
`;

export const RoundEmpty = styled.li`
  color: #888;
`;
export const RodadaPainelContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0;
`;

export const RodadaPainelOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 18px;
`;

export const RodadaPainelResult = styled.div<{ win: boolean }>`
  font-size: 26px;
  font-weight: 800;
  color: ${({ win }) => (win ? "#388e3c" : "#d32f2f")};
  margin-bottom: 24px;
  text-shadow: 0 1px 8px #fff, 0 1px 0 #fff;
`;

export const RodadaPainelButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  transition: background 0.18s;
`;
export const BackButton = styled.button`
  align-self: flex-start;
  margin-bottom: 10px;
  background: #e3eaf5;
  color: #1976d2;
  border: none;
  border-radius: 8px;
  padding: 7px 18px 7px 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: background 0.18s;
`;

export const RoomHeader = styled.div`
  font-size: 30px;
  color: #1976d2;
  font-weight: 600;
  text-align: center;
  width: 100%;
  opacity: 0.85;
  margin-bottom: 16px;
`;

export const MainContainer = styled.div`
  max-width: 1100px;
  margin: 50px auto 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  @media (max-width: 899px) {
    max-width: 300px;
    margin: 60px;
    padding: 0;
  }
`;

export const Card = styled.div`
  background: #f8fafc;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.08);
  padding: 1rem;
  width: 100%;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;

  max-width: 1100px;
  margin: 10px 0 10px 0;
  @media (max-width: 899px) {
    max-width: 96vw;
    padding: 6px 2vw 10px 2vw;
    margin: 4px 0 4px 0;
  }
`;

export const RoomName = styled.div`
  font-size: 14px;
  color: #1976d2;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
  opacity: 0.85;
`;

export const RoundsTitle = styled.h3`
  text-align: center;
  color: #1976d2;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 800;
  @media (max-width: 899px) {
    font-size: 1rem;
  }
`;

export const RoundsList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

export const RankingCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
  padding: 1rem 2.5rem;
  width: 350px;
  @media (max-width: 899px) {
    width: 100%;
    padding: 1rem 0.5rem;
  }
`;

export const RankingTitle = styled.div`
  color: #1976d2;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
  @media (max-width: 899px) {
    font-size: 0.95rem;
  }
`;

export const RankingList = styled.ol`
  margin: 0;
  text-align: left;
  width: 100%;
`;
