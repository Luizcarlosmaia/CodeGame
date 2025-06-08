import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import casualIcon from "../img/casual-icone.png";
import desafioIcon from "../img/desafio-icone.png";
import casualIconMobile from "../img/casual-icone-mobile.png";
import desafioIconMobile from "../img/desafio-icone-mobile.png";

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1rem 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.7rem;
  color: #181c24;
`;

const Subtitle = styled.p`
  font-size: 1.35rem;
  color: #444a55;
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Options = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-top: 1.5rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 1.2rem;
    width: 100%;
  }
`;

const OptionCard = styled.button<{ $highlight?: boolean }>`
  background: ${({ $highlight }) => ($highlight ? "#fffbe9" : "#fff")};
  border: none;
  border-radius: 22px;
  box-shadow: 0 2px 16px #0001;
  padding: 3.2rem 2.8rem 2.2rem 2.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 320px;
  transition: box-shadow 0.18s, background 0.18s;
  &:hover {
    box-shadow: 0 4px 32px #0002;
    background: ${({ $highlight }) => ($highlight ? "#fff7d1" : "#f7faff")};
  }
  @media (max-width: 700px) {
    flex-direction: row;
    width: 100%;
    padding: 1.2rem 1.2rem;
    justify-content: flex-start;
    border-radius: 18px;
  }
`;

const OptionImage = styled.img`
  width: 160px;
  height: 360px;
  margin-bottom: 2.2rem;
  border-radius: 20%;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 1px 8px #0001;
  @media (max-width: 700px) {
    width: 56px;
    height: 56px;
    margin-bottom: 0;
    margin-right: 1.2rem;
    border-radius: 20%;
  }
`;

const OptionLabel = styled.div<{ $dark?: boolean }>`
  font-size: 2.1rem;
  font-weight: 700;
  color: ${({ $dark }) => ($dark ? "#23272f" : "#23272f")};
  text-align: center;
  margin-top: 0.7rem;
  @media (max-width: 700px) {
    font-size: 1.45rem;
    margin-top: 0;
  }
`;

const DailyChallenges: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 700);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Wrapper
      style={isMobile ? { maxWidth: 420, padding: "1.2rem 0.2rem" } : {}}
    >
      <Title
        style={isMobile ? { fontSize: "2.1rem", marginBottom: "0.3rem" } : {}}
      >
        Desafios Diários
      </Title>
      <Subtitle
        style={isMobile ? { fontSize: "1.05rem", marginBottom: "1.2rem" } : {}}
      >
        {isMobile
          ? "Tente descobrir o código em um novo desafio a cada dia."
          : "Resolva um novo quebra-cabeça de código a cada dia"}
      </Subtitle>
      <Options>
        <OptionCard onClick={() => navigate("/casual")} $highlight={!isMobile}>
          <OptionImage
            src={isMobile ? casualIconMobile : casualIcon}
            alt="Modo Casual"
          />
          <OptionLabel $dark={!isMobile}>
            Casual{isMobile && " - Modo Fácil"}
          </OptionLabel>
        </OptionCard>
        <OptionCard onClick={() => navigate("/desafio")} $highlight={isMobile}>
          <OptionImage
            src={isMobile ? desafioIconMobile : desafioIcon}
            alt="Modo Desafio"
          />
          <OptionLabel $dark={isMobile}>
            Desafio{isMobile && " - Modo Difícil"}
          </OptionLabel>
        </OptionCard>
      </Options>
    </Wrapper>
  );
};

export default DailyChallenges;
