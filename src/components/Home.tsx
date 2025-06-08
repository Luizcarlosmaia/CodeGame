import React from "react";
import iconesImg from "../img/icones-tela-inicial.png";
import {
  HomeButton,
  HomeCard,
  HomeContent,
  HomeDesc,
  HomeImage,
  HomeText,
  HomeTitle,
  HomeWrapper,
} from "./Home.styled";
import { MainMenu } from "./MainMenu";

const Home: React.FC = () => {
  return (
    <HomeWrapper>
      <MainMenu />
      <div style={{ height: 72 }} />
      <HomeCard
        style={{
          boxShadow: "none",
          background: "none",
          borderRadius: 0,
          marginTop: 0,
        }}
      >
        <HomeContent>
          <HomeText>
            <HomeTitle>Desafie a sua mente. Decifre o código</HomeTitle>
            <HomeDesc>
              Escolha seu desafio:
              <br /> • Desafios Diários – quebre o seu recorde
              <br /> • Multiplayer – crie uma sala e desafie os amigos
            </HomeDesc>
            <HomeButton onClick={() => (window.location.href = "/desafios")}>
              Iniciar Jogo
            </HomeButton>
          </HomeText>
          <HomeImage
            src={iconesImg}
            alt="Ilustração de pessoas jogando CodeGame"
          />
        </HomeContent>
      </HomeCard>
    </HomeWrapper>
  );
};

export default Home;
