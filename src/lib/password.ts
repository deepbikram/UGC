import crypto from "crypto";

/** Readable one-time password: no ambiguous characters, easy to read aloud. */
export function generatePassword(): string {
  const words = ["amber", "cedar", "harbor", "lantern", "meadow", "quartz", "summit", "willow", "atlas", "cobalt", "ember", "grove"];
  const w1 = words[crypto.randomInt(words.length)];
  const w2 = words[crypto.randomInt(words.length)];
  const n = String(crypto.randomInt(10, 100));
  return `${w1}-${w2}-${n}`;
}

export function isStrongEnough(password: string): boolean {
  return typeof password === "string" && password.trim().length >= 8;
}
