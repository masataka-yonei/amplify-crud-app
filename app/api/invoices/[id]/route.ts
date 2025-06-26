import { NextRequest, NextResponse } from 'next/server';

/**
 * 個別のInvoiceに対する操作をLambda関数に中継するプロキシハンドラー
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!apiUrl) {
      throw new Error('Lambda function URL is not configured');
    }

    const response = await fetch(`${apiUrl}/invoices/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying request to Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!apiUrl) {
      throw new Error('Lambda function URL is not configured');
    }

    const body = await request.json();
    const response = await fetch(`${apiUrl}/invoices/${params.id}`, {
      method: 'PUT',
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
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!apiUrl) {
      throw new Error('Lambda function URL is not configured');
    }

    const response = await fetch(`${apiUrl}/invoices/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying request to Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}