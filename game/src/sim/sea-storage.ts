// Storage writes are single complete snapshots. Imports only replace the active save after a successful write.
import { parseSeaSave, serializeSeaSave, type SeaSave } from './sea-save';

export type SaveWriter = (json: string) => void;
export const SAVE_FAILURE = 'Your latest progress could not be saved. Keep this page open, retry saving, or copy your save from Menu before leaving.';

export function writeSeaSave(s: SeaSave, write: SaveWriter): string | null {
  try { write(serializeSeaSave(s)); return null; } catch { return SAVE_FAILURE; }
}

export function importSeaSave(text: string, write: SaveWriter): { save: SeaSave | null; message: string } {
  const parsed = parseSeaSave(text.trim());
  if (!parsed.save) return { save: null, message: parsed.problem === 'newer' ? 'That save is from a newer version.' : "That isn't a valid Clade save. Your current sea is unchanged." };
  const error = writeSeaSave(parsed.save, write);
  return error ? { save: null, message: 'The imported save could not be stored. Your current sea is unchanged.' } : { save: parsed.save, message: 'Save loaded.' };
}
