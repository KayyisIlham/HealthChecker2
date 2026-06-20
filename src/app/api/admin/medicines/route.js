import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('adminEmail');

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('medicines')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();

    const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Get medicines error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data obat.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { adminEmail, tanggalMasuk, sumber, namaObat, dosis, jumlah, expDate } = body;

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (!tanggalMasuk || !sumber || !namaObat || !dosis || !expDate) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const docRef = await adminDb.collection('medicines').add({
      tanggalMasuk,
      sumber: sumber.trim(),
      namaObat: namaObat.trim(),
      dosis: dosis.trim(),
      jumlah: jumlah ? parseInt(jumlah) : 0,
      expDate,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Add medicine error:', error);
    return NextResponse.json({ error: 'Gagal menambah data obat.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { adminEmail, medicineId } = body;

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (!medicineId) {
      return NextResponse.json({ error: 'medicineId diperlukan.' }, { status: 400 });
    }

    await adminDb.collection('medicines').doc(medicineId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data obat.' }, { status: 500 });
  }
}
