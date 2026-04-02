const BLOCKED_PASSWORDS = [
  "12345678", "123456789", "1234567890", "password", "password1",
  "qwerty123", "qwertyui", "abcdefgh", "abcd1234", "iloveyou",
  "letmein1", "welcome1", "monkey123", "dragon12", "master12",
  "football", "baseball", "trustno1", "sunshine", "princess",
  "11111111", "00000000", "12341234", "aaaaaaaa", "passw0rd",
];

export function validatePassword(pw: string): string | null {
  const lower = pw.toLowerCase();

  if (pw.length < 8) return "Lösenordet måste vara minst 8 tecken";
  if (pw.length > 64) return "Lösenordet får vara max 64 tecken";
  if (BLOCKED_PASSWORDS.includes(lower) || /^password\d*$/.test(lower)) {
    return "Lösenordet är för svagt";
  }

  if (/^\d+$/.test(pw)) {
    return "Lösenordet får inte bara innehålla siffror";
  }

  if (/(.)\1{5,}/.test(pw)) {
    return "Lösenordet är för enkelt";
  }

  return null;
}
