import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// DynamoDB クライアントの初期化
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// DynamoDBテーブル名
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || '';

// CORS ヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Lambda関数のハンドラー
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // テーブル名の確認
    if (!TABLE_NAME) {
      throw new Error('DYNAMODB_TABLE_NAME environment variable is not set');
    }

    // メソッドとパスに応じた処理を実行
    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters?.id) {
          return await getInvoice(event.pathParameters.id);
        }
        return await listInvoices();

      case 'POST':
        return await createInvoice(JSON.parse(event.body || '{}'));

      case 'PUT':
        if (!event.pathParameters?.id) {
          throw new Error('Invoice ID is required for update');
        }
        return await updateInvoice(event.pathParameters.id, JSON.parse(event.body || '{}'));

      case 'DELETE':
        if (!event.pathParameters?.id) {
          throw new Error('Invoice ID is required for deletion');
        }
        return await deleteInvoice(event.pathParameters.id);

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
};

// 請求書一覧を取得
async function listInvoices(): Promise<APIGatewayProxyResult> {
  const command = new ScanCommand({
    TableName: TABLE_NAME
  });

  const result = await docClient.send(command);
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      items: result.Items || [],
      count: result.Count || 0
    })
  };
}

// 単一の請求書を取得
async function getInvoice(invoiceId: string): Promise<APIGatewayProxyResult> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { InvoiceID: invoiceId }
  });

  const result = await docClient.send(command);
  if (!result.Item) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invoice not found' })
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(result.Item)
  };
}

// 新しい請求書を作成
async function createInvoice(invoice: any): Promise<APIGatewayProxyResult> {
  const invoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newInvoice = {
    InvoiceID: invoiceId,
    ...invoice
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: newInvoice
  });

  await docClient.send(command);
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify(newInvoice)
  };
}

// 請求書を更新
async function updateInvoice(invoiceId: string, updates: any): Promise<APIGatewayProxyResult> {
  const { InvoiceID, ...updateData } = updates;
  
  // 更新式の構築
  const updateExpressions: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  Object.entries(updateData).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[`#${key}`] = key;
  });

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { InvoiceID: invoiceId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(command);
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(result.Attributes)
  };
}

// 請求書を削除
async function deleteInvoice(invoiceId: string): Promise<APIGatewayProxyResult> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { InvoiceID: invoiceId },
    ReturnValues: 'ALL_OLD'
  });

  const result = await docClient.send(command);
  if (!result.Attributes) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invoice not found' })
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      message: 'Invoice deleted successfully',
      deletedInvoice: result.Attributes
    })
  };
}