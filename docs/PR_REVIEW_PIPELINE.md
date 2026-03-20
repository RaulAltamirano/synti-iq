# PR Review Pipeline — SonarCloud, IA y Discord

Pipeline de revisión automática de Pull Requests que integra SonarCloud, Gemini (IA) y notificaciones Discord.

---

## Resumen del Flujo

| Evento PR                | Acciones                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `opened` / `synchronize` | Análisis SonarCloud, revisión IA (Gemini), comentario en el PR                            |
| `closed`                 | Notificación a Discord con status (MERGED/REJECTED), roast, calificación y métricas Sonar |

---

## Configuración Requerida

### 1. SonarCloud

1. Crear cuenta en [SonarCloud](https://sonarcloud.io).
2. Importar el repositorio y configurar el proyecto con ID `RaulAltamirano_synti-iq`.
3. Generar token: **My Account > Security > Generate Token**.
4. Añadir en GitHub: **Settings > Secrets and variables > Actions** → `SONAR_TOKEN`.

El archivo `sonar-project.properties` en la raíz define:

- `sonar.organization=RaulAltamirano`
- `sonar.projectKey=RaulAltamirano_synti-iq`
- Rutas de fuentes, tests y coverage.

### 2. Gemini (Google AI)

1. Obtener API key en [Google AI Studio](https://aistudio.google.com/apikey).
2. Añadir en GitHub Secrets: `GEMINI_API_KEY`.

### 3. Discord

1. En el canal de desarrolladores: **Configuración del canal > Integraciones > Webhooks > Nuevo webhook**.
2. Copiar la URL del webhook.
3. Añadir en GitHub Secrets: `DISCORD_WEBHOOK`.

---

## Secrets Necesarios

| Secret            | Descripción                   |
| ----------------- | ----------------------------- |
| `SONAR_TOKEN`     | Token de SonarCloud           |
| `GEMINI_API_KEY`  | API key de Google AI (Gemini) |
| `DISCORD_WEBHOOK` | URL del webhook de Discord    |

`GITHUB_TOKEN` se inyecta automáticamente por GitHub Actions.

> **Nota:** Las variables del pipeline están documentadas en [.env.example](../.env.example) (sección PR Review Pipeline). Se configuran como **Secrets** en GitHub, no en `.env` local.

---

## Archivos del Pipeline

| Archivo                           | Propósito                                     |
| --------------------------------- | --------------------------------------------- |
| `.github/workflows/pr-review.yml` | Workflow principal                            |
| `sonar-project.properties`        | Configuración SonarCloud                      |
| `scripts/pr-review.js`            | Extrae diff, llama a Gemini, comenta en el PR |
| `scripts/discord-notify.js`       | Envía embed a Discord                         |

---

## Formato del Comentario en GitHub

El bot publica un comentario con esta estructura:

```
🤖 AI Technical Assistant - Review

**IA Roast:** "[frase sarcástica en español]"

**Análisis de Convenciones:**
- [hallazgos según code-review.md]

**Seguridad (SonarCloud):**
- [observaciones de seguridad]

**Veredicto:** ✅ Aprobado / ❌ Cambios Requeridos. [resumen]

**Calificación:** X/5
```

---

## Formato del Mensaje en Discord

Embed tipo Card con:

- **Título:** Synti-IQ Review: Pull Request #N
- **Status:** MERGED (verde) / REJECTED (rojo)
- **IA Roast:** Cita del roast extraído del comentario
- **Calificación:** Estrellas (1–5) y nivel
- **Sonar Stats:** Bugs, Security Hotspots, Vulnerabilities
- **Link:** Enlace al PR en GitHub

---

## Troubleshooting

| Problema                   | Posible causa                                      | Solución                                                                                       |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| SonarCloud falla           | Token inválido o proyecto no existe                | Verificar `SONAR_TOKEN` y `projectKey` en SonarCloud                                           |
| Gemini no responde         | API key inválida o rate limit                      | Comprobar `GEMINI_API_KEY`; reducir frecuencia de PRs                                          |
| Gemini 404 NOT_FOUND       | Modelo deprecado o no disponible                   | El script usa `gemini-2.5-flash`. Ver [modelos](https://ai.google.dev/gemini-api/docs/models). |
| Discord no recibe mensaje  | Webhook incorrecto o revocado                      | Regenerar webhook y actualizar `DISCORD_WEBHOOK`                                               |
| discord-notify exit code 1 | Webhook vacío (PR desde fork), URL inválida, 4xx   | Ver logs: "Response:" muestra error de Discord. PRs desde fork no reciben secrets.             |
| Diff truncado              | PR muy grande                                      | El script limita a 2000 líneas / 50KB; considerar PRs más pequeños                             |
| Roast vacío en Discord     | El comentario del bot no tiene el formato esperado | Revisar que el prompt en `pr-review.js` pida **IA Roast:** y **Calificación:**                 |

---

## Referencias

- [AGENTS.md](../AGENTS.md)
- [docs/prompts/code-review.md](prompts/code-review.md)
- [SonarCloud GitHub Actions](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [Discord Webhook Embeds](https://discord.com/developers/docs/resources/channel#embed-object)
