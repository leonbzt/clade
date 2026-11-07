// Toy 18: what the bodies cost, read from the source itself: lines per lineage, per gait, per part, and the shared code.
import bodySrc from './creature-body.ts?raw';
import dataSrc from './creature-data.ts?raw';
import gaitSrc from './creature-gait.ts?raw';
import partsSrc from './creature-parts.ts?raw';

/** Lines of the block that opens at two spaces with `name` and closes at `  }`. */
export function blockLines(src: string, name: string) {
  const lines = src.split('\n'), from = lines.findIndex((l) => l.startsWith(`  ${name}`));
  if (from < 0) return 0;
  const to = lines.findIndex((l, k) => k > from && l.startsWith('  }'));
  return to - from + 1;
}

export const lineageLines = (id: string) => blockLines(dataSrc, `${id}: {`);
export const gaitLines = (id: string) => blockLines(gaitSrc, `${id}: (b`);
export const partLines = (id: string) => blockLines(partsSrc, `${id}(b`);
export const SHARED = { body: bodySrc.split('\n').length, parts: partsSrc.split('\n').length };
