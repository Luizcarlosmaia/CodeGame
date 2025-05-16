export const generateCode = (): string[] => {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10).toString()
  );
};
