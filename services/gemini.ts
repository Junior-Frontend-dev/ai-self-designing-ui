import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ThemeConfig, Message, AIResponse } from "../types";

// Helper to create a schema definition
const themeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "The text response. Use the same language as the user. Explain your design choices here."
    },
    theme: {
      type: Type.OBJECT,
      description: "The styling and behavior configuration.",
      properties: {
        name: { type: Type.STRING, description: "The name of this AI Agent (appears in header)." },
        appContainer: { type: Type.STRING, description: "Main wrapper class. Usually 'h-screen w-full flex flex-row overflow-hidden'." },
        
        sidebarContainer: { type: Type.STRING, description: "Sidebar container class." },
        sidebarHeader: { type: Type.STRING, description: "Sidebar header text class." },
        sidebarList: { type: Type.STRING, description: "Sidebar list wrapper." },
        sidebarItem: { type: Type.STRING, description: "Inactive channel item class." },
        sidebarItemActive: { type: Type.STRING, description: "Active channel item class." },

        header: { type: Type.STRING, description: "Main header container class." },
        headerTitle: { type: Type.STRING, description: "Title text class in header." },
        chatContainer: { type: Type.STRING, description: "Wrapper for messages and input." },
        messageList: { type: Type.STRING, description: "Scrollable message list class." },
        messageRowUser: { type: Type.STRING, description: "Container for user message row (alignment)." },
        messageRowAI: { type: Type.STRING, description: "Container for AI message row (alignment)." },
        messageBubbleUser: { type: Type.STRING, description: "User message bubble styles." },
        messageBubbleAI: { type: Type.STRING, description: "AI message bubble styles." },
        inputContainer: { type: Type.STRING, description: "Input form container class." },
        inputWrapper: { type: Type.STRING, description: "Wrapper around input and button." },
        inputField: { type: Type.STRING, description: "Text input field class." },
        sendButton: { type: Type.STRING, description: "Send button class." },
        
        // Code Editor Fields
        codeContainer: { type: Type.STRING, description: "Container for the code editor panel." },
        codeHeader: { type: Type.STRING, description: "Header bar of the code editor." },
        codeTitle: { type: Type.STRING, description: "Title text style in code editor header." },
        codeEditor: { type: Type.STRING, description: "Textarea style for the code." },
        codeButtonApply: { type: Type.STRING, description: "Apply button style." },
        codeButtonClose: { type: Type.STRING, description: "Close button style." },

        // Loading Aesthetics
        loadingSpinner: { type: Type.STRING, description: "SVG string for the loading spinner. Design it to match the theme (e.g. Neon hexagon, pixel hourglass)." },
        loadingText: { type: Type.STRING, description: "Tailwind classes for the loading status text." },

        backgroundImage: { type: Type.STRING, description: "Leave as 'none' or current value. Image generation is handled via imageGenerationPrompt." },
        backgroundSize: { type: Type.STRING, description: "CSS background-size: cover, contain, or auto." },
        
        customCSS: { type: Type.STRING, description: "Raw CSS for fonts, keyframes, and advanced effects." },
        
        headHtml: { 
            type: Type.STRING, 
            description: "HTML tags to inject into <head>. Use this for <link> (Google Fonts) or <script src='...'> (External Libs like FontAwesome, Anime.js, etc)." 
        },
        customJS: {
            type: Type.STRING,
            description: "Executable JavaScript code. Runs immediately after render."
        },
        
        aiInstructions: { 
            type: Type.STRING, 
            description: "System instructions for YOURSELF for future turns." 
        },
        imageGenerationPrompt: {
            type: Type.STRING,
            description: "Describe a HIGH QUALITY background scene if needed. Use keywords like '8k resolution', 'cinematic lighting', 'unreal engine 5 render'."
        }
      },
      required: [
        "name", "appContainer", "sidebarContainer", "sidebarList", "sidebarItem", "sidebarItemActive",
        "header", "headerTitle", "chatContainer", "messageList", "inputContainer", "inputField", "sendButton",
        "codeContainer", "codeHeader", "codeTitle", "codeEditor", "codeButtonApply", "codeButtonClose",
        "loadingSpinner", "loadingText"
      ]
    }
  },
  required: ["reply", "theme"]
};

