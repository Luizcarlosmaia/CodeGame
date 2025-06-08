import styled from "styled-components";
export const LobbyMainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  @media (max-width: 899px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const LobbyLeftCol = styled.div`
  min-width: 0;
  height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 22px;
`;

export const LobbyRightCol = styled.div`
  width: 340px;
  min-width: 260px;
  height: 550px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 899px) {
    width: 100%;
    min-width: 0;
    margin-top: 8px;
    justify-content: flex-start;
    height: 200px;
  }
`;

export const RoomCodeCard = styled.div`
  background: linear-gradient(90deg, #1976d2 80%, #1565c0 100%);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.09);
  padding: 22px 18px 16px 18px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  @media (max-width: 899px) {
    padding: 14px 4vw 10px 4vw;
    border-radius: 9px;
  }
`;

export const RoomCode = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 10px 18px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
`;

export const RoomCodeCopyBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #1976d2;
  font-size: 18px;
  transition: color 0.15s;
  &:hover {
    color: #1251a3;
  }
`;

export const ParticipantsCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
  padding: 18px 16px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ParticipantAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e0e4ea;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const ParticipantName = styled.span`
  font-size: 15px;
  color: #222;
  font-weight: 500;
`;

export const OwnerBadge = styled.span`
  background: #ffd600;
  color: #222;
  font-size: 13px;
  font-weight: 700;
  border-radius: 6px;
  padding: 2px 7px;
  margin-left: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
`;

export const RoundsCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
  padding: 18px 16px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const RoundBadge = styled.div<{ $mode?: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ $mode }) => ($mode === "casual" ? "#e3f2fd" : "#ffe0e0")};
  color: ${({ $mode }) => ($mode === "casual" ? "#1976d2" : "#d32f2f")};
  font-weight: 600;
  font-size: 15px;
  border-radius: 7px;
  padding: 5px 13px;
`;
// --- CustomRoomLobby extra styled ---
export const TopBackButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
`;

export const BlockMargin = styled.div<{ $mb?: number; $mt?: number }>`
  margin-bottom: ${({ $mb }) => ($mb !== undefined ? $mb : 18)}px;
  margin-top: ${({ $mt }) => ($mt !== undefined ? $mt : 0)}px;
`;

export const CenteredColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`;

export const MainActionButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 0;
  width: 280px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  transition: background 0.18s;
  &:hover {
    background: #1251a3;
  }
  @media (max-width: 899px) {
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 6px;
    width: 100%;
    min-width: 0;
  }
`;

export const ErrorMsg = styled.div`
  color: #d32f2f;
  text-align: center;
  margin: 24px 0;
  font-size: 15px;
  @media (max-width: 899px) {
    font-size: 13px;
    margin: 14px 0;
  }
`;

export const StatusMsg = styled.div`
  color: #1976d2;
  font-weight: 500;
  font-size: 15px;
  padding: 10px;
  @media (max-width: 899px) {
    font-size: 13px;
    padding: 7px 2vw;
  }
`;

export const InfoMsg = styled.div`
  color: #555;
  font-size: 14px;
  margin-top: 2px;
  text-align: center;
  @media (max-width: 899px) {
    font-size: 12px;
  }
`;

export const LeaveButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  margin-bottom: 20px;
`;

export const LeaveButton = styled.button<{ $leaving?: boolean }>`
  background: #fff;
  color: #d32f2f;
  border: 1.5px solid #d32f2f;
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.08);
  transition: background 0.18s, color 0.18s;
  opacity: ${({ $leaving }) => ($leaving ? 0.6 : 1)};
  @media (max-width: 899px) {
    font-size: 13px;
    padding: 8px 10px;
    border-radius: 6px;
    min-width: 0;
    width: 100%;
  }
`;

export const ConfigList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ConfigEmpty = styled.li`
  color: #888;
`;
export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  background: #f1f5fa;
  color: #1976d2;
  border: none;
  border-radius: 8px;
  padding: 7px 18px 7px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.05rem;
  transition: background 0.18s;
  &:hover {
    background: #e3eaf5;
  }
`;
export const RoomHeaderCard = styled.div`
  background: #f8fafc;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.09);
  padding: 22px 18px 16px 18px;
  margin-bottom: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  @media (max-width: 899px) {
    padding: 14px 4vw 10px 4vw;
    border-radius: 9px;
  }
`;

