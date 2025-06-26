import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { invoiceApi } from "../functions/invoice-api/resource";

const schema = a.schema({
  // 請求書管理のREST API
  invoices: a
    .query()
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(invoiceApi)),

  // 請求書データモデル
  Invoices: a
    .model({
      InvoiceID: a.id().required(),      // 請求書ID（主キー）
      BillNo: a.string().required(),     // 請求書番号
      SlipNo: a.string().required(),     // 伝票番号
      CustomerID: a.string().required(), // 顧客ID
      CustomerName: a.string().required(), // 顧客名
      Products: a.string().required(),   // 商品情報（JSON文字列として格納）
      Number: a.integer().required(),    // 数量
      UnitPrice: a.float().required(),   // 単価
      Date: a.string().required(),       // 日付
    })
    .identifier(["InvoiceID"])          // 主キーの指定
    .authorization((allow) => [allow.publicApiKey()]), // API Key認証を許可
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
