
import React, { useState, useEffect, forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Send, MessageSquare } from 'lucide-react';
import { WeatherType } from '../types';

interface WhatsAppToolsProps {
  currentWeather: WeatherType;
}

const WhatsAppTools = forwardRef<HTMLDivElement, WhatsAppToolsProps>(({ currentWeather }, ref) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      const cleanNum = phoneNumber.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(message);
      setGeneratedLink(`https://wa.me/${cleanNum}${message ? `?text=${encodedMsg}` : ''}`);
    } else {
      setGeneratedLink('');
    }
  }, [phoneNumber, message]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  return (
    <div 
      ref={ref}
      className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700 relative z-30"
    >
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">WhatsApp Link</h2>
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Instant Connection</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 block ml-1">Phone Number</label>
            <input
              type="tel"
              placeholder="Country code + number"
              className="w-full bg-black/30 border border-white/5 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10 text-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 block ml-1">Message (Optional)</label>
            <textarea
              rows={4}
              placeholder="What would you like to say?"
              className="w-full bg-black/30 border border-white/5 text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10 resize-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative group p-2 bg-white/5 rounded-[2rem] border border-white/10">
            <div className="relative bg-white p-5 rounded-2xl shadow-inner overflow-hidden">
              {generatedLink ? (
                <QRCodeSVG 
                  value={generatedLink} 
                  size={140} 
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-[140px] h-[140px] flex items-center justify-center bg-gray-50 rounded-lg">
                   <MessageSquare className="w-8 h-8 text-gray-200" />
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full space-y-3">
            {generatedLink ? (
              <>
                <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-2xl transition-all hover:bg-gray-100 active:scale-[0.98] shadow-lg text-xs uppercase tracking-wider"
                  >
                    {showCopyFeedback ? 'Link Copied' : <><Copy className="w-4 h-4" /> Copy Link</>}
                </button>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-green-900/20 text-xs uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" /> Open WhatsApp
                </a>
              </>
            ) : (
              <p className="text-center text-white/20 text-[10px] uppercase font-bold tracking-widest">Waiting for input...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WhatsAppTools;
