//src/lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function signToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export async function getUserFromRequest(req) {
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) return null;

        const user = verifyToken(token);
        return user; // { id, role }
    } catch (err) {
        console.error('[getUserFromRequest]', err);
        return null;
    }
}

export function isAdmin(user) {
    return user?.role === 'ADMIN';
}
