import { defineFunction } from '@aws-amplify/backend';

// Lambda関数の定義
export const invoiceApi = defineFunction({
  name: 'invoice-api',
  entry: './handler.ts',
  timeoutSeconds: 30,  // タイムアウトを30秒に設定
  memoryMB: 512       // メモリを512MBに設定
});