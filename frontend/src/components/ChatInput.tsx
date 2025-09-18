import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export function ChatInput({
  onSendMessage,
  onFileUpload,
  isLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        await onFileUpload(selectedFile);
        setSelectedFile(null);
        // Reset the file input
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } catch (error) {
        toast.error("Failed to upload file");
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById(
      "file-input",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("file-input");
    fileInput?.click();
  };

  return (
    <div className="border-t bg-background p-4">
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between bg-muted p-2 rounded-md">
          <span className="text-sm truncate">
            {selectedFile.name}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleFileUpload}
              disabled={isLoading}
            >
              Upload
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeSelectedFile}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={triggerFileInput}
            disabled={isLoading}
          >
            <Paperclip className="size-4" />
          </Button>
          <Input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.md"
          />
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          size="icon"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}