import { describe, expect, it } from 'vitest';
import { outputFileName } from 'src/lib/output-file';

describe('outputFileName', () => {
  it('adds the suffix before a regular extension', () => {
    expect(outputFileName('video.mp4', 'converted')).toBe('video-converted.mp4');
  });

  it('preserves compound archive extensions and directories', () => {
    expect(outputFileName('/tmp/archive.tar.gz', 'ready')).toBe('/tmp/archive-ready.tar.gz');
  });

  it('handles files without an extension', () => {
    expect(outputFileName('README', 'copy')).toBe('README-copy');
  });
});
