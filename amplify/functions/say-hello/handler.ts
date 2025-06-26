import type { Schema } from "../../data/resource";

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
  // 引数から名前を取得
  const { name } = event.arguments;

  // レスポンスを返す
  return `Hello, ${name}!`;
};
