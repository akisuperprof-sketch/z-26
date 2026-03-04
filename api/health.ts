import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'ok',
        version: 'v1.3.0',
        sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
        env: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
    });
}
