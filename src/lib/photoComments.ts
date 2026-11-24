export type SanityPhotoComment = {
  _key: string;
  _type: 'photoComment';
  filename: string;
  comment: string;
};

export function stripExt(name?: string | null): string {
  return String(name || '').replace(/\.[^/.]+$/, '');
}

/**
 * Normalizes photo comments from either a filename->comment map or an array
 * into Sanity-ready `photoComment` array items, dropping empty comments.
 */
export function normalizePhotoComments(input: unknown): SanityPhotoComment[] {
  const entries: Array<[string, string]> = [];

  if (Array.isArray(input)) {
    for (const item of input) {
      if (item && typeof item === 'object') {
        const record = item as { filename?: unknown; comment?: unknown };
        const filename = stripExt(String(record.filename || '').trim());
        const comment = String(record.comment || '').trim();
        if (filename && comment) {
          entries.push([filename, comment]);
        }
      }
    }
  } else if (input && typeof input === 'object') {
    for (const [rawKey, rawVal] of Object.entries(input as Record<string, unknown>)) {
      const filename = stripExt(rawKey.trim());
      const comment = String(rawVal || '').trim();
      if (filename && comment) {
        entries.push([filename, comment]);
      }
    }
  }

  return entries.map(([filename, comment], index) => {
    const safeKeyPart = filename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
    return {
      _key: `c_${index}_${safeKeyPart || 'photo'}`,
      _type: 'photoComment',
      filename,
      comment,
    };
  });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
