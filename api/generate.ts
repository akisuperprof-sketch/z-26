
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 注意: フロントエンドから直接呼び出すのではなく、このサーバーサイドAPIを経由することで
// APIキーの露出を防ぎ、安全な通信を確保します。

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, images, model = 'gemini-2.0-flash' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        return res.status(500).json({ error: 'Backend configuration error: API Key missing' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Google Generative AI API endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const contents = [{
            role: 'user',
            parts: [
                { text: prompt },
                ...(images || []).map((img: any) => ({
                    inline_data: {
                        mime_type: img.mimeType,
                        data: img.data
                    }
                }))
            ]
        }];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error: ${response.status}`, errorText);
            return res.status(response.status).json({
                error: 'Gemini API call failed',
                details: errorText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('Server error during Gemini API call:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
