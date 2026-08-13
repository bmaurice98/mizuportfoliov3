import { Filter } from "bad-words";

const profanity = new Filter();
const NAME_PATTERN = /^[a-zA-Z0-9 _'-]{2,20}$/;

export function validateName(name: string): string | null {
  if (!NAME_PATTERN.test(name)) {
    return "Name must be 2-20 characters (letters, numbers, spaces, - or _ only).";
  }
  if (profanity.isProfane(name)) {
    return "Please choose a different name.";
  }
  return null;
}
