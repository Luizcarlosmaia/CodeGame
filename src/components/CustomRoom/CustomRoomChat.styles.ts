import styled from "styled-components";

export const ChatContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  max-width: 400px;
  background: #fff;
  font-size: 0.93rem;
`;

export const ChatTitle = styled.h3`
  margin-bottom: 7px;
  font-size: 1rem;
  color: #1976d2;
  font-weight: 700;
`;

export const MessagesContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 7px;
  background: #fafafa;
  padding: 6px;
  border-radius: 4px;
  font-size: 0.93em;
`;

export const EmptyMessage = styled.div`
  color: #888;
  font-size: 0.93em;
`;

export const MessageRow = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  font-size: 0.93em;
`;

export const MessageUser = styled.span`
  font-weight: bold;
  color: #1976d2;
  font-size: 0.95em;
`;

export const MessageText = styled.span`
  color: #222;
  font-size: 0.95em;
`;

export const MessageTime = styled.span`
  color: #aaa;
  font-size: 9px;
  margin-left: 5px;
`;

export const ChatForm = styled.form`
  display: flex;
  gap: 4px;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
`;

export const ChatButton = styled.button`
  padding: 5px 10px;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.18s;
  &:disabled {
    background: #b0b8c9;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #1251a3;
  }
`;

export const ErrorMsg = styled.div`
  color: #d32f2f;
  margin-top: 4px;
  font-size: 0.93rem;
`;
