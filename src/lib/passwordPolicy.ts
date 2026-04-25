const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "qwerty123",
  "admin123",
  "welcome1",
  "letmein1",
  "scalpsense",
]);

const hasSequentialRun = (value: string) => {
  const normalized = value.toLowerCase();
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return sequences.some((sequence) => {
    for (let index = 0; index <= sequence.length - 4; index += 1) {
      const run = sequence.slice(index, index + 4);
      if (normalized.includes(run) || normalized.includes(run.split("").reverse().join(""))) return true;
    }
    return false;
  });
};

export const getPasswordError = (password: string, blockedTerms: string[] = []) => {
  const trimmedPassword = password.trim();
  if (password !== trimmedPassword) return "Password cannot start or end with spaces.";
  if (trimmedPassword.length < 8) return "Password must be at least 8 characters long.";
  if (trimmedPassword.length > 72) return "Password must be 72 characters or fewer.";
  if (!/[a-z]/.test(trimmedPassword)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(trimmedPassword)) return "Add at least one uppercase letter.";
  if (!/\d/.test(trimmedPassword)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(trimmedPassword)) return "Add at least one special character.";
  if (/(.)\1\1/.test(trimmedPassword)) return "Avoid repeating the same character three times in a row.";
  if (hasSequentialRun(trimmedPassword)) return "Avoid obvious sequences like abcd, 1234, or qwerty.";
  if (COMMON_PASSWORDS.has(trimmedPassword.toLowerCase())) return "Choose a less common password.";
  if (blockedTerms.some((term) => term && term.length >= 3 && trimmedPassword.toLowerCase().includes(term.toLowerCase()))) {
    return "Password cannot include your name or email.";
  }
  return null;
};

export const PASSWORD_HELP_TEXT =
  "Use 8+ characters with uppercase, lowercase, number, special character, and no common words or sequences.";