import styled, { keyframes } from "styled-components";

const loadingSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const StyledPrimaryButton = styled.button`
  width: 100%;
  background: #1978d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  padding: 14px 0;
  margin-top: 12px;
  box-shadow: 0 2px 8px 0 rgba(23, 156, 125, 0.08);
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  &:hover:not(:disabled) {
    background: #13b08a;
    box-shadow: 0 4px 16px 0 rgba(23, 156, 125, 0.13);
  }
  &:active:not(:disabled) {
    background: #128c6c;
  }
  &:disabled {
    background: #b2dfdb;
    color: #e0e0e0;
    cursor: not-allowed;
    box-shadow: none;
  }
  .loader {
    width: 22px;
    height: 22px;
    border: 3px solid #fff;
    border-top: 3px solid #179c7d;
    border-radius: 50%;
    animation: ${loadingSpin} 0.8s linear infinite;
    margin: 0 auto;
    background: transparent;
    display: block;
  }
`;
