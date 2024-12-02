import { NextResponse } from 'next/server';

const API_KEY = process.env.SILICONFLOW_API_KEY;
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V2.5",
      messages: body.messages
    })
  });

  const data = await response.json();
  return NextResponse.json(data);
} 