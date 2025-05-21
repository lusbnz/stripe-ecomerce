"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2 } from "lucide-react";
import { ProductCard } from "./product-card";
import { useState, useEffect } from "react";
import { Product } from "@/app/admin/products/page";
import Fuse from "fuse.js";

interface Props {
  products: Product[];
}

export function AISupportAgent({ products }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "ai", content: "Chào bạn! Tôi có thể giúp tìm sản phẩm theo màu sắc, loại, giá, hoặc thương hiệu. Ví dụ: 'mũ đỏ giá dưới 500k'." },
  ]);
  const [input, setInput] = useState("");
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo Fuse.js cho fuzzy search
  const fuse = new Fuse(products, {
    keys: ["color", "category", "name"],
    threshold: 0.3,
    includeScore: true,
  });

  const parseQuery = (query: string) => {
    const cleanedQuery = query
      .replace(/tôi muốn mua|tôi muốn tìm|mua|tìm|sản phẩm|product/gi, "")
      .trim()
      .toLowerCase();

    const priceUnderMatch = cleanedQuery.match(/giá dưới\s*(\d+)/);
    const priceRangeMatch = cleanedQuery.match(/giá từ\s*(\d+)\s*(?:đến|-)\s*(\d+)/);
    const categoryMatch = cleanedQuery.match(/danh mục\s*([\w\s]+)/);
    const colorMatch = cleanedQuery.match(/màu\s*([\w\s]+)/);

    return {
      keywords: cleanedQuery.split(/\s+/).filter((kw) => kw),
      minPrice: priceRangeMatch ? parseInt(priceRangeMatch[1]) : 0,
      maxPrice: priceUnderMatch
        ? parseInt(priceUnderMatch[1])
        : priceRangeMatch
        ? parseInt(priceRangeMatch[2])
        : Infinity,
      category: categoryMatch ? categoryMatch[1].trim() : "",
      color: colorMatch ? colorMatch[1].trim() : "",
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Phân tích truy vấn
    const { keywords, minPrice, maxPrice, category, color } = parseQuery(input);

    // Tìm kiếm với Fuse.js
    let results = fuse.search(keywords.join(" ")).map((result) => result.item);

    // Lọc theo các tiêu chí bổ sung
    results = results.filter((product) => {
      const productPrice = parseInt(product.pricing?.toString() || "0");
      const productCategory = product.category_name?.toLowerCase() || "";
      const productColor = product.color?.toLowerCase() || "";

      const priceMatch = productPrice >= minPrice && productPrice <= maxPrice;
      const categoryMatch = category ? productCategory.includes(category) : true;
      const colorMatch = color ? productColor.includes(color) : true;

      return priceMatch && categoryMatch && colorMatch;
    });

    // Xử lý kết quả
    if (results.length > 0) {
      setMatchedProducts(results.slice(0, 6)); // Giới hạn tối đa 6 sản phẩm
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Tôi tìm thấy ${results.length} sản phẩm phù hợp với yêu cầu của bạn.`,
        },
      ]);
    } else {
      // Gợi ý sản phẩm tương tự
      const fallback = products
        .filter((p) => {
          const price = parseInt(p.pricing?.toString() || "0");
          return price >= minPrice && price <= maxPrice;
        })
        .slice(0, 3);

      setMatchedProducts(fallback);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Không tìm thấy sản phẩm khớp chính xác. Dưới đây là một số gợi ý dựa trên yêu cầu của bạn:`,
        },
      ]);
    }

    setIsLoading(false);
  };

  // Xử lý phím Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Tự động cuộn xuống cuối danh sách tin nhắn
  useEffect(() => {
    const scrollArea = document.querySelector(".scroll-area");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages, matchedProducts]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg cursor-pointer">
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
          <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto scroll-area">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 text-sm max-w-[80%] mb-2 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-100"
                    : "mr-auto bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {matchedProducts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {matchedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm sản phẩm theo màu, loại, giá, hoặc thương hiệu (vd: mũ đỏ giá dưới 500k, thương hiệu Nike)..."
              className="resize-none mb-2"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}