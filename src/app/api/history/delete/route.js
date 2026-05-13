import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan.' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const checksRef = adminDb.collection('users').doc(userId).collection('checks');
    
    // Batch delete (efisien untuk menghapus banyak dokumen sekaligus)
    const snapshot = await checksRef.get();
    const batch = adminDb.batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ message: 'Semua riwayat berhasil dihapus.' });
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json({ error: 'Gagal menghapus riwayat.' }, { status: 500 });
  }
}
