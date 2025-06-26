"use client";

import { useEffect, useState } from 'react';
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import outputs from "@/amplify_outputs.json";

// Amplifyの設定
Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function TestLambdaPage() {
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    // Lambda関数の呼び出し
    client.queries.sayHello({
      name: "Amplify"
    })
    .then(response => {
      setResult(JSON.stringify(response, null, 2));
    })
    .catch(err => {
      console.error('Error:', err);
      setResult('Error: ' + err.message);
    });
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Lambda Function Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {result || 'Loading...'}
      </pre>
    </main>
  );
}