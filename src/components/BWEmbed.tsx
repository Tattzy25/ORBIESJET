import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Copy, Check } from "lucide-react";

interface BWEmbedProps {
  shaderId: number;
}

export const BWEmbed = ({ shaderId }: BWEmbedProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Main domain with localhost fallback for development
  const baseUrl = "https://musarty.com";
  // Fallback: const baseUrl = "http://localhost:5173";
  
  const embedCodes = [
    {
      title: "Long Embed Code", 
      code: `<iframe 
  src="${baseUrl}/shader1.html" 
  width="100%" 
  height="500" 
  frameborder="0" 
  style="background: transparent; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 500px; min-height: 400px;"
  allowfullscreen
  loading="lazy">
</iframe>`
    },
    {
      title: "Short Embed Code",
      code: `<iframe src="${baseUrl}/shader1.html" width="100%" height="400" frameborder="0" style="background: transparent; max-width: 500px;" loading="lazy"></iframe>`
    },
    {
      title: "URL Only",
      code: `${baseUrl}/BW-Radio-Widget`
    }
  ];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-[120px]">
      <h2 className="text-white text-2xl font-bold mb-8 text-center">Embed Code for Blue Wave</h2>
      <div className="grid grid-cols-1 gap-6">
        {embedCodes.map((embed, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg font-medium flex items-center justify-between">
                {embed.title}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(embed.code, index)}
                  className="ml-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={embed.code}
                readOnly
                className="bg-gray-800 border-gray-600 text-gray-200 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={embed.title === "Long Embed Code" ? 8 : embed.title === "URL Only" ? 2 : 3}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};