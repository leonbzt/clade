// The copy-species code (slice 15): one of your lines as a short code for the Discord. Pasting a friend's code brings
// their species into your garden as a visitor in that niche: it competes for room, it never spreads.
import type { Role } from '../data/garden';
import { HABITATS, type HabitatId } from '../data/habitats';
import { PARTS, PLANS, VERBS, type PartId, type PlanId, type VerbId } from '../data/life';
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
    const [plan, role, hab, eggs, form, verbs, name] = JSON.parse(unb64(m[1]));
    if (!PLANS[plan as PlanId] || !HABITATS[hab as HabitatId] || !['grazer', 'burrower', 'predator'].includes(role)) return null;
    if (typeof eggs !== 'number' || eggs < 0 || eggs > 200) return null;
    return { plan, role, hab, eggs: Math.round(eggs), form: PARTS[form as PartId] ? form : undefined, verbs: (verbs as VerbId[]).filter((v) => VERBS[v]).slice(0, 3), name: String(name || 'A friend').slice(0, 24) };
  } catch { return null; }
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
