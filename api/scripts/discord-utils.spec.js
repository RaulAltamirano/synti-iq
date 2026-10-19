const {
  truncate,
  truncateAtSentence,
  formatRating,
  formatSonarStats,
  buildWorkflowField,
  validateWebhook,
  sanitizeForEmbed,
  RATING_LABELS,
  EMBED_CHAR_LIMIT,
  FIELD_VALUE_LIMIT,
} = require('./discord-utils');

describe('discord-utils', () => {
  const originalExit = process.exit;

  beforeEach(() => {
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe('truncate', () => {
    it('returns string unchanged when within limit', () => {
      expect(truncate('hello', 10)).toBe('hello');
      expect(truncate('', 5)).toBe('');
    });

    it('truncates and appends ... when over limit', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('abcdefghij', 5)).toBe('ab...');
    });

    it('handles null/undefined', () => {
      expect(truncate(null, 10)).toBe('');
    });
  });

  describe('truncateAtSentence', () => {
    it('returns text unchanged when within limit', () => {
      const text = 'Short text.';
      expect(truncateAtSentence(text, 50)).toBe(text);
    });

    it('truncates at sentence boundary when possible', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      expect(truncateAtSentence(text, 25)).toMatch(/First sentence\.?$/);
    });

    it('truncates at newline when no period', () => {
      const text = 'Line one\nLine two\nLine three';
      expect(truncateAtSentence(text, 15)).toMatch(/Line one/);
    });

    it('returns empty for null/undefined', () => {
      expect(truncateAtSentence(null, 50)).toBe('');
    });
  });

  describe('formatRating', () => {
    it('returns stars and level for valid rating', () => {
      const r3 = formatRating(3);
      expect(r3.stars).toBe('⭐⭐⭐☆☆');
      expect(r3.levelLabel).toBe('Level: Acceptable');

      const r5 = formatRating(5);
      expect(r5.stars).toBe('⭐⭐⭐⭐⭐');
      expect(r5.levelLabel).toBe('Level: Code god');
    });

    it('clamps rating to 1-5', () => {
      expect(formatRating(0).levelLabel).toBe('Level: Nuclear disaster');
      expect(formatRating(10).levelLabel).toBe('Level: Code god');
    });

    it('defaults to 3 for invalid input', () => {
      const r = formatRating('x');
      expect(r.levelLabel).toBe('Level: Acceptable');
    });
  });

  describe('formatSonarStats', () => {
    it('returns fallback when all zero', () => {
      expect(formatSonarStats('0', '0', '0')).toBe('✅ No critical findings');
      expect(formatSonarStats('0', '0', '0', 'Custom fallback')).toBe('Custom fallback');
    });

    it('includes non-zero stats', () => {
      expect(formatSonarStats('2', '0', '0')).toContain('🔴');
      expect(formatSonarStats('2', '0', '0')).toContain('2 Bugs');
      expect(formatSonarStats('0', '1', '0')).toContain('⚠️');
      expect(formatSonarStats('0', '1', '0')).toContain('Security Hotspots');
      expect(formatSonarStats('0', '0', '3')).toContain('🟠');
      expect(formatSonarStats('0', '0', '3')).toContain('Vulnerabilities');
    });

    it('combines multiple stats', () => {
      const result = formatSonarStats('1', '2', '3');
      expect(result).toContain('1 Bugs');
      expect(result).toContain('2 Security Hotspots');
      expect(result).toContain('3 Vulnerabilities');
    });
  });

  describe('buildWorkflowField', () => {
    it('returns null for empty url', () => {
      expect(buildWorkflowField('')).toBeNull();
      expect(buildWorkflowField(null)).toBeNull();
    });

    it('returns field object for valid url', () => {
      const field = buildWorkflowField('https://github.com/owner/repo/actions/runs/123');
      expect(field).toEqual({
        name: 'Workflow',
        value: '[View run](https://github.com/owner/repo/actions/runs/123)',
        inline: false,
      });
    });

    it('includes duration when provided', () => {
      const field = buildWorkflowField('https://github.com/owner/repo/actions/runs/123', '3m 42s');
      expect(field.value).toContain('[View run]');
      expect(field.value).toContain('3m 42s');
    });
  });

  describe('validateWebhook', () => {
    it('exits when webhook is empty', () => {
      validateWebhook('');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('exits when webhook is null', () => {
      validateWebhook(null);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('exits when webhook does not start with discord API prefix', () => {
      validateWebhook('https://evil.com/webhook');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('does not exit for valid webhook', () => {
      validateWebhook('https://discord.com/api/webhooks/123/abc');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeForEmbed', () => {
    it('replaces backticks to avoid breaking embed', () => {
      expect(sanitizeForEmbed('code `inline`')).toBe("code 'inline'");
      expect(sanitizeForEmbed('`single`')).toBe("'single'");
    });

    it('returns empty for null/undefined', () => {
      expect(sanitizeForEmbed(null)).toBe('');
      expect(sanitizeForEmbed(undefined)).toBe('');
    });
  });

  describe('constants', () => {
    it('exports RATING_LABELS with 5 items', () => {
      expect(RATING_LABELS).toHaveLength(5);
      expect(RATING_LABELS[0]).toContain('Nuclear');
    });

    it('exports Discord limits', () => {
      expect(EMBED_CHAR_LIMIT).toBe(6000);
      expect(FIELD_VALUE_LIMIT).toBe(1024);
    });
  });
});
