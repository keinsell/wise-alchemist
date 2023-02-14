import Keyv from "keyv";

const kv = new Keyv();

export async function setWorking() {
  await kv.set("is-working", true);
}

export async function setNotWorking() {
  await kv.set("is-working", false);
}

export async function isWorking() {
  return await kv.get("is-working");
}

export { kv };
