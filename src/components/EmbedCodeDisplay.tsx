import React, { useState } from "react";
import { Copy } from "lucide-react";

export const EmbedCodeDisplay: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [previewShader, setPreviewShader] = useState<number | null>(null);

  const baseUrl = "https://orbiejet-tattzy.vercel.app";
  
  const embedCodes = [
    {
      id: 1,
      title: "Shader 1",
      code: `<iframe src="${baseUrl}/shader1.html" width="400" height="400" frameborder="0" style="background:transparent;" allowtransparency="true"></iframe>`
    },
    {
      id: 2,
      title: "Shader 2", 
      code: `<iframe src="${baseUrl}/shader2.html" width="400" height="400" frameborder="0" style="background:transparent;" allowtransparency="true"></iframe>`
    },
    {
      id: 3,
      title: "Shader 3",
      code: `<iframe src="${baseUrl}/shader3.html" width="400" height="400" frameborder="0" style="background:transparent;" allowtransparency="true"></iframe>`
    },
    {
      id: 4,
      title: "Shader 4",
      code: `<iframe src="${baseUrl}/shader4.html" width="400" height="400" frameborder="0" style="background:transparent;" allowtransparency="true"></iframe>`
    }
  ];

  const copyToClipboard = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(`shader-${id}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 p-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-lg">
      <h2 className="text-white text-xl font-bold mb-6 text-center">Embed Codes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {embedCodes.map((embed) => (
          <div key={embed.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">{embed.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewShader(previewShader === embed.id ? null : embed.id)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition-colors"
                >
                  {previewShader === embed.id ? 'Hide' : 'Preview'}
                </button>
                <button
                  onClick={() => copyToClipboard(embed.code, embed.id)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition-colors flex items-center gap-1"
                >
                  {copiedCode === `shader-${embed.id}` ? (
                    <span className="text-green-400">✓ Copied</span>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <textarea
              value={embed.code}
              readOnly
              rows={3}
              className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono resize-none"
              placeholder="Embed code will appear here..."
            />

            {/* Live Preview */}
            {previewShader === embed.id && (
              <div className="mt-4 p-4 bg-black/40 border border-white/20 rounded">
                <p className="text-white/60 text-sm mb-2">Live Preview:</p>
                <div className="flex justify-center">
                  <iframe
                    src={`${baseUrl}/shader${embed.id}.html`}
                    width="200"
                    height="200"
                    frameBorder="0"
                    style={{ background: 'transparent' }}
                    allowTransparency={true}
                    className="border border-white/20 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded">
        <h4 className="text-white font-medium mb-2">Usage Instructions:</h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Copy any embed code above</li>
          <li>• Paste it into your website's HTML</li>
          <li>• Adjust width/height as needed</li>
          <li>• Each shader has transparent background</li>
          <li>• Perfect for multiple embeds on same page</li>
        </ul>
      </div>
    </div>
  );
};