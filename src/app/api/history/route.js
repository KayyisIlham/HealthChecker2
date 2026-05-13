import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit') || '20';

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan.' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('checks')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limitParam))
      .get();

    const checks = [];
    snapshot.forEach((doc) => {
      checks.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ checks });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
