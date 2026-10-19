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

export interface WelcomeBusinessProps {
  firstName: string;
  businessName: string;
  appUrl?: string;
  logoUrl?: string;
}

const colors = {
  primary: '#2563eb',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

export function WelcomeBusiness({
  firstName,
  businessName,
  appUrl = 'https://app.syntiiq.com',
  logoUrl,
}: WelcomeBusinessProps) {
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

      <Preview>Welcome to Synti-IQ. Your account for {businessName} is ready.</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Hero */}
          <Section style={styles.heroSection}>
            <Img src={logoSrc} alt="Synti-IQ" width={56} height={56} style={styles.logo} />

            <Heading style={styles.heroTitle}>Welcome, {firstName}</Heading>

            <Text style={styles.heroSubtitle}>
              Your account for <strong style={{ color: colors.text }}>{businessName}</strong> has
              been created successfully. You can now configure your business and start selling.
            </Text>

            <Button href={appUrl} style={styles.primaryButton}>
              Go to dashboard
            </Button>

            <Text style={styles.heroFootnote}>Sign in with the email you used to register.</Text>

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
              You received this email because you registered a business on Synti-IQ. If this wasn't
              you, you can ignore this message.
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

export default WelcomeBusiness;
