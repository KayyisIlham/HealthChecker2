const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listAllModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Menggunakan fetch manual karena JS SDK terkadang menyembunyikan detail list
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.log("❌ Error dari Google:", data.error.message);
      return;
    }

    console.log("✅ Berhasil terhubung ke Google!");
    console.log("Model yang tersedia untuk API Key Anda:");
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log("Tidak ada model yang ditemukan untuk key ini.");
    }
  } catch (err) {
    console.error("Gagal mengambil daftar model:", err.message);
  }
}

listAllModels();
