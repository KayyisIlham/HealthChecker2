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
    const snapshot = await adminDb.collection('medicine_logs')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Get medicine logs error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data obat keluar.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { adminEmail, tanggal, namaPasien, keluhan, diagnosa, obat, jumlah, pemberiObat } = body;

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (!tanggal || !namaPasien || !keluhan || !diagnosa || !obat || !pemberiObat) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const docRef = await adminDb.collection('medicine_logs').add({
      tanggal,
      namaPasien: namaPasien.trim(),
      keluhan: keluhan.trim(),
      diagnosa: diagnosa.trim(),
      obat: obat.trim(),
      jumlah: jumlah ? parseInt(jumlah) : 1,
      pemberiObat: pemberiObat.trim(),
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Add medicine log error:', error);
    return NextResponse.json({ error: 'Gagal menambah data obat keluar.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { adminEmail, logId } = body;

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (!logId) {
      return NextResponse.json({ error: 'logId diperlukan.' }, { status: 400 });
    }

    await adminDb.collection('medicine_logs').doc(logId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete medicine log error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data obat keluar.' }, { status: 500 });
  }
}