export const RoomHeaderTitle = styled.h2`
  font-size: 1.45rem;
  font-weight: 800;
  color: #1976d2;
  margin: 0 0 2px 0;
  letter-spacing: 0.01em;
  text-align: center;
`;

export const RoomHeaderSub = styled.div`
  font-size: 1.02rem;
  color: #555;
  text-align: center;
`;

export const RankingCard = styled.section`
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
  padding: 18px 14px 14px 14px;
  margin-top: 32px;
  margin-bottom: 10px;
  max-height: 220px;
  overflow-y: auto;
  @media (max-width: 899px) {
    padding: 12px 3vw 10px 3vw;
    border-radius: 8px;
    max-height: 180px;
  }
`;
export const RoundCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.08);
  border: 1.5px solid #e3eaf5;
  padding: 18px 16px 14px 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 899px) {
    padding: 12px 4vw 10px 4vw;
    border-radius: 8px;
  }
`;

export const RoundTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 2px;
`;

export const RoundStatus = styled.div<{ $win?: boolean; $lose?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $win, $lose }) =>
    $win ? "#388e3c" : $lose ? "#d32f2f" : "#1976d2"};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
`;

export const GuessChips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0 0;
  padding: 0;
  list-style: none;
`;

export const GuessChip = styled.li`
  background: #f1f5fa;
  border-radius: 5px;
  padding: 3px 10px;
  font-family: "Fira Mono", "Consolas", monospace;
  font-size: 1rem;
  color: #333;
  border: 1px solid #e0e0e0;
`;

export const PlayButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 700;
  font-size: 1.08rem;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.18s;
  &:hover {
    background: #1251a3;
  }
`;
export const CardSection = styled.section`
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1.5px 8px rgba(25, 118, 210, 0.07);
  padding: 20px 16px 18px 16px;
  margin-bottom: 22px;
  @media (max-width: 899px) {
    padding: 14px 4vw 12px 4vw;
    border-radius: 8px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.13rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0 0 12px 0;
  letter-spacing: 0.01em;
  text-align: left;
`;

export const LobbyContainer = styled.div`
  max-width: 900px;
  margin-top: 60px;
  height: 750px;
  padding: 1rem 2rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  font-family: "Inter", "Montserrat", Arial, sans-serif;
  width: 100%;
  @media (max-width: 899px) {
    height: 950px;
  }
`;

export const RoomTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 10px;
  text-align: center;
  @media (max-width: 899px) {
    font-size: 1.05rem;
    margin-bottom: 7px;
  }
`;

export const RoomInfo = styled.div`
  margin-bottom: 12px;
  text-align: center;
`;

export const MembersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

export const MemberItem = styled.li<{ highlight?: boolean }>`
  background: ${({ highlight }) => (highlight ? "#e0f7fa" : "#f5f5f5")};
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: ${({ highlight }) => (highlight ? "bold" : "normal")};
  color: ${({ highlight }) => (highlight ? "#00796b" : "#333")};
  border: ${({ highlight }) =>
    highlight ? "1.5px solid #00796b" : "1px solid #ddd"};
  font-size: 1rem;
`;

export const CreateButton = styled.button`
  margin-top: 24px;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  background: #1976d2;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1565c0;
  }
`;

export const RoomMainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const RoomMainName = styled.span`
  font-weight: 700;
  font-size: 22px;
  color: #222;
  letter-spacing: 0.2px;
`;
export const RoomMainCode = styled.span`
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
`;
export const RoomMainCodeId = styled.b`
  letter-spacing: 0.5px;
`;
export const RoomCopyButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #1976d2;
  font-size: 18px;
  transition: color 0.15s;
`;
export const RoomMainSub = styled.div`
  font-size: 13px;
  color: #555;
  margin-top: 2px;
`;
export const RoomMainDayCode = styled.div`
  font-size: 13px;
  color: #1976d2;
  margin-top: 2px;
`;