// Exported separately to allow parallel execution in App.tsx
export const generateImageService = async (apiKey: string, prompt: string): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                return `data:image/png;base64,${base64String}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image generation failed", e);
        return null;
    }
};

const ULTIMATE_DESIGN_PROMPT = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🎨 ULTIMATE SELF-DESIGNING CHAT APPLICATION - MASTER ARCHITECT SYSTEM 🎨   ║
╚══════════════════════════════════════════════════════════════════════════════╝

You are **DESIGNMASTER-X9000** — an elite fusion of Senior UI/UX Architect, Frontend Engineer, and Visual Artist.
Your mission: Transform this chat application into a LIVING, BREATHING masterpiece.

═══════════════════════════════════════════════════════════════════════════════
                        ⚡ SUPERCHARGED CAPABILITIES
═══════════════════════════════════════════════════════════════════════════════

【LAYER 1: TAILWIND & CSS MASTERY】
• Use arbitrary values: bg-[#1a1a1a], w-[calc(100%-20px)].
• Use gradients: bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500.
• Use effects: backdrop-blur-xl, mix-blend-overlay, shadow-[0_0_30px_rgba(0,255,0,0.5)].

【LAYER 2: LOADING AESTHETICS (NEW!)】
• You now control the **Loading Spinner** and **Loading Text**.
• If the theme is "Cyberpunk", use a Neon Hexagon SVG or Glitching Circle.
• If the theme is "Nature", use a spinning leaf or organic shape.
• If the theme is "Pixel Art", use an 8-bit hourglass.
• The 'loadingSpinner' field accepts raw SVG code. BE CREATIVE.

【LAYER 3: MASTERPIECE SCENE GENERATION】
• When you populate 'imageGenerationPrompt', DO NOT just say "A city".
• USE PROMPT ENGINEERING: "A futuristic cyberpunk city at night, neon lights reflecting on wet rain pavement, towering skyscrapers, volumetric fog, 8k resolution, photorealistic, trending on ArtStation, cinematic composition."
• Be specific about lighting, mood, and style.

═══════════════════════════════════════════════════════════════════════════════
                         📜 GOLDEN DESIGN RULES
═══════════════════════════════════════════════════════════════════════════════

1. **CONTRAST IS KING**: Ensure text is readable.
2. **LAYOUT INTEGRITY**: Keep flex containers working.
3. **CREATIVE INTERPRETATION**:
   - "Matrix" -> Green/Black terminal, digital rain CSS, mono font.
   - "Luxury" -> Gold/Black, serif fonts, elegant borders.
   
4. **AUTONOMY**: 
   - You decide when to generate images.
   - You decide when to inject scripts (Confetti, Three.js).
   - You decide the loading animation.

═══════════════════════════════════════════════════════════════════════════════
                      🎯 EXECUTION STRATEGY
═══════════════════════════════════════════════════════════════════════════════
You will output the JSON theme immediately.
If you provide an 'imageGenerationPrompt', the application will generate it in the background (multi-threaded) so the UI updates instantly while the image paints.
`;

export const generateAppDesign = async (
  history: Message[],
  currentTheme: ThemeConfig,
  prompt: string,
  onStatusUpdate: (status: string) => void
): Promise<AIResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const customPersona = currentTheme.aiInstructions || "You are a helpful AI assistant.";

  // SANITIZATION: Remove huge base64 strings from the context sent to Gemini
  const sanitizedTheme = { ...currentTheme };
  if (sanitizedTheme.backgroundImage?.startsWith('data:image')) {
      sanitizedTheme.backgroundImage = "(Base64 Image Data - Preserved but hidden for prompt context)";
  }

  const systemInstruction = `
${ULTIMATE_DESIGN_PROMPT}

**Current Identity/Instructions**: "${customPersona}"

Current Theme Configuration: ${JSON.stringify(sanitizedTheme)}

User's Request:
`;

  // Truncate history to avoid token limits (keep last 30 turns)
  const slicedHistory = history.slice(-30);

  const conversationHistory = slicedHistory.map(msg => 
    `${msg.role === 'user' ? 'User' : 'System'}: ${msg.text}`
  ).join('\n');

  const fullPrompt = `
Conversation History:
${conversationHistory}

User's Latest Input: ${prompt}
  `;

  try {
    onStatusUpdate("🧠 Architecting Interface...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: themeSchema,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }
    
    const parsedResponse = JSON.parse(text) as AIResponse;
    return parsedResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
        reply: "Error generating design. Please try again.",
        theme: currentTheme
    };
  }
};