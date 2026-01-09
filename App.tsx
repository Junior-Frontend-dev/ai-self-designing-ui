import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatLayout } from './components/ChatLayout';
import { INITIAL_CHANNELS } from './constants';
import { ThemeConfig, Message, Channel } from './types';
import { generateAppDesign, generateImageService } from './services/gemini';

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>(INITIAL_CHANNELS[0].id);
  const [inputValue, setInputValue] = useState('');
  
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [backgroundAction, setBackgroundAction] = useState<string | null>(null); // For non-blocking notifications
  const [isStreaming, setIsStreaming] = useState(false);
  
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  const handleSwitchChannel = (id: string) => {
    if (loadingStatus || isStreaming) return;
    setActiveChannelId(id);
    setInputValue('');
  };

  const handleSend = async () => {
    if (!inputValue.trim() || loadingStatus || isStreaming) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setChannels(prev => prev.map(ch => 
        ch.id === activeChannelId 
        ? { ...ch, messages: [...ch.messages, userMsg] }
        : ch
    ));

    setInputValue('');
    setLoadingStatus("Connecting to Neural Core...");

    try {
      const history = [...activeChannel.messages, userMsg];
      
      // 1. Generate Design (Coding Phase)
      const response = await generateAppDesign(
          history, 
          activeChannel.theme, 
          userMsg.text,
          (status) => setLoadingStatus(status)
      );

      // 2. Apply Theme IMMEDIATELY
      setChannels(prev => prev.map(ch => {
        if (ch.id === activeChannelId) {
            return {
                ...ch,
                theme: response.theme,
                name: response.theme.name
            };
        }
        return ch;
      }));

      // 3. Clear Blocking Loading State
      setLoadingStatus(null);
      setIsStreaming(true);

      // 4. Handle Image Generation in Background (Multi-threaded style)
      if (response.theme.imageGenerationPrompt) {
          setBackgroundAction("🎨 Painting high-res background...");
          
          // DO NOT AWAIT - run in background
          generateImageService(process.env.API_KEY || '', response.theme.imageGenerationPrompt)
            .then((imageUrl) => {
                if (imageUrl) {
                    setChannels(prev => prev.map(ch => {
                        if (ch.id === activeChannelId) {
                            return {
                                ...ch,
                                theme: {
                                    ...ch.theme,
                                    backgroundImage: `url('${imageUrl}')`
                                }
                            };
                        }
                        return ch;
                    }));
                }
                setBackgroundAction(null); // Clear notification
            })
            .catch(err => {
                console.error("Background image gen failed", err);
                setBackgroundAction(null);
            });
      }

      // 5. Stream Text Response
      const aiMsgId = uuidv4();
      const fullText = response.reply;
      
      setChannels(prev => prev.map(ch => 
        ch.id === activeChannelId 
        ? { ...ch, messages: [...ch.messages, { id: aiMsgId, role: 'model', text: '', timestamp: Date.now() }] }
        : ch
      ));

      let currentIndex = 0;
      const speed = 20;

      const typeChar = () => {
        if (currentIndex < fullText.length) {
            setChannels(prev => prev.map(ch => {
                if (ch.id !== activeChannelId) return ch;
                
                return {
                    ...ch,
                    messages: ch.messages.map(msg => 
                        msg.id === aiMsgId 
                        ? { ...msg, text: fullText.substring(0, currentIndex + 1) }
                        : msg
                    )
                };
            }));
            currentIndex++;
            setTimeout(typeChar, speed);
        } else {
            setIsStreaming(false);
        }
      };

      typeChar();

    } catch (error) {
      console.error("Failed to generate design", error);
      setLoadingStatus(null);
      setIsStreaming(false);
      
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: "Error encountered. Please try again.",
        timestamp: Date.now()
      };
      
      setChannels(prev => prev.map(ch => 
        ch.id === activeChannelId 
        ? { ...ch, messages: [...ch.messages, errorMsg] }
        : ch
      ));
    }
  };

  const handleThemeUpdate = (newTheme: ThemeConfig) => {
    setChannels(prev => prev.map(ch => 
        ch.id === activeChannelId 
        ? { ...ch, theme: newTheme, name: newTheme.name }
        : ch
    ));
  };

  return (
    <ChatLayout
      channels={channels}
      activeChannelId={activeChannelId}
      onSwitchChannel={handleSwitchChannel}
      theme={activeChannel.theme}
      messages={activeChannel.messages}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSend={handleSend}
      loadingStatus={loadingStatus}
      backgroundAction={backgroundAction} // Pass background status
      isStreaming={isStreaming}
      onThemeUpdate={handleThemeUpdate}
    />
  );
};

export default App;