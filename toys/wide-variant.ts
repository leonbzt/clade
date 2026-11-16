// A variant's two builds and their readings, all on the same site and value scale.
import type { Variant } from '../clade/src/model/board';
import type { Build, Fitness, JobId, Site } from '../clade/src/model/types';
import { LADDER } from '../clade/src/data/roster/laws';
import { MUTATION } from '../clade/src/data/roster/mutations';
import { fitness } from '../clade/src/model/laws';
import { callName, dialWords, esc, generations } from './wide-say';

function side(title: string, b: Build, f: Fitness, other: Build, otherFit: Fitness): string {
  const words = dialWords(b), others = dialWords(other);
  const dials = words.map((w, i) => `<span class="${w !== others[i] ? 'changed' : ''}">${esc(w)}</span>`).join(' · ');
  const mutations = b.mutations.map((m) => `<div class="${other.mutations.includes(m) ? '' : 'changed'}">${esc(MUTATION[m].name)}: ${esc(MUTATION[m].does)}</div>`).join('') || '<div class="dim">No mutations</div>';
  return `<div><h3>${title}</h3><div>${esc(callName(b))} <b>${f.letter}</b> · ${f.value.toFixed(2)}</div><div>${dials}</div>
    ${f.reasons.map((r, i) => `<div class="reason${r !== otherFit.reasons[i] ? ' changed' : ''}">${esc(r || '—')}</div>`).join('')}
    ${mutations}</div>`;
}

/** A display scale, using the model's letter floors and both current readings. */
function valueBar(a: Fitness, b: Fitness): string {
  const max = Math.max(LADDER[0][1], a.value, b.value) * 1.1;
  const left = (value: number) => `${(value / max * 100).toFixed(2)}%`;
  const ticks = [...LADDER].reverse().map(([letter, value]) => `<span class="value-tick" style="left:${left(value)}" title="${letter} from ${value.toFixed(2)}">${letter}</span>`).join('');
  return `<div class="value-scale" role="img" aria-label="Population ${a.letter}, value ${a.value.toFixed(2)}; variant ${b.letter}, value ${b.value.toFixed(2)}">
    ${ticks}<span class="value-point" style="left:${left(a.value)}" title="Population ${a.value.toFixed(2)}">●</span>
    <span class="value-point variant-point" style="left:${left(b.value)}" title="Variant ${b.value.toFixed(2)}">◆</span></div>
    <div><span class="gold">● Population ${a.value.toFixed(2)}</span> · <span class="var">◆ Variant ${b.value.toFixed(2)}</span></div>`;
}

export function variantCard(holder: Build, v: Variant, job: JobId, site: Site, at: string): string {
  const a = fitness(holder, job, site), b = fitness(v.build, job, site);
  const fate = b.value > a.value ? `Takes the cell by itself in ${generations(v.left)}` : `Leaves in ${generations(v.left)} unless you adopt`;
  return `<div class="variant"><h2>A variant: ${esc(v.what)}</h2><div>${fate}</div>
    <div class="twin">${side('Your population', holder, a, v.build, b)}${side('The variant', v.build, b, holder, a)}</div>
    ${valueBar(a, b)}<button class="act" data-adopt="${esc(at)}">Adopt</button></div>`;
}
