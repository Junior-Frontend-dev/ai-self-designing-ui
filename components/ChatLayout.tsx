import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig, Message, Channel } from '../types';

interface ChatLayoutProps {
  channels: Channel[];
  activeChannelId: string;
  onSwitchChannel: (id: string) => void;
  
  theme: ThemeConfig;
  messages: Message[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  loadingStatus: string | null;
  backgroundAction: string | null; // New prop for non-blocking notifications
  isStreaming: boolean;
  onThemeUpdate: (newTheme: ThemeConfig) => void;
}

const HeadInjector: React.FC<{ html?: string }> = ({ html }) => {
    useEffect(() => {
        if (!html) return;
        const div = document.createElement('div');
        div.innerHTML = html;
        const addedNodes: Node[] = [];
        Array.from(div.children).forEach(child => {
            const node = child.cloneNode(true);
            document.head.appendChild(node);
            addedNodes.push(node);
        });
        return () => {
            addedNodes.forEach(node => {
                if (document.head.contains(node)) {
                    document.head.removeChild(node);
                }
            });
        };
    }, [html]);
    return null;
};

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  channels,
  activeChannelId,
  onSwitchChannel,
  theme,
  messages,
  inputValue,
  onInputChange,
  onSend,
  loadingStatus,
  backgroundAction,
  isStreaming,
  onThemeUpdate
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCode, setShowCode] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingStatus, isStreaming, activeChannelId]);

  useEffect(() => {
    if (showCode) {
        setCodeValue(JSON.stringify(theme, null, 2));
    }
  }, [theme, showCode, activeChannelId]);

  useEffect(() => {
    if (theme.customJS) {
        try {
            const timer = setTimeout(() => {
                try {
                    // eslint-disable-next-line no-new-func
                    new Function(theme.customJS!)();
                } catch (err) {
                    console.error("Custom JS Execution Error:", err);
                }
            }, 100);
            return () => clearTimeout(timer);
        } catch (e) {
            console.error("Custom JS Parse Error:", e);
        }
    }
  }, [theme.customJS, activeChannelId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSaveCode = () => {
    try {
      const parsed = JSON.parse(codeValue);
      onThemeUpdate(parsed);
      setCodeError(null);
    } catch (e) {
      setCodeError((e as Error).message);
    }
  };

  const isThinking = !!loadingStatus;
  const disableInput = isThinking || isStreaming;

  const renderAppContent = () => (
    <div className={`${theme.appContainer} ${showCode ? 'h-full w-full' : ''}`}>
        
        {/* SIDEBAR */}
        <div className={theme.sidebarContainer}>
            {theme.sidebarHeader && <div className={theme.sidebarHeader}>AI Agents</div>}
            <div className={theme.sidebarList}>
                {channels.map(channel => (
                    <div
                        key={channel.id}
                        onClick={() => !disableInput && onSwitchChannel(channel.id)}
                        className={channel.id === activeChannelId ? theme.sidebarItemActive : theme.sidebarItem}
                    >
                        {channel.name}
                    </div>
                ))}
            </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
            {/* Header */}
            <div className={theme.header}>
            <div className="flex flex-col flex-1 min-w-0">
                <h1 className={theme.headerTitle}>{theme.name}</h1>
                <span className="text-[10px] opacity-50 truncate max-w-[300px]">{theme.aiInstructions?.slice(0, 80)}...</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        if (!showCode) setCodeValue(JSON.stringify(theme, null, 2));
                        setShowCode(!showCode);
                    }}
                    className="opacity-60 hover:opacity-100 transition-opacity p-2"
                    title="Toggle Code Editor"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </button>
            </div>
            </div>

            <div 
                className={theme.chatContainer}
                style={{
                    backgroundImage: theme.backgroundImage && theme.backgroundImage !== 'none' ? theme.backgroundImage : undefined,
                    backgroundSize: theme.backgroundSize || 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {theme.backgroundImage && theme.backgroundImage !== 'none' && (
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                )}
                
                {/* 1. Main Blocking Loading Indicator (Coding Phase) */}
                {loadingStatus && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white animate-fadeIn">
                        <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-gray-700 min-w-[300px]">
                            {/* Render AI-Generated Custom Spinner */}
                            <div className="mb-4" dangerouslySetInnerHTML={{ __html: theme.loadingSpinner || '' }} />
                            
                            <h3 className="text-xl font-bold mb-1">DESIGNMASTER-X9000</h3>
                            <p className={theme.loadingText || "text-sm text-gray-400"}>
                                {loadingStatus}
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. Non-Blocking Notification Toast (Image Gen Phase) */}
                {backgroundAction && !loadingStatus && (
                     <div className="absolute top-4 right-4 z-40 animate-slideInRight">
                        <div className="bg-gray-900/90 text-white px-4 py-3 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-3 backdrop-blur-md">
                             <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                             <span className="text-sm font-medium">{backgroundAction}</span>
                        </div>
                     </div>
                )}

                <div className={theme.messageList}>
                {messages.map((msg) => (
                    <div
                    key={msg.id}
                    className={msg.role === 'user' ? theme.messageRowUser : theme.messageRowAI}
                    >
                    <div
                        className={
                        msg.role === 'user' ? theme.messageBubbleUser : theme.messageBubbleAI
                        }
                    >
                        {msg.text}
                    </div>
                    </div>
                ))}
                
                {isThinking && (
                    <div className={`${theme.messageRowAI} opacity-0`}> 
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>

                <div className={theme.inputContainer}>
                <div className={theme.inputWrapper}>
                    <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={theme.inputField}
                    placeholder={disableInput ? "Waiting for architect..." : `Message ${theme.name}...`}
                    disabled={disableInput}
                    autoFocus
                    />
                    <button
                    onClick={onSend}
                    disabled={disableInput || !inputValue.trim()}
                    className={theme.sendButton}
                    title="Send Message"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <HeadInjector html={theme.headHtml} />
      
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}

      {showCode ? (
        <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-white">
            <div className="flex-1 relative overflow-hidden">
                {renderAppContent()}
            </div>
            {/* Dynamic Code Editor Panel */}
            <div className={theme.codeContainer}>
                <div className={theme.codeHeader}>
                    <span className={theme.codeTitle}>
                        {theme.name} Config
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSaveCode}
                            className={theme.codeButtonApply}
                        >
                            Apply
                        </button>
                        <button onClick={() => setShowCode(false)} className={theme.codeButtonClose}>✕</button>
                    </div>
                </div>
                <div className="flex-1 relative">
                     <textarea
                        className={theme.codeEditor}
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                {codeError && (
                    <div className="bg-red-900/50 text-red-200 text-xs p-2 border-t border-red-800">
                        {codeError}
                    </div>
                )}
            </div>
        </div>
      ) : (
        renderAppContent()
      )}
    </>
  );
};