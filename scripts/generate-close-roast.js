#!/usr/bin/env node
/**
 * Generates a roast with BURLA (mockery) about why the PR was closed/merged.
 * Outputs to stdout for workflow capture.
 * Env: GEMINI_API_KEY, PR_AUTHOR, PR_MERGED, SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, RATING, VERDICT
 */

async function main() {
  const key = process.env.GEMINI_API_KEY;
  const author = process.env.PR_AUTHOR || 'author';
  const merged = process.env.PR_MERGED === 'true';
  const bugs = process.env.SONAR_BUGS || '0';
  const hotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const rating = process.env.RATING || '3';
  const verdict = process.env.VERDICT || '';

  if (!key) {
    console.log('Review completed.');
    return;
  }

  const context = merged
    ? `PR fue MERGEADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots.`
    : `PR fue CERRADO/RECHAZADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots. Verdict: ${verdict}`;

  const styles = [
    'The Simpsons (Homer, Mr. Burns, Bart)',
    'Futurama (Bender, Fry, Zapp Brannigan)',
    'Lupita (humor mexicano)',
    'TikTok / trends virales',
    'Oprankedy / YouTube pranks',
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];

  const prompt = `Genera UNA frase sarcástica/burla en español sobre por qué este PR fue ${merged ? 'mergeado' : 'cerrado/rechazado'}. 
Contexto: ${context}
Estilo: ${style}. Menciona a @${author}. Máximo 150 caracteres. Solo la frase, sin comillas ni prefijos.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 128 },
        }),
      },
    );
    if (!res.ok) {
      console.log('Review completed.');
      return;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const roast =
      text
        ?.trim()
        .slice(0, 200)
        .replace(/^["']|["']$/g, '') || 'Review completed.';
    console.log(roast);
  } catch (_) {
    console.log('Review completed.');
  }
}

main();
