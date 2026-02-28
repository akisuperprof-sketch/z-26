
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
        // Note: We trust the client to send properly formatted parts (text prompt + inline data)
        // This is a proxy pass-through to hide the key.

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ],
            config: {
                responseMimeType: "application/json",
                systemInstruction: systemInstruction // if needed
            }
        });

        const text = response.text;
        return res.status(200).json({ text });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
