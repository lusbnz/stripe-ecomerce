"use client";

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";
import { ProductCard } from "./product-card";
import Stripe from "stripe";
import { useState } from "react";

interface Props {
  products: Stripe.Product[];
}

export function AISupportAgent({ products }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [matchedProducts, setMatchedProducts] = useState<Stripe.Product[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const term = input.toLowerCase();
    const result = products.filter((product) => {
      const color = product.metadata?.Color?.toLowerCase() || "";
      const category = product.metadata?.Category?.toLowerCase() || "";
      return color.includes(term) || category.includes(term);
    });

    if (result.length > 0) {
      setMatchedProducts(result);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Tôi tìm thấy ${result.length} sản phẩm phù hợp với "${input}".` },
      ]);
    } else {
      setMatchedProducts([]);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với "${input}".` },
      ]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg">
          <Bot className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl h-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg">AI Support Agent</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[720px]">
          <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 text-sm max-w-[80%] mb-2 ${
                  msg.role === "user" ? "ml-auto bg-blue-100" : "mr-auto bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {matchedProducts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {matchedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tìm sản phẩm theo màu hoặc loại (vd: Black, Key Caps)..."
              className="resize-none mb-2"
            />
            <Button onClick={handleSend} className="w-full">
              Gửi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
