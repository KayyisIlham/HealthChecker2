const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the standard JS SDK easily accessible 
    // but we can test a few common ones
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];
    console.log("Mengetes ketersediaan model...");
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent("test");
        console.log(`✅ Model '${modelName}' TERSEDIA.`);
      } catch (e) {
        console.log(`❌ Model '${modelName}' TIDAK TERSEDIA: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
