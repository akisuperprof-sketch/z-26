import crypto from 'crypto';

// Minimal rate limit map (resets on container cold start)
const rateLimitMap = new Map<string, number[]>();

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    // Rates: Max 10 requests per 1 minute per IP (allowing for dictionary lookups etc)
    const windowMs = 60 * 1000;
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= 10) {
        return res.status(429).json({ error: 'Too Many Requests from this IP. Please try again later.' });
    }

    validTimestamps.push(now);

    // cleanup old map entries occasionally
    if (rateLimitMap.size > 1000) rateLimitMap.clear();

    rateLimitMap.set(ip, validTimestamps);

    // Create short-lived token
    const secret = process.env.INTERNAL_API_KEY;
    if (!secret) return res.status(500).json({ error: 'Server Config Error' });

    const expiry = now + 5 * 60 * 1000; // 5 minutes
    const payload = `${ip}:${expiry}`; // Embed IP to bind token to the request IP
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}|${signature}`).toString('base64');

    return res.status(200).json({ token });
}
