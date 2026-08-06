import disposableDomains from "disposable-email-domains";

const disposableSet = new Set(disposableDomains);

const TEST_WORD_PATTERN =
  /(test|asdf|qwerty|sample|dummy|foobar|admin|demo|example|placeholder|lorem|ipsum|temp|fake|junk|noreply|nobody|whatever|asdasd|zzz|aaa)/i;

export function isSuspiciousName(value: string): boolean {
  return TEST_WORD_PATTERN.test(value.trim());
}

export function isSuspiciousId(value: string): boolean {
  const isRepeating = /^(\d)\1+$/.test(value);
  const isSequential = /^(0123456789|1234567890|12345678)/.test(value);
  return isRepeating || isSequential;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposableSet.has(domain) : false;
}

export function validateSignupData(data: {
  fname: string;
  lname: string;
  id: string;
  email: string;
}): string | null {
  if (isSuspiciousName(data.fname)) return "Please enter your real first name";
  if (isSuspiciousName(data.lname)) return "Please enter your real last name";
  if (isSuspiciousId(data.id)) return "Please enter a valid student ID number";
  if (isDisposableEmail(data.email))
    return "Please use a real, non-disposable email address";
  return null;
}
