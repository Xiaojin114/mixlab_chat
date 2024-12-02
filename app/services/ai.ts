import { Message } from '@/types';

export async function getAIResponse(messages: Message[]) {
  const messageHistory = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messageHistory
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
} 
