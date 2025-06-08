import React from "react";
import { StyledPrimaryButton } from "./PrimaryButton.styles";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  loading,
  children,
  ...props
}) => {
  return (
    <StyledPrimaryButton disabled={props.disabled || loading} {...props}>
      {loading ? <span className="loader" /> : children}
    </StyledPrimaryButton>
  );
};

export default PrimaryButton;
