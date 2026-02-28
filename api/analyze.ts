
import { GoogleGenAI } from "@google/genai";

// This function runs on Vercel Serverless
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server API configuration error' });
    }

    try {
        const { parts, systemInstruction } = req.body;

        // Initialize Gemini Client
        const ai = new GoogleGenAI({ apiKey });

        // Call API
        const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = result.text;
        return res.status(200).json({ text });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
