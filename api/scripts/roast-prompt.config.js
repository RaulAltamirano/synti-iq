/**
 * Configuración del roast para Discord cuando se cierra/mergea un PR.
 *
 * Cómo modificar:
 * - language: 'es' | 'en' para el idioma del roast
 * - styles: añade referencias (series, memes, personajes) para variar el humor
 * - promptTemplate: usa {{action}}, {{context}}, {{style}}, {{author}}, {{maxChars}}
 * - fallback: mensaje cuando Gemini falla
 */

module.exports = {
  /** Idioma del roast: 'es' | 'en' */
  language: 'es',

  /** Mensaje cuando Gemini falla o no hay API key */
  fallback: 'Revisión completada.',

  /** Máximo de caracteres del roast */
  maxChars: 200,

  /**
   * Estilos/referencias para el humor. Se elige uno al azar.
   * Añade o modifica para cambiar el tono del roast.
   */
  styles: [
    'Los Simpson (Homer, Mr. Burns, Bart)',
    'Futurama (Bender, Fry, Zapp Brannigan)',
    'Humor mexicano (Lupita Tik Tok, Prankedy, el senor de la tienda, memes, albures suaves)',
    'Tendencias virales de TikTok',
    'YouTube / Prankedy(canal de bromas)',
    'Don Ramón / El Chavo del 8',
    'Humor negro (crudo, grosero, vulgar, satirico)',
  ],

  /**
   * Instrucciones base del prompt. Se interpola con:
   * - {{action}}: "mergeado" | "cerrado/rechazado"
   * - {{context}}: contexto del PR
   * - {{style}}: estilo elegido
   * - {{author}}: autor del PR
   * - {{maxChars}}: maxChars
   */
  promptTemplate: `Genera UNA burla sarcástica en español sobre por qué este PR fue {{action}}.
Contexto: {{context}}
Estilo: {{style}}. Menciona a @{{author}}. Máximo {{maxChars}} caracteres.
Salida: solo la frase, sin comillas ni prefijos.`,
};
