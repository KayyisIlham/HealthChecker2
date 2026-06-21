import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { sendSickNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { userId, userName, userEmail, userPhone, complaintType, description, urgency, gender } = body;

    if (!userId || !complaintType || !description || !urgency || !userPhone || !gender) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    if (!['ringan', 'sedang', 'darurat'].includes(urgency)) {
      return NextResponse.json({ error: 'Tingkat urgensi tidak valid.' }, { status: 400 });
    }

    if (!['Laki-laki', 'Perempuan'].includes(gender)) {
      return NextResponse.json({ error: 'Jenis kelamin tidak valid.' }, { status: 400 });
    }

    const complaintData = {
      userId,
      userName: userName || '',
      userEmail: userEmail || '',
      userPhone,
      gender,
      complaintType,
      description,
      urgency,
      status: 'menunggu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('complaints').add(complaintData);

    // Send email notification asynchronously so it doesn't delay client response
    sendSickNotification(complaintData).catch(err => {
      console.error('Failed to send sick notification email:', err);
    });

    return NextResponse.json({ id: docRef.id, ...complaintData });
  } catch (error) {
    console.error('Complaint API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan.' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('complaints')
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt descending client-side
    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
