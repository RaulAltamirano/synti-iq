const path = require('path');
const fs = require('fs');
const { parseGeminiResponse, readFile } = require('../pr-review');

describe('parseGeminiResponse', () => {
  it('returns all fields when response is well-formed', () => {
    const text = `
**IA Roast:** "Nice try @author, but Homer would do better."

**Convention Analysis:**
- PASS - Location: src/foo.ts - Detail: Good structure - Reference: CONVENTIONS.md

**Security (SonarCloud):**
- No obvious security issues detected in diff.

**Verdict:** ✅ Approved. Looks good.

**Rating:** 4
`;
    const result = parseGeminiResponse(text);
    expect(result.roast).toContain('Homer');
    expect(result.conventionAnalysis).toContain('PASS');
    expect(result.security).toContain('No obvious');
    expect(result.verdict).toContain('Approved');
    expect(result.rating).toBe('4');
  });

  it('handles Security without (SonarCloud)', () => {
    const text = `
**IA Roast:** "Review completed."

**Convention Analysis:**
- N/A - No changes

**Security:**
- No issues found.

**Verdict:** ✅ Approved.

**Rating:** 5
`;
    const result = parseGeminiResponse(text);
    expect(result.security).toContain('No issues found');
    expect(result.rating).toBe('5');
  });

  it('uses fallbacks when convention is N/A', () => {
    const text = `
**IA Roast:** "Done."

**Convention Analysis:**
N/A

**Security (SonarCloud):**
- OK

**Verdict:** ✅ Approved.

**Rating:** 3
`;
    const result = parseGeminiResponse(text);
    expect(result.conventionAnalysis).toBe(
      'No specific findings. Consider running yarn quality locally.',
    );
  });

  it('uses fallbacks when verdict is empty', () => {
    const text = `
**IA Roast:** "Done."

**Convention Analysis:**
- PASS - Location: x - Detail: ok

**Security (SonarCloud):**
- OK

**Verdict:**


**Rating:** 3
`;
    const result = parseGeminiResponse(text);
    expect(result.verdict).toContain('Review incomplete');
  });

  it('handles missing IA Roast', () => {
    const text = `
**Convention Analysis:**
- PASS - ok

**Security (SonarCloud):**
- OK

**Verdict:** ✅ Approved.

**Rating:** 3
`;
    const result = parseGeminiResponse(text);
    expect(result.roast).toBe('Review completed.');
  });

  it('handles truncated or malformed response with only Rating', () => {
    const text = `**Rating:** 2`;
    const result = parseGeminiResponse(text);
    expect(result.rating).toBe('2');
    expect(result.roast).toBe('Review completed.');
    expect(result.conventionAnalysis).toContain('No specific findings');
    expect(result.security).toContain('No obvious security');
    expect(result.verdict).toContain('Review incomplete');
  });

  it('treats n/a and NA as empty for fallbacks', () => {
    const text = `
**Convention Analysis:**
n/a

**Security (SonarCloud):**
NA

**Verdict:** ✅ Approved.

**Rating:** 3
`;
    const result = parseGeminiResponse(text);
    expect(result.conventionAnalysis).toContain('No specific findings');
    expect(result.security).toContain('No obvious security');
  });
});

describe('readFile', () => {
  const root = path.resolve(__dirname, '../..');

  it('returns file content when file exists', () => {
    const content = readFile(root, 'package.json');
    expect(content).toContain('"name"');
    expect(content).toContain('synti-iq-api');
  });

  it('returns [Could not read X] when file missing', () => {
    const content = readFile(root, 'non-existent-file-xyz-12345.md');
    expect(content).toMatch(/Could not read/);
    expect(content).toContain('non-existent-file-xyz-12345');
  });
});
