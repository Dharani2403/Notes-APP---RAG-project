import { useState, useEffect, useRef } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your RAG chatbot assistant. You can ask me questions about your uploaded documents or upload new documents for me to analyze.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (message: string) => {
    // Add user message immediately
    addMessage(message, true);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // The backend returns the result of run_llm_query directly
      // Handle both string responses and object responses with answer/response field
      let botResponse = '';
      if (typeof data === 'string') {
        botResponse = data;
      } else if (data.answer) {
        botResponse = data.answer;
      } else if (data.response) {
        botResponse = data.response;
      } else {
        botResponse = JSON.stringify(data);
      }
      
      addMessage(botResponse || 'Sorry, I couldn\'t process your request.', false);
    } catch (error) {
      console.error('Error sending message:', error);
      if (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError') {
        addMessage('Request timed out. Please try again with a shorter message.', false);
        toast.error('Request timed out');
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', false);
        toast.error('Failed to send message');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file upload
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns: {"status": "success", "message": "filename processed & embeddings updated"}
      if (data.status === 'success') {
        addMessage(data.message, false);
        toast.success('File uploaded and processed successfully');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError') {
        addMessage('File upload timed out. Please try again with a smaller file.', false);
        toast.error('Upload timed out');
      } else {
        addMessage('Sorry, I couldn\'t upload your file. Please try again.', false);
        toast.error('Failed to upload file');
      }
      throw error; // Re-throw to let ChatInput handle it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="border-b bg-background p-4">
        <h1 className="text-center">RAG Chatbot</h1>
        <p className="text-center text-muted-foreground">Ask questions or upload documents</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <Card className="p-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </div>
  );
}