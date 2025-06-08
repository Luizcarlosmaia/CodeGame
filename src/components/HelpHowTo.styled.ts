import styled from "styled-components";

export const HowToWrapper = styled.div`
  min-height: 100vh;
  background: #f7f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4.5rem 0 0 0;
  @media (max-width: 900px) {
    min-height: 90vh;
  }
`;

export const HowToTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #181c24;
  margin-bottom: 2.5rem;
  text-align: center;
  @media (max-width: 900px) {
    font-size: 1.5rem;
  }
`;

export const HowToStepsCard = styled.div`
  background: #f7f9fa;
  border-radius: 18px;
  box-shadow: 0 4px 32px #0001;
  max-width: 1000px;
  width: 98vw;
  height: 800px;
  margin: 0 auto;
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 2.5rem;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    gap: 1.5rem;
    max-width: 300px;
    height: 600px;
  }
`;

export const HowToStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 220px;
  max-width: 320px;
`;

export const HowToStepImage = styled.img`
  width: 90px;
  height: 90px;
  margin-bottom: 1.2rem;
  @media (max-width: 900px) {
    width: 30px;
    height: 30px;
  }
`;

export const HowToStepTitle = styled.h2`
  font-size: 1.45rem;
  font-weight: 700;
  color: #181c24;
  margin-bottom: 0.5rem;
  text-align: center;
  @media (max-width: 500px) {
    font-size: 1rem;
  }
`;

export const HowToStepDesc = styled.p`
  font-size: 1.08rem;
  color: #444;
  text-align: center;
  margin: 0;
  @media (max-width: 500px) {
    font-size: 0.8rem;
  }
`;
