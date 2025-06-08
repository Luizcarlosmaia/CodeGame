import styled from "styled-components";

export const HelpWrapper = styled.div`
  min-height: 100vh;
  background: #f7f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0 0 0;
`;

export const HelpCard = styled.div`
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px #0001;
  max-width: 700px;
  width: 98vw;
  margin: 0 auto;
  padding: 2.5rem 2.5rem 2.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const HelpTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #181c24;
  margin-bottom: 24px;
  text-align: center;
`;

export const HelpSectionTitle = styled.h3`
  font-weight: 700;
  font-size: 18px;
  color: #1976d2;
  margin-bottom: 8px;
  text-align: left;
`;

export const HelpWelcome = styled.h3`
  font-weight: 800;
  font-size: 22px;
  color: #1a237e;
  margin-bottom: 8px;
  text-transform: uppercase;
  text-align: center;
`;

export const HelpParagraph = styled.p`
  margin-bottom: 8px;
  font-size: 16.5px;
  font-weight: 500;
  color: #222;
  text-align: center;
`;

export const HelpImage = styled.img`
  max-width: 220px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 1px 6px #0001;
`;

export const HelpList = styled.ul`
  margin-bottom: 12px;
  text-align: left;
`;

export const HelpOrderedList = styled.ol`
  margin-bottom: 12px;
  padding-left: 20px;
  text-align: left;
`;

export const HelpVersion = styled.div`
  text-align: center;
  font-size: 0.95em;
  color: #888;
`;
