import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('adminEmail');

    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const adminDb = getAdminDb();
    const usersSnapshot = await adminDb.collection('users').get();
    
    const usersData = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Ambil data profil dasar
      const info = {
        id: userDoc.id,
        email: userData.email || 'Tanpa Email',
        name: userData.displayName || 'Anonim',
        latestCheck: null
      };

      // Ambil pemeriksaan terakhir dari subkoleksi 'checks'
      const checksSnapshot = await adminDb.collection('users')
        .doc(userDoc.id)
        .collection('checks')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!checksSnapshot.empty) {
        info.latestCheck = checksSnapshot.docs[0].data();
      }

      usersData.push(info);
    }

    // Sort: User yang butuh perhatian diletakkan di atas
    usersData.sort((a, b) => {
      const aRisk = a.latestCheck && (a.latestCheck.bmiCategoryKey === 'obesitas' || a.latestCheck.bloodPressureCategory.includes('Hipertensi'));
      const bRisk = b.latestCheck && (b.latestCheck.bmiCategoryKey === 'obesitas' || b.latestCheck.bloodPressureCategory.includes('Hipertensi'));
      if (aRisk && !bRisk) return -1;
      if (!aRisk && bRisk) return 1;
      return 0;
    });

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}
