import React from "react";
import engrenagemIcone from "../img/engrenagem-icone.png";
import cadeadoIcone from "../img/cadeado-icone.png";
import pessoaComemorandoIcone from "../img/pessoa-comemorando-icone.png";
import {
  HowToWrapper,
  HowToTitle,
  HowToStepsCard,
  HowToStep,
  HowToStepImage,
  HowToStepTitle,
  HowToStepDesc,
} from "./HelpHowTo.styled";

const HelpPage: React.FC = () => {
  return (
    <HowToWrapper>
      <HowToTitle>Como Jogar</HowToTitle>
      <HowToStepsCard>
        <HowToStep>
          <HowToStepImage src={engrenagemIcone} alt="Engrenagem" />
          <HowToStepTitle>1. Descubra o código oculto</HowToStepTitle>
          <HowToStepDesc>
            Use as dicas para encontrar o código correto. Lembre-se de que cada
            modo possui sua propria forma de dar dicas.
          </HowToStepDesc>
        </HowToStep>
        <HowToStep>
          <HowToStepImage src={cadeadoIcone} alt="Cadeado" />
          <HowToStepTitle>2. Insira o código</HowToStepTitle>
          <HowToStepDesc>
            Faça tentativas para encontrar o código.
          </HowToStepDesc>
        </HowToStep>
        <HowToStep>
          <HowToStepImage
            src={pessoaComemorandoIcone}
            alt="Pessoa comemorando"
          />
          <HowToStepTitle>3. Resolva o desafio</HowToStepTitle>
          <HowToStepDesc>
            Quebre o código com o menor número de tentativas e seja o melhor!
          </HowToStepDesc>
        </HowToStep>
      </HowToStepsCard>
    </HowToWrapper>
  );
};

export default HelpPage;
