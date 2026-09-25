const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️  Falta GEMINI_API_KEY. El traductor con IA no funcionará hasta que la agregues al .env');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Modelo principal: gemini-3.8-flash (el que Google recomienda actualmente)
// Fallback: gemini-3.6-flash por si el principal falla
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_MODEL_FALLBACK = process.env.GEMINI_MODEL_FALLBACK || 'gemini-3.6-flash';

const DIALECT_LABELS = {
  ava: 'guaraní ava (Chaco boliviano - Cordillera/Camiri)',
  izoceño: 'guaraní izoceño (Isoso, río Parapetí)',
  simba: 'guaraní simba (Tarija/Chuquisaca)'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(modelName, prompt, maxRetries = 2) {
  const model = genAI.getGenerativeModel({ model: modelName });
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return { result, modelUsed: modelName };
    } catch (err) {
      lastError = err;
      const msg = err.message || '';

      const isQuota = msg.includes('429') || msg.includes('Too Many Requests');
      const isOverloaded = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded');
      const isServerError = msg.includes('500');

      if (isQuota) throw err;
      if (!isOverloaded && !isServerError) throw err;
      if (attempt === maxRetries) throw err;

      const waitMs = 1000 * Math.pow(2, attempt);
      console.warn(`⚠️  ${modelName} intento ${attempt} falló. Reintentando en ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }
  throw lastError;
}

async function translateWithGemini({ text, sourceLang, targetLang, dialect, glossaryEntries = [] }) {
  if (!genAI) {
    throw new Error('El servidor no tiene configurada la API de Gemini (falta GEMINI_API_KEY).');
  }

  const langNames = { es: 'español', gn: 'guaraní' };
  const dialectLabel = DIALECT_LABELS[dialect] || DIALECT_LABELS.ava;

  const glossaryContext = glossaryEntries.length
    ? `Glosario de referencia verificado por lingüistas:\n` +
      glossaryEntries.map(g => `- ${g.word_spanish} = ${g.word_guarani}`).join('\n')
    : '';

  const prompt = `Eres un traductor experto en ${dialectLabel}, una lengua indígena de Bolivia.
Traduce el siguiente texto de ${langNames[sourceLang]} a ${langNames[targetLang]}.

${glossaryContext}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional ni markdown:
{"translation": "el texto traducido", "confidence": 0.0 a 1.0, "notes": "nota breve opcional o cadena vacía"}

Si no estás seguro de alguna palabra, tradúcela razonablemente y dilo en "notes", pero SIEMPRE da una traducción completa.

Texto a traducir: "${text}"`;

  let rawResponse = '';
  let modelUsed = GEMINI_MODEL;

  try {
    const { result, modelUsed: used } = await generateWithRetry(GEMINI_MODEL, prompt, 2);
    rawResponse = result.response.text().trim();
    modelUsed = used;
  } catch (primaryError) {
    console.warn(`⚠️  ${GEMINI_MODEL} falló. Probando fallback ${GEMINI_MODEL_FALLBACK}...`);
    try {
      const { result, modelUsed: used } = await generateWithRetry(GEMINI_MODEL_FALLBACK, prompt, 1);
      rawResponse = result.response.text().trim();
      modelUsed = used;
    } catch (fallbackError) {
      throw new Error(
        `Gemini no disponible. Intenta de nuevo en unos minutos. (${primaryError.message})`
      );
    }
  }

  const cleaned = rawResponse.replace(/^```json\s*|```$/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    parsed = { translation: rawResponse, confidence: 0.5, notes: '' };
  }

  return {
    translation: parsed.translation || '',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    notes: parsed.notes || '',
    model: modelUsed
  };
}

module.exports = { translateWithGemini };