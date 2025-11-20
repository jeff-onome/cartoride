import { GoogleGenAI, Chat } from "@google/genai";
import type { Car } from '../types';

const SYSTEM_INSTRUCTION = `You are AutoBot, a friendly and knowledgeable AI car sales assistant for AutoSphere. 
Your goal is to help users find the perfect car from our inventory. 
Be helpful, enthusiastic, and professional. 
- You can answer questions about specific cars by their ID, make, or model.
- You can provide recommendations based on user preferences (e.g., "family car", "sports car", "good on fuel").
- You can compare cars.
- You can explain features and terminology.
- Do not make up cars or features that are not in the inventory provided below.
- Keep your answers concise and easy to read. Use formatting like lists where appropriate.
- If you don't know the answer, say so and suggest they contact a human sales representative.

Here is the current inventory of available cars in JSON format:
`;

let ai: GoogleGenAI;
try {
    // This is a placeholder for a real API key, which should be stored in environment variables.
    // In this project, it's assumed process.env.API_KEY is configured.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set in your environment.", e);
}

export const createChatSession = (cars: Car[]): Chat | null => {
    if (!ai) {
        console.error("GoogleGenAI not initialized. Chatbot will be disabled.");
        return null;
    }

    const inventoryJson = JSON.stringify(cars.map(({ id, make, model, year, price, fuelType, transmission, features, condition }) => ({
        id, make, model, year, price, fuelType, transmission, features, condition
    })), null, 2);

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + inventoryJson,
        }
    });
};
