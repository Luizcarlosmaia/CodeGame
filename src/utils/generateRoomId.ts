// Gera um código de sala de 10 caracteres, letras e números, tudo maiúsculo
export function generateRoomId(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
