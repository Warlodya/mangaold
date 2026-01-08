import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET() {
    const user = await getCurrentUser();
    return Response.json(user || null);
}
