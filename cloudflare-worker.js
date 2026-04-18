// ARMONÍA — Cloudflare Worker (proxy seguro para Gemini API)
// ==========================================================
// QUÉ HACE: recibe peticiones del frontend, añade tu GEMINI_API_KEY (guardada
// como secreto en Cloudflare) y llama a Google Gemini. De esta forma tu clave
// nunca sale expuesta en el navegador.
//
// CÓMO DESPLEGAR:
// 1) Ve a https://dash.cloudflare.com/ → Workers & Pages → Create Worker
// 2) Nombre: "armonia-tutor" → Deploy → Edit Code → pega ESTE archivo completo
// 3) Save and Deploy
// 4) Settings → Variables → Environment Variables → Add variable:
//      Nombre:    GEMINI_API_KEY
//      Valor:     (tu clave de https://aistudio.google.com/apikey)
//      Encrypt:   ✅ (muy importante)
// 5) (Opcional) Variable ALLOWED_ORIGINS con tu URL de GitHub Pages para
//    restringir quién puede llamar al worker:
//      ALLOWED_ORIGINS = https://tu-usuario.github.io
// 6) Copia la URL pública del worker: https://armonia-tutor.<tu-user>.workers.dev
// 7) Pégala en APP_ARMONIA_Prototipo.html → constante WORKER_URL

const MODEL = "gemini-2.0-flash"; // rápido y barato; sube a "gemini-2.5-pro" si quieres máxima calidad
const MAX_OUTPUT_TOKENS = 1024;

export default {
  async fetch(request, env) {
    // ------ CORS ------
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map(s => s.trim());
    const corsOrigin = allowed.includes("*") || allowed.includes(origin) ? (origin || "*") : allowed[0] || "*";
    const CORS = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, CORS);

    // ------ Rate limit simple por IP (opcional) ------
    // Cloudflare incluye IP en CF-Connecting-IP. Si quieres limitar mejor, usa
    // Workers KV o Durable Objects. Aquí dejamos todo libre por simplicidad.

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, CORS); }
    const { messages = [], context = {} } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages array requerido" }, 400, CORS);
    }

    // ------ SYSTEM INSTRUCTION (personalidad del tutor) ------
    const systemText = `Eres el tutor de ARMONÍA, una aplicación profesional para aprender armonía, arreglos y composición.

PRINCIPIOS PEDAGÓGICOS
- Eres riguroso como un profesor de Berklee, Juilliard o conservatorio — pero cálido, directo y sin paja académica.
- Piensas en términos de oído primero, teoría después. Siempre das al menos un ejemplo de una canción real.
- Hablas en ${context.lang === "en" ? "English" : context.lang === "pt" ? "português brasileiro" : context.lang === "fr" ? "français" : context.lang === "it" ? "italiano" : "español"}.
- Estilo preferido del usuario: ${context.style || "jazz"}. Adapta tus ejemplos a ese estilo (jazz → Kern, Shorter; clásico → Bach, Mozart; pop → Beatles, Radiohead; latino → Jobim, Piazzolla, Paco de Lucía; cine → Williams, Herrmann, Zimmer).
- Nivel del usuario: ${context.level || "intermedio-avanzado"}. No expliques cosas básicas que ya domina; si dudas, pregunta.
- Si no sabes algo con certeza, lo dices. Nunca inventes análisis de obras que no conoces.

FORMATO DE RESPUESTA
- 150-300 palabras por respuesta (más si el usuario pide profundidad).
- Usa etiquetas HTML simples: <b>, <i>, <br>, listas con <br>•
- Cuando menciones una progresión que la app puede reproducir, inclúyela así: [PLAY:Cm7,F7,Bbmaj7,Ebmaj7] — la app lo detecta y ofrece un botón de reproducción.
- Cuando menciones una pieza específica, usa itálica: <i>All the Things You Are</i>.

CONTEXTO ACTIVO DEL USUARIO
- Lección abierta: ${context.lesson || "Ninguna específica"}
- Partitura en pantalla: ${context.score || "Ninguna"}
- Enfoque de estilo: ${context.style || "jazz"}

ÉTICA
- Si el usuario parece frustrado, lo reconoces y propones un camino más simple.
- Si preguntan algo no musical, lo rediriges amablemente al tema de la app.
- Si un mito aparece en la pregunta (p.ej. "las quintas paralelas siempre están mal"), lo señalas y desmontas.`;

    // ------ Convertir formato ARMONÍA → formato Gemini ------
    // El historial llega como [{role:"user"|"assistant", content:"..."}]
    // Gemini espera [{role:"user"|"model", parts:[{text:"..."}]}]
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // ------ Llamada a Gemini ------
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    const payload = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: "text/plain"
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        return json({
          error: "Gemini API error",
          status: res.status,
          details: data
        }, res.status, CORS);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "Lo siento, no pude generar una respuesta esta vez. Inténtalo de nuevo.";

      return json({
        reply: text,
        usage: data.usageMetadata || null,
        model: MODEL
      }, 200, CORS);

    } catch (e) {
      return json({ error: "Network error", details: String(e) }, 500, CORS);
    }
  }
};

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders }
  });
}
