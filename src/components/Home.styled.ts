import styled from "styled-components";

export const HomeWrapper = styled.div`
  height: 95vh;
  width: 100vw;
  background: #f7f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

export const HomeCard = styled.div`
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 4px 32px #0001;
  max-width: 1100px;
  width: 98vw;
  height: 800px;
  margin: 0 auto;
  padding: 0 0 0 0;
  display: flex;
  flex-direction: column;
  @media (max-width: 480px) {
    padding: 0 0 0 0;
  }
`;

export const HomeHeader = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.2rem 2.5rem 1.2rem 2.5rem;
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.2rem 1rem 0.5rem 1rem;
    align-items: flex-start;
  }
`;

export const Logo = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #181c24;
`;

export const HomeMenu = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  @media (max-width: 700px) {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

export const MenuItem = styled.button`
  background: none;
  border-radius: 10px;
  border: none;
  font-size: 1.08rem;
  color: #23272f;
  font-weight: 500;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  transition: background 0.15s, color 0.15s;
  &:hover {
    background: #f0f4fa;
    color: #23272f;
  }
`;

export const HomeContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 3.5rem 2.5rem 3.5rem;
  gap: 2.5rem;
  @media (max-width: 500px) {
    flex-direction: column;
    padding: 1.5rem 1rem 1.5rem 1rem;
    gap: 1rem;
    justify-content: flex-start;
  }
`;

export const HomeText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1.2rem;
`;

export const HomeTitle = styled.h1`
  font-size: 2.7rem;
  font-weight: 800;
  color: #181c24;
  line-height: 1.1;
  @media (max-width: 700px) {
    font-size: 2.1rem;
  }
`;

export const HomeDesc = styled.p`
  font-size: 1.18rem;
  color: #444;
  margin: 0 0 1.2rem 0;
  max-width: 480px;
  line-height: 1.5;
`;

export const HomeButton = styled.button`
  background: #16a085;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 0.9rem 2.2rem;
  margin-top: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.18s;
  &:hover {
    background: #138d75;
  }
`;

export const HomeImage = styled.img`
  max-width: 370px;
  width: 100%;
  height: auto;
  margin-left: 1.5rem;
  @media (max-width: 500px) {
    margin: 1.5rem;
    max-width: 300px;
    width: 250px;
    height: 200px;
  }
`;

export const HomeFooter = styled.footer`
  max-width: 1100px;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem 0.7rem 2.5rem;
  font-size: 1rem;
  color: #888;
  background: #1a212a;
  box-shadow: 0 4px 32px #0001;
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.7rem;
    padding: 1.2rem 1rem 0.7rem 1rem;
    font-size: 0.95rem;
    height: 100px;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 1.1rem;
  align-items: center;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;
