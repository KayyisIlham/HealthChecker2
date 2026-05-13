import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateHealthAdvice(bmi, bmiCategory, systolic, diastolic, bpCategory) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `Anda adalah asisten kesehatan yang ramah dan informatif. Berdasarkan data pemeriksaan kesehatan berikut:

📊 Indeks Massa Tubuh (IMT): ${bmi} kg/m² — Kategori: ${bmiCategory}
🩺 Tekanan Darah: ${systolic}/${diastolic} mmHg — Kategori: ${bpCategory}

Berikan saran kesehatan dalam Bahasa Indonesia yang mencakup:

1. 📋 **Analisis Kondisi** — Jelaskan kondisi kesehatan saat ini berdasarkan data di atas
2. 🍽️ **Saran Diet & Pola Makan** — Rekomendasi makanan yang tepat
3. 🏃 **Aktivitas Fisik** — Jenis olahraga dan durasi yang direkomendasikan
4. ⚖️ **Tips Menjaga IMT Stabil** — Langkah-langkah konkret agar IMT tetap ideal
5. ⚠️ **Peringatan** — Risiko kesehatan yang perlu diwaspadai (jika ada)

Format jawaban dengan rapi menggunakan emoji dan poin-poin yang mudah dibaca. Jaga agar tetap singkat namun informatif (maksimal 400 kata).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Gagal mendapatkan saran AI. Silakan coba lagi.');
  }
}
