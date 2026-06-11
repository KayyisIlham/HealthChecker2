import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('adminEmail');

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const statusFilter = searchParams.get('status');
    const urgencyFilter = searchParams.get('urgency');

    let query = adminDb.collection('complaints').orderBy('createdAt', 'desc');

    if (statusFilter && statusFilter !== 'semua') {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.limit(100).get();
    let complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter urgency client-side (Firestore limitation with multiple where + orderBy)
    if (urgencyFilter && urgencyFilter !== 'semua') {
      complaints = complaints.filter(c => c.urgency === urgencyFilter);
    }

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Admin complaints error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { adminEmail, complaintId, status } = body;

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (!complaintId || !status) {
      return NextResponse.json({ error: 'complaintId dan status diperlukan.' }, { status: 400 });
    }

    if (!['menunggu', 'ditangani', 'selesai'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    await adminDb.collection('complaints').doc(complaintId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, complaintId, status });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
