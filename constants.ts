import { ThemeConfig, Channel } from './types';
import { v4 as uuidv4 } from 'uuid';

// The "Safe Default" starting point.
export const INITIAL_THEME: ThemeConfig = {
  name: "Classic Light",
  // Layout
  appContainer: "bg-gray-50 text-gray-900 h-screen flex flex-row overflow-hidden font-sans",
  
  // Sidebar
  sidebarContainer: "w-64 border-r border-gray-300 p-4 flex flex-col bg-gray-100 overflow-y-auto",
  sidebarHeader: "font-bold text-lg mb-4 border-b border-gray-300 pb-2 text-gray-800",
  sidebarList: "flex flex-col gap-2",
  sidebarItem: "border border-gray-300 p-2 cursor-pointer bg-white hover:bg-gray-200 text-gray-700 rounded shadow-sm",
  sidebarItemActive: "border-2 border-blue-500 p-2 cursor-pointer bg-blue-50 font-bold text-blue-900 rounded shadow-sm",

  // Main Content
  header: "bg-white border-b border-gray-300 p-4 flex justify-between items-center shadow-sm",
  headerTitle: "text-2xl font-bold text-gray-900",
  chatContainer: "flex-1 flex flex-col overflow-hidden relative bg-gray-50",
  messageList: "flex-1 overflow-y-auto p-4 z-10 space-y-4",
  messageRowUser: "flex justify-end",
  messageRowAI: "flex justify-start",
  messageBubbleUser: "bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none shadow-md max-w-[80%]",
  messageBubbleAI: "bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-none shadow-md max-w-[80%]",
  inputContainer: "border-t border-gray-300 p-4 bg-white z-10",
  inputWrapper: "flex gap-2 max-w-4xl mx-auto items-center",
  inputField: "border border-gray-300 bg-gray-50 text-gray-900 p-3 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
  sendButton: "bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm",
  
  // Code Editor Defaults
  codeContainer: "w-[400px] flex flex-col bg-[#1e1e1e] font-mono text-sm shadow-xl z-10 border-l border-gray-700",
  codeHeader: "h-10 border-b border-[#333] flex items-center px-4 justify-between bg-[#252526]",
  codeTitle: "text-[#cccccc] text-xs font-bold uppercase tracking-wider",
  codeEditor: "w-full h-full bg-[#1e1e1e] p-4 text-[#9cdcfe] resize-none focus:outline-none leading-relaxed",
  codeButtonApply: "text-xs bg-[#0e639c] text-white px-3 py-1 hover:bg-[#1177bb] transition-colors rounded-sm",
  codeButtonClose: "text-gray-400 hover:text-white px-2",

  // Loading Aesthetics
  loadingSpinner: `<svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
  loadingText: "text-sm text-gray-500 animate-pulse mt-2",

  backgroundImage: "none",
  backgroundSize: "cover",
  
  customCSS: "",
  headHtml: "",
  customJS: "",
  aiInstructions: "You are a helpful AI assistant."
};

const createInitialChannel = (index: number): Channel => ({
  id: uuidv4(),
  name: `AI Agent ${index + 1}`,
  theme: { ...INITIAL_THEME, name: `AI Agent ${index + 1}` },
  messages: [{
    id: uuidv4(),
    role: 'model',
    text: `Hello! I am AI Agent ${index + 1}. I can import external libraries (like Three.js, Confetti, Google Fonts) and run custom JavaScript. Just ask me to "Make it snow" or "Use the Press Start 2P font"!`,
    timestamp: Date.now()
  }]
});

export const INITIAL_CHANNELS: Channel[] = Array.from({ length: 6 }, (_, i) => createInitialChannel(i));