// The copy-species code (slice 15): one of your lines as a short code for the Discord. Pasting a friend's code brings
// their species into your garden as a visitor in that niche: it competes for room, it never spreads.
import type { Role } from '../data/garden';
import { HABITATS, type HabitatId } from '../data/habitats';
import { MAX_VERBS, PARTS, PLANS, VERBS, type PartId, type PlanId, type VerbId } from '../data/life';
import { newLife, startParts, verbs as lifeVerbs } from './life';
import { tierName, type Garden, type News } from './garden';

export interface Species { plan: PlanId; role: Role; hab: HabitatId; eggs: number; form?: PartId; verbs: VerbId[]; name: string }
const PREFIX = 'CLADE-';
const sum = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).slice(-4).padStart(4, '0');
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encode(sp: Species): string {
  const body = b64(JSON.stringify([sp.plan, sp.role, sp.hab, sp.eggs, sp.form ?? '', sp.verbs, sp.name.slice(0, 24)]));
  return `${PREFIX}${body}-${sum(body)}`;
}

/** A code back to a species, or null if it isn't a valid one. */
export function decode(code: string): Species | null {
  const m = code.trim().match(/^CLADE-([A-Za-z0-9_-]+)-([0-9a-z]{4})$/);
  if (!m || sum(m[1]) !== m[2]) return null;
  try {
    const fields = JSON.parse(unb64(m[1]));
    if (!Array.isArray(fields) || fields.length !== 7) return null;
    const [plan, role, hab, eggs, form, verbs, name] = fields;
    if (!Object.hasOwn(PLANS, plan) || !Object.hasOwn(HABITATS, hab) || !['grazer', 'burrower', 'predator'].includes(role)) return null;
    if (typeof eggs !== 'number' || !Number.isFinite(eggs) || eggs < 0 || eggs > 200 || !Array.isArray(verbs)
      || verbs.length > MAX_VERBS || !verbs.every((v) => typeof v === 'string' && Object.hasOwn(VERBS, v))
      || (form !== '' && (typeof form !== 'string' || !Object.hasOwn(PARTS, form)))) return null;
    return { plan, role, hab, eggs: Math.round(eggs), form: form || undefined, verbs, name: String(name || 'A friend').slice(0, 24) };
  } catch { return null; }
}

/** Old codes still decode, but now describe a starting build. They never add visitors or grant the encoded score. */
export function designProblem(sp: Species): string | null {
  if (sp.form && !PARTS[sp.form].plans.includes(sp.plan)) return 'That form does not fit this body.';
  const parts = startParts(sp.plan, sp.verbs, sp.form), l = newLife(1, sp.plan, HABITATS[sp.hab], parts);
  return l.order.length !== parts.length || new Set(parts.map((p) => PARTS[p].verb).filter(Boolean)).size > MAX_VERBS
    ? 'That design has more parts or verbs than its starting body can hold.' : null;
}

/** Export a starting design that fits, using the representative build's verbs and the kept form. */
export function designVerbs(plan: PlanId, parts: PartId[], form?: PartId): VerbId[] {
  const out: VerbId[] = [];
  for (const p of parts) {
    const v = PARTS[p].verb;
    if (v && !out.includes(v) && !designProblem({ plan, role: 'grazer', hab: 'mud', eggs: 0, form, verbs: [...out, v], name: '' })) out.push(v);
  }
  return lifeVerbs(newLife(1, plan, HABITATS.mud, startParts(plan, out, form)));
}

/** A friend's species joins your garden as a visitor in its niche. */
export function addVisitor(g: Garden, sp: Species): News {
  const h = g.habs[sp.hab], id = `visitor:${sp.name}:${sp.plan}:${sp.role}`, found = h.entries.find((e) => e.sp === id);
  if (found) { found.score = Math.max(found.score, sp.eggs); found.pop += sp.eggs; }
  else h.entries.push({ sp: id, name: sp.name, role: sp.role, pop: Math.max(4, sp.eggs), score: sp.eggs, proven: true });
  const news: News = { gen: g.gen, hab: sp.hab, yours: true, text: `${sp.name} arrived in the ${HABITATS[sp.hab].name.toLowerCase()}`, why: `a friend's ${PLANS[sp.plan].name.toLowerCase()} line, ranked ${tierName(sp.hab, sp.eggs)} among the ${sp.role === 'predator' ? 'hunters' : sp.role + 's'}. Beat it` };
  g.news = [news, ...g.news].slice(0, 80);
  return news;
}
