"use client"

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Send, Upload } from 'lucide-react';
import { getAIResponse } from './services/ai';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  file?: {
    name: string;
    url: string;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '你好！我是你的聊天助手。', sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessages(prev => [...prev, {
        id: messages.length + 1,
        text: '文件太大，请上传5MB以下的文件。',
        sender: 'bot'
      }]);
      return;
    }

    const loadingMessage: Message = {
      id: messages.length + 1,
      text: `正在上传文件：${file.name}...`,
      sender: 'bot'
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessages(prev => prev.slice(0, -1));
      
      const fileMessage: Message = {
        id: messages.length + 1,
        text: `已上传文件：${file.name}`,
        sender: 'user',
        file: {
          name: file.name,
          url: data.url
        }
      };

      setMessages(prev => [...prev, fileMessage]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => prev.slice(0, -1).concat({
        id: messages.length + 1,
        text: `文件上传失败：${error instanceof Error ? error.message : '未知错误'}`,
        sender: 'bot'
      }));
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      const loadingMessage: Message = {
        id: messages.length + 2,
        text: '正在思考...',
        sender: 'bot'
      };
      setMessages(prev => [...prev, loadingMessage]);

      const aiResponse = await getAIResponse(messages.concat(userMessage));
      
      setMessages(prev => prev.slice(0, -1).concat({
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot'
      }));
    } catch (error) {
      setMessages(prev => prev.slice(0, -1).concat({
        id: messages.length + 2,
        text: '抱歉，出现了错误。请稍后重试。',
        sender: 'bot'
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-96 h-[600px] flex flex-col">
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div 
                className={`p-2 rounded-lg max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-foreground text-background' 
                    : 'bg-foreground/10 text-foreground'
                }`}
              >
                {message.text}
                {message.file && (
                  <div className="mt-2">
                    <a 
                      href={message.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      {message.file.name}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="p-4 border-t border-foreground/10">
          <div className="flex w-full space-x-2">
            <Input 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的消息..."
              className="flex-grow"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
              max-size="5242880"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              size="icon"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage} 
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
