'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Swagger UIを動的にインポート（SSRを無効化）
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

// Swagger仕様の型定義
interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{
    url: string;
    description: string;
    variables?: {
      [key: string]: {
        default: string;
        description: string;
      };
    };
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

/**
 * API Gateway URLを構築する
 */
function buildApiUrl(apiId: string, region: string, stage: string) {
  return `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;
}

/**
 * Swagger UI ページコンポーネント
 * APIエンドポイントを動的に設定してSwagger UIを表示
 */
export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);

  useEffect(() => {
    const loadSwaggerSpec = async () => {
      try {
        const response = await fetch('/swagger.json');
        const spec: SwaggerSpec = await response.json();

        // 環境変数から値を取得
        const apiId = process.env.NEXT_PUBLIC_API_ID;
        const region = process.env.NEXT_PUBLIC_API_REGION || 'ap-northeast-1';
        const stage = process.env.NEXT_PUBLIC_API_STAGE || 'prod';

        if (apiId) {
          // APIのURLを設定
          const apiUrl = buildApiUrl(apiId, region, stage);
          spec.servers[0].url = apiUrl;
          spec.servers[0].variables = {
            'restapi-id': {
              default: apiId,
              description: 'API Gateway ID'
            },
            'region': {
              default: region,
              description: 'AWS Region'
            },
            'stage': {
              default: stage,
              description: 'API Stage'
            }
          };
        }

        setSwaggerSpec(spec);
      } catch (error) {
        console.error('Failed to load Swagger spec:', error);
      }
    };

    loadSwaggerSpec();
  }, []);

  if (!swaggerSpec) {
    return <div className="p-4">Loading API documentation...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Invoice Management API Documentation
        </h1>
        <p className="text-gray-600">
          AWS Lambda + DynamoDB を使用した請求書管理 REST API のドキュメント
        </p>
        {process.env.NEXT_PUBLIC_API_ID && (
          <p className="text-sm text-gray-500 mt-2">
            API URL: {buildApiUrl(
              process.env.NEXT_PUBLIC_API_ID,
              process.env.NEXT_PUBLIC_API_REGION || 'ap-northeast-1',
              process.env.NEXT_PUBLIC_API_STAGE || 'prod'
            )}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <SwaggerUI 
          spec={swaggerSpec}
          deepLinking={true}
          displayOperationId={false}
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          docExpansion="list"
          filter={true}
        />
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">使用方法</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium text-gray-900">1. API のテスト</h3>
            <p>上記のSwagger UIから直接APIをテストできます。「Try it out」ボタンをクリックして、実際のリクエストを送信してみてください。</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">2. 認証</h3>
            <p>このAPIはAPI Gatewayを介してLambda関数にアクセスします。</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">3. データ形式</h3>
            <p>全てのリクエスト/レスポンスはJSON形式です。日付は「YYYY-MM-DD」形式で指定してください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}