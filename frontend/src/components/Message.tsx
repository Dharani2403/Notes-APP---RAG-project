import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";
import { User, Bot } from "lucide-react";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export function Message({ content, isUser, timestamp }: MessageProps) {
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="size-8 mt-1">
          <AvatarFallback>
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <p className="whitespace-pre-wrap">{content}</p>
        </Card>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {isUser && (
        <Avatar className="size-8 mt-1">
          <AvatarFallback>
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}