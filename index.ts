import binstruct from "binstruct";

const conceal = (message: string): number => {
  const bufferedMessage = Buffer.from(message, "utf-8");
  if (bufferedMessage.length > 6) throw Error("Message can contain at most 6 bytes");

  const signBit = "0";
  const exponentBits = "1".repeat(11);

  let num = signBit + exponentBits;

  let significand = "";
  bufferedMessage.forEach((byte) => {
    significand += byte.toString(2).padStart(8, "0");
  });

  num += significand.padStart(52, "0");

  const ieeeBytes = Buffer.from(num.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2)) || []);

  const unpackedNum = binstruct.def().double().read(ieeeBytes)[0];

  return unpackedNum;
};

const extract = (num: number): string => {
  const floatArray = new Float64Array([num]);
  let bytes = new Uint8Array(floatArray.buffer);
  const messageBytes = [
    ...bytes
      .slice(0, 6)
      .reverse()
      .filter((b) => b !== 0),
  ];

  return Buffer.from(messageBytes).toString("utf-8");
};

const num = conceal("hi!");
const decoded = extract(num);

console.log({ num });
console.log({ decoded });
