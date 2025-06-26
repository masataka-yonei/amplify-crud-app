import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Lambda関数へのリクエストを中継するプロキシハンドラー
 * /api/invoicesへのリクエストをLambda関数にフォワードします
 */
export async function GET(request: NextRequest) {
  try {
    // Lambda関数のURLを環境変数から取得
    const apiUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!apiUrl) {
      throw new Error('Lambda function URL is not configured');
    }

    const response = await fetch(`${apiUrl}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!apiUrl) {
      throw new Error('Lambda function URL is not configured');
    }

    const body = await request.json();
    const response = await fetch(`${apiUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying request to Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}