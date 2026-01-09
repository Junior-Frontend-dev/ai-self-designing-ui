export interface ThemeConfig {
  name: string;
  // Main Layout
  appContainer: string;
  
  // Sidebar
  sidebarContainer: string;
  sidebarHeader: string;
  sidebarList: string;
  sidebarItem: string;
  sidebarItemActive: string;

  // Main Content
  header: string;
  headerTitle: string;
  chatContainer: string;
  messageList: string;
  messageRowUser: string;
  messageRowAI: string;
  messageBubbleUser: string;
  messageBubbleAI: string;
  inputContainer: string;
  inputWrapper: string;
  inputField: string;
  sendButton: string;
  
  // Code Editor / Config Panel
  codeContainer: string;
  codeHeader: string;
  codeTitle: string;
  codeEditor: string;
  codeButtonApply: string;
  codeButtonClose: string;
  
  // Loading State Aesthetics (New)
  loadingSpinner: string; // HTML/SVG string for the spinner icon
  loadingText: string; // Tailwind class for the status text
  
  // Background Images
  backgroundImage?: string;
  backgroundSize?: string;
  
  // Advanced Customization
  customCSS?: string; 
  
  // External Power
  headHtml?: string; 
  customJS?: string; 
  
  aiInstructions?: string;
  
  // Internal use
  imageGenerationPrompt?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Channel {
  id: string;
  name: string;
  theme: ThemeConfig;
  messages: Message[];
}

export interface AIResponse {
  reply: string;
  theme: ThemeConfig;
}