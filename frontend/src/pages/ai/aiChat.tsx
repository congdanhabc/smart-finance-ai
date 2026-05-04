import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { useChatBot } from "@/hooks/query/ai";
import type { TransactionDraft } from "@/type/ai.type";
import { cn } from "@/lib/utils";
import DraftTransactionCard from "./DraftTransactionCard";
import type { AxiosError } from "axios";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  draft?: TransactionDraft | null;
  isSaved?: boolean; // Cờ đánh dấu draft đã được lưu vào DB chưa
};

export default function AiChatPage() {
  // 1. Quản lý trạng thái Chat
  const[input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      role: "bot", 
      text: "Xin chào! Tôi là Trợ lý Tài chính AI. Bạn có thể nhờ tôi ghi chép giao dịch (VD: 'Nay đổ xăng 50k'), hoặc hỏi đáp về tình hình chi tiêu tháng này nhé!" 
    }
  ]);
  
  const { mutateAsync: sendChat, isPending } = useChatBot();
  
  // Ref để auto-scroll xuống cuối
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cuộn mỗi khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  // 2. Xử lý gửi tin nhắn
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isPending) return;

    const userText = input.trim();
    setInput("");

    // Thêm tin nhắn của User vào màn hình
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: userText };

    const chatHistory = messages
      .filter(msg => msg.id !== "welcome")
      .slice(-6) // CHỈ LẤY 6 TIN NHẮN GẦN NHẤT
      .map(msg => ({
        role: msg.role === "bot" ? "model" : "user",
        text: msg.text
      }));

    setMessages((prev) =>[...prev, userMsg]);

    try {
      // Gọi API Gemini
      const res = await sendChat({ 
        message: userText,
        history: chatHistory 
      });
      
      
      // Thêm câu trả lời của Bot vào màn hình
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: res.message,
        draft: res.transaction_draft,
        isSaved: false,
      };
      setMessages((prev) => [...prev, botMsg]);
      
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const backendError = axiosError.response?.data?.detail;
      
      const errorText = typeof backendError === 'string' 
        ? backendError 
        : "Xin lỗi, hệ thống AI đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";

      const errorBotMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        text: errorText
      };

      setMessages((prev) => [...prev, errorBotMsg]);
    }
  };

  // 3. Xử lý khi User bấm "Lưu" trên Draft Card
  const handleDraftSaved = (messageId: string) => {
    setMessages((prev) => 
      prev.map(msg => msg.id === messageId ? { ...msg, isSaved: true } : msg)
    );
  };

  return (
    <div className="w-full h-[calc(100vh-180px)] flex flex-col bg-white dark:bg-[#1C1A2E] rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#F2F2F2] dark:border-[#2A3143] bg-white dark:bg-[#1C1A2E] shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#C8EE44]/20 flex items-center justify-center text-[#1B212D] dark:text-[#C8EE44]">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-[#1B212D] dark:text-white">SmartFinance AI</h2>
          <p className="text-[13px] font-medium text-emerald-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online - Sẵn sàng hỗ trợ
          </p>
        </div>
      </div>

      {/* KHU VỰC CHAT (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F8F9FB]/50 dark:bg-transparent">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 shrink-0 rounded-full flex items-center justify-center",
              msg.role === "user" ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "bg-[#C8EE44] text-[#1B212D]"
            )}>
              {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>

            {/* Khung tin nhắn */}
            <div className="flex flex-col gap-2 min-w-0">
              <div className={cn(
                "px-5 py-3.5 rounded-[18px] text-[15px] leading-relaxed whitespace-pre-wrap",
                msg.role === "user" 
                  ? "bg-[#1B212D] text-white dark:bg-white dark:text-[#1B212D] rounded-tr-sm" 
                  : "bg-white dark:bg-[#2A3143] text-[#1B212D] dark:text-white border border-[#F2F2F2] dark:border-[#2A3143] shadow-sm rounded-tl-sm"
              )}>
                {msg.text}
              </div>

              {msg.draft && msg.role === "bot" && (
                <div className="mt-2">
                  <DraftTransactionCard 
                    draft={msg.draft} 
                    isSaved={msg.isSaved || false}
                    onSave={() => handleDraftSaved(msg.id)} 
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator (Hiển thị khi đang chờ API) */}
        {isPending && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#C8EE44] text-[#1B212D] flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="px-5 py-4 rounded-[18px] rounded-tl-sm bg-white dark:bg-[#2A3143] border border-[#F2F2F2] dark:border-[#2A3143] shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#929EAE] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#929EAE] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#929EAE] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        {/* Div ẩn để cuộn tới đây */}
        <div ref={messagesEndRef} />
      </div>

      {/* KHU VỰC NHẬP TEXT */}
      <div className="p-4 bg-white dark:bg-[#1C1A2E] border-t border-[#F2F2F2] dark:border-[#2A3143] shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isPending}
            placeholder="Nhập yêu cầu của bạn..."
            className="w-full h-14 pl-5 pr-14 rounded-full border border-[#F2F2F2] dark:border-[#2A3143] bg-[#F8F9FB] dark:bg-[#2A3143]/50 text-[#1B212D] dark:text-white placeholder:text-[#929EAE] focus:outline-none focus:border-[#C8EE44] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] disabled:opacity-50 disabled:hover:bg-[#C8EE44] transition-colors"
          >
            <Send size={18} className={isPending ? "opacity-50" : ""} />
          </button>
        </form>
        <p className="text-center text-[12px] text-[#929EAE] mt-3">
          AI có thể mắc sai lầm. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận lưu.
        </p>
      </div>

    </div>
  );
}