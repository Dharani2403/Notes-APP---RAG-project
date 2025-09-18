import { ChatInterface } from './components/ChatInterface';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="size-full bg-background">
      <ChatInterface />
      <Toaster />
    </div>
  );
}