
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// This function runs on Vercel Serverless
export default async function handler(req: any, res: any) {
    // 1. Method Guard
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Security Guard (Internal Key)
    const internalKey = process.env.INTERNAL_API_KEY;
    const requestKey = req.headers['x-internal-key'];
    if (!internalKey || requestKey !== internalKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Internal Key' });
    }

    // 3. API Config Check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server API configuration error' });
    }

    // 4. Supabase Config Check
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    try {
        const { parts, systemInstruction } = req.body;

        // Initialize Gemini Client
        const ai = new GoogleGenAI({ apiKey });

        // Call Gemini
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
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
        let savedData = null;

        // 5. Supabase Logging
        if (supabase) {
            const { data, error } = await supabase
                .from('analyses')
                .insert([
                    {
                        raw_response: JSON.parse(text),
                        request_parts: parts
                    }
                ])
                .select();

            if (error) {
                console.warn('Supabase Insert Error:', error);
            } else {
                savedData = data?.[0];
            }
        }

        return res.status(200).json({
            text,
            savedId: savedData?.id || null,
            supabaseStatus: supabase ? (savedData ? 'success' : 'failed') : 'not_configured'
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
