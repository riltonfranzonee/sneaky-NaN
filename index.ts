import binstruct from "binstruct";

const conceal = (message: string): number => {
  const bufferedMessage = Buffer.from(message, "utf-8");
  if (bufferedMessage.length > 6) throw Error("Message can contain at most 6 bytes");

  // Set sign and exponent bits https://en.wikipedia.org/wiki/Double-precision_floating-point_format
  let ieeeNum: bigint = 0b011111111111n << 52n;

  bufferedMessage.forEach((byte, idx) => {
    ieeeNum = ieeeNum | (BigInt(byte) << BigInt(idx * 8));
  });

  const ieeeBytes = Buffer.from(
    ieeeNum
      .toString(2)
      .padStart(64, "0")
      .match(/.{1,8}/g)
      ?.map((byte) => parseInt(byte, 2))!
  );

  const unpackedNum = binstruct.def().double().read(ieeeBytes)[0];

  return unpackedNum;
};

const extract = (num: number): string => {
  const floatArray = new Float64Array([num]);
  let bytes = new Uint8Array(floatArray.buffer);
  const messageBytes = [...bytes.slice(0, 6).filter((b) => b !== 0)];
  return Buffer.from(messageBytes).toString("utf-8");
};

const encodedNum = conceal("hello!");
const decodedMessage = extract(encodedNum);

console.log({ encodedNum });
console.log({ decodedMessage });
