import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Font,
  Img,
} from '@react-email/components';

export interface CashierInvitationProps {
  firstName: string;
  setPasswordUrl: string;
  logoUrl?: string;
  appUrl?: string;
  /** Shown in inbox preheader when email is redirected to a sandbox inbox (not the real recipient) */
  sandboxIntendedEmail?: string;
}

const colors = {
  primary: '#2563eb',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  sandboxBanner: '#eff6ff',
  sandboxBorder: '#bfdbfe',
};

export function CashierInvitation({
  firstName,
  setPasswordUrl,
  logoUrl,
  appUrl = 'https://app.syntiiq.com',
  sandboxIntendedEmail,
}: CashierInvitationProps) {
  const logoSrc = logoUrl ?? `${appUrl.replace(/\/$/, '')}/logo.svg`;

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5.2.8/files/dm-sans-latin-400-normal.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="DM Serif Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/dm-serif-display@5.0.0/files/dm-serif-display-latin-400-normal.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>
        {sandboxIntendedEmail ? `Sandbox delivery — real recipient: ${sandboxIntendedEmail}. ` : ''}
        Welcome to Synti-IQ. Complete your cashier account by setting your password.
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Hero */}
          <Section style={styles.heroSection}>
            <Img src={logoSrc} alt="Synti-IQ" width={56} height={56} style={styles.logo} />

            {sandboxIntendedEmail ? (
              <Section style={styles.sandboxBanner}>
                <Text style={styles.sandboxBannerText}>
                  <strong>Test delivery</strong> — this message was routed to a sandbox inbox.
                  Intended recipient: {sandboxIntendedEmail}
                </Text>
              </Section>
            ) : null}

            <Heading style={styles.heroTitle}>Welcome, {firstName}</Heading>

            <Text style={styles.heroSubtitle}>
              A store administrator has invited you to join{' '}
              <strong style={{ color: colors.text }}>Synti-IQ</strong> as a{' '}
              <strong style={{ color: colors.text }}>cashier</strong>. Create your password to
              activate your account and sign in to the point of sale.
            </Text>

            <Button href={setPasswordUrl} style={styles.primaryButton}>
              Create your password
            </Button>

            <Text style={styles.heroFootnote}>
              Use the email address this invitation was sent to when you sign in. This link is for
              one-time use only and expires after a limited time.
            </Text>

            <Text style={styles.signature}>
              Best regards,
              <br />
              <strong>The Synti-IQ Team</strong>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footerSection}>
            <Text style={styles.legalText}>
              You received this email because a store administrator invited you to Synti-IQ. If you
              did not expect this invitation, you can safely ignore this message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: colors.background,
    fontFamily: "'DM Sans', Helvetica, Arial, sans-serif",
    margin: '0',
    padding: '32px 0',
  },

  container: {
    maxWidth: '520px',
    margin: '0 auto',
    backgroundColor: colors.card,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },

  heroSection: {
    padding: '48px 40px 32px',
    textAlign: 'center',
  },

  sandboxBanner: {
    margin: '0 0 24px',
    padding: '12px 16px',
    backgroundColor: colors.sandboxBanner,
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.sandboxBorder,
    textAlign: 'center',
  },

  sandboxBannerText: {
    fontSize: '12px',
    color: colors.textMuted,
    lineHeight: '1.6',
    margin: '0',
  },

  logo: {
    display: 'block',
    margin: '0 auto 20px',
  },

  heroTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '28px',
    fontWeight: 400,
    color: colors.text,
    lineHeight: '1.3',
    margin: '0 0 16px',
  },

  heroSubtitle: {
    fontSize: '15px',
    color: colors.textMuted,
    lineHeight: '1.7',
    margin: '0 0 28px',
  },

  primaryButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '8px',
    padding: '14px 32px',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.01em',
  },

  heroFootnote: {
    fontSize: '13px',
    color: colors.textMuted,
    margin: '24px 0 0',
    lineHeight: '1.6',
  },

  signature: {
    fontSize: '14px',
    color: colors.textMuted,
    margin: '20px 0 0',
    lineHeight: '1.6',
  },

  divider: {
    borderColor: colors.border,
    borderTopWidth: '1px',
    margin: '0',
  },

  footerSection: {
    padding: '28px 40px 36px',
    textAlign: 'center',
    backgroundColor: colors.background,
  },

  legalText: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0',
  },
};

export default CashierInvitation;
