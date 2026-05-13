import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { calculateBMI, getBMICategory, getBloodPressureCategory } from '@/lib/bmi';
import { generateHealthAdvice } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { userId, height, weight, systolic, diastolic, name, email } = body;

    if (!userId || !height || !weight || !systolic || !diastolic) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    // Update profil user di Firestore
    await adminDb.collection('users').doc(userId).set({
      email: email || '',
      displayName: name || '',
      lastCheck: new Date().toISOString()
    }, { merge: true });

    if (height < 50 || height > 300 || weight < 10 || weight > 500) {
      return NextResponse.json({ error: 'Data tinggi/berat badan tidak valid.' }, { status: 400 });
    }

    if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) {
      return NextResponse.json({ error: 'Data tekanan darah tidak valid.' }, { status: 400 });
    }

    const bmi = calculateBMI(weight, height);
    const bmiCat = getBMICategory(bmi);
    const bpCat = getBloodPressureCategory(systolic, diastolic);

    let aiAdvice = '';
    try {
      aiAdvice = await generateHealthAdvice(bmi, bmiCat.category, systolic, diastolic, bpCat.category);
    } catch {
      aiAdvice = 'Saran AI tidak tersedia saat ini. Silakan coba lagi nanti.';
    }

    const checkData = {
      height: Number(height),
      weight: Number(weight),
      bmi,
      bmiCategory: bmiCat.category,
      bmiCategoryKey: bmiCat.key,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      bloodPressureCategory: bpCat.category,
      bloodPressureCategoryKey: bpCat.key,
      aiAdvice,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('users').doc(userId).collection('checks').add(checkData);

    return NextResponse.json({ id: docRef.id, ...checkData });
  } catch (error) {
    console.error('Check API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
