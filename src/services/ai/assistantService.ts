import { GoogleGenAI, Type } from "@google/genai";
import { TextState, ColorsState, PreferencesState } from '../../types';
import { VIBE_STYLES } from '../../constants';

export const getAssistantResponse = async (
    ai: GoogleGenAI, 
    message: string, 
    state: { text: TextState, colors: ColorsState, preferences: PreferencesState }
) => {
    const prompt = `
You are a helpful and clever AI Design Assistant. Your job is to interpret a user's request and turn it into a specific JSON command to modify the design settings. Color changes are applied instantly to existing designs.

Here are the available Vibe & Styles: ${VIBE_STYLES.join(', ')}

**CURRENT DESIGN STATE:**
\`\`\`json
${JSON.stringify(state, null, 2)}
\`\`\`

**USER REQUEST:** "${message}"

**YOUR TASK:**
Based on the user's request and the current state, respond with a single JSON object. The JSON object must have three properties: "action", "payload", and "responseMessage".
- "action": A string representing the command.
- "payload": An object with the data for that command.
- "responseMessage": A friendly, conversational message to show the user, acknowledging the action was taken.

**Available Actions & Payloads:**
1.  **"update_text"**: To change the headline or subheadline.
    - payload: \`{ "field": "headline" | "subheadline", "value": "new text" }\`
2.  **"update_color"**: To change a single color in the palette.
    - payload: \`{ "color": "primary" | "secondary" | "accent" | "background", "value": "#hexcode" }\`
3.  **"suggest_colors"**: To suggest a completely new color palette based on a theme.
    - payload: \`{ "colors": { "primary": "#hexcode", "secondary": "#hexcode", "accent": "#hexcode", "background": "#hexcode" } }\`
4.  **"update_preference"**: To change the vibe/style.
    - payload: \`{ "field": "style", "value": "A style from the available list" }\`
5.  **"none"**: If the request is conversational, a general question, or cannot be mapped to an action.
    - payload: \`{}\`

**Examples:**
- User: "Change the main title to 'Epic Adventures'" -> \`{"action": "update_text", "payload": {"field": "headline", "value": "Epic Adventures"}, "responseMessage": "Headline updated!"}\`
- User: "Make the background color dark blue" -> \`{"action": "update_color", "payload": {"color": "background", "value": "#00008B"}, "responseMessage": "Okay, I've set the background to dark blue."}\`
- User: "I want a more professional vibe" -> \`{"action": "update_preference", "payload": {"field": "style", "value": "Professional & Corporate"}, "responseMessage": "Got it, switching to a more professional style."}\`
- User: "Can you give me a color palette that feels like a sunset?" -> \`{"action": "suggest_colors", "payload": {"colors": {"primary": "#FF6B6B", "secondary": "#FFD166", "accent": "#4D96FF", "background": "#1A237E"}}, "responseMessage": "Here is a sunset-inspired palette for you."}\`
- User: "Hello, how are you?" -> \`{"action": "none", "payload": {}, "responseMessage": "I'm doing great, ready to help you design!"}\`

Now, generate the JSON response for the user's request.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    payload: { type: Type.OBJECT },
                    responseMessage: { type: Type.STRING },
                },
                required: ["action", "payload", "responseMessage"]
            }
        }
    });

    try {
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse assistant response:", e);
        return {
            action: 'none',
            payload: {},
            responseMessage: "I'm sorry, I had a little trouble understanding that. Could you try rephrasing?"
        };
    }
};
