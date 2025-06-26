import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { invoiceApi } from './functions/invoice-api/resource';

/**
 * バックエンドの定義
 */
const backend = defineBackend({
  auth,
  data,
  invoiceApi
});

// DynamoDBテーブル名を環境変数として設定
const invoicesTable = backend.data.resources.tables["Invoices"];
backend.invoiceApi.addEnvironment(
  'DYNAMODB_TABLE_NAME',
  invoicesTable.tableName
);

// Function URLとテーブル情報をカスタム出力として設定
backend.addOutput({
  custom: {
    invoice: {
      config: {
        tableName: invoicesTable.tableName
      }
    }
  }
});

export default backend;