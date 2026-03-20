# Mail Deliverability — Resend Best Practices

Auditoría contra los [Top 10 Email Deliverability Tips de Resend](https://resend.com/blog/top-10-email-deliverability-tips).

## Estado por recomendación

| # | Recomendación | Estado | Notas |
|---|---------------|--------|-------|
| 1 | **Usar subdominio** | ⚠️ Config | Usar `onboarding@notify.syntiiq.com` en lugar del dominio raíz. Configurar en Resend y `MAIL_FROM`. |
| 2 | **Configurar DMARC** | ⚠️ DNS | Añadir registro TXT `_dmarc.syntiiq.com` en el DNS. Ver [Resend DMARC](https://resend.com/docs/dashboard/domains/introduction). |
| 3 | **URLs coincidan con dominio** | ✅ OK | El template de bienvenida no incluye enlaces. Si añades links, que apunten a tu dominio. |
| 4 | **Evitar link/open tracking** | ✅ OK | No usamos tracking. El template es transaccional sin enlaces. |
| 5 | **Emails pequeños y accesibles** | ✅ OK | Template ligero (solo texto, sin imágenes). Resend genera HTML; considerar `text` alternativo si se añade HTML complejo. |
| 6 | **No usar dominios look-a-like** | ⚠️ Config | Evitar dominios que imiten la marca (ej. `syntiiq-mails.com`). |
| 7 | **Probar correctamente** | ✅ OK | Solo enviamos a usuarios que acaban de registrarse (opt-in implícito). No enviar a direcciones falsas. |
| 8 | **Lista de correos limpia** | ✅ OK | Solo enviamos a quien se registra. No enviar a unsubscribers. |
| 9 | **No usar no-reply** | ✅ OK | Default `onboarding@syntiiq.com` (evita `noreply@` que reduce confianza). |
| 10 | **Enviar de forma consistente** | ✅ OK | Volumen bajo y predecible (1 email por registro). |

## Cambios aplicados en código

- **MAIL_FROM default**: `onboarding@syntiiq.com` (antes `noreply@syntiiq.com`) — mejora confianza con proveedores de correo.
- **Normalización de sufijo `+`**: En sandbox, Resend solo acepta el correo exacto de registro. Si el destinatario usa un alias Gmail (`user+test@gmail.com`), se normaliza a `user@gmail.com` antes de enviar; el correo llega al mismo buzón.
- **Logo**: Se usa el logo de Synti-IQ desde `{FRONTEND_URL}/logo.svg`. El frontend debe servir `public/logo.svg` para que la imagen cargue en el correo.

## Checklist para producción

1. [ ] Verificar dominio en [Resend Dashboard](https://resend.com/domains)
2. [ ] Configurar SPF, DKIM y DMARC en DNS
3. [ ] Usar subdominio: `onboarding@notify.syntiiq.com` o similar
4. [ ] Definir `MAIL_FROM` en `.env` con el dominio verificado
