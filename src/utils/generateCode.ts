export const generateCode = (mode?: string): string[] => {
  if (mode === "codigo-mestre") {
    // 4 campos de 0 a 99
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 100).toString()
    );
  }
  // padrão: 4 dígitos 0-9
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10).toString()
  );
};
