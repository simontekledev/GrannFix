const BLOCKED_PASSWORDS = [
  "12345678", "123456789", "1234567890", "password", "password1",
  "password12", "password123", "qwerty123", "qwertyuiop", "abcdefgh",
  "abcd1234", "iloveyou", "letmein123", "welcome123", "monkey123",
  "dragon123", "master123", "football", "baseball", "trustno1",
  "sunshine", "princess", "11111111", "00000000", "12341234",
  "aaaaaaaa", "passw0rd", "stockholm", "stockholm1", "sverige123",
  "svensson", "sommaren", "lasenord", "lasenord1", "grannfix",
  "grannfix1", "grannfix123",
];

function hasSequentialRun(pw: string): boolean {
  for (let i = 0; i <= pw.length - 4; i++) {
    const a = pw.charCodeAt(i);
    const b = pw.charCodeAt(i + 1);
    const c = pw.charCodeAt(i + 2);
    const d = pw.charCodeAt(i + 3);
    if (b === a + 1 && c === a + 2 && d === a + 3) return true;
    if (b === a - 1 && c === a - 2 && d === a - 3) return true;
  }
  return false;
}

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Lösenordet måste vara minst 8 tecken";
  if (pw.length > 64) return "Lösenordet får vara max 64 tecken";

  const lower = pw.toLowerCase();
  if (BLOCKED_PASSWORDS.includes(lower) || /^password\d*$/.test(lower)) {
    return "Lösenordet är för vanligt — välj något mer unikt";
  }

  if (/^\d+$/.test(pw)) return "Lösenordet får inte bara innehålla siffror";
  if (/(.)\1{3,}/.test(pw)) return "Undvik upprepade tecken (t.ex. \"aaaa\")";
  if (hasSequentialRun(pw)) return "Undvik enkla sekvenser (t.ex. \"1234\" eller \"abcd\")";

  return null;
}
