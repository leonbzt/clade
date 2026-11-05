// The dev panel: the five feel values as sliders, live. "Copy values" puts them on the clipboard (and shows them)
// so you can paste them into the chat or into DEFAULTS in feel.ts.
import { DEFAULTS, FEEL_SPEC, LOOK_SPEC, feel, setFeel, type FeelKey } from './feel';

const $ = (id: string) => document.getElementById(id)!;

export function devPanel() {
  const panel = $('dev'), out = $('devOut');
  const build = (box: HTMLElement, spec: readonly { key: FeelKey; label: string; min: number; max: number; step: number; unit: string; hint: string }[]) => {
    for (const s of spec) {
      const row = document.createElement('div');
      row.className = 'slider';
      row.innerHTML = `<label for="f-${s.key}">${s.label}</label><output id="o-${s.key}"></output>` +
        `<input id="f-${s.key}" type="range" min="${s.min}" max="${s.max}" step="${s.step}"><small>${s.hint}</small>`;
      box.appendChild(row);
      const input = row.querySelector('input')!, o = row.querySelector('output')!;
      const show = () => { input.value = String(feel[s.key]); o.textContent = `${+feel[s.key].toFixed(2)} ${s.unit}`; };
      input.oninput = () => { setFeel(s.key, +input.value); show(); };
      show();
      shows.push(show);
    }
  };
  const shows: (() => void)[] = [];
  build($('devFeel'), FEEL_SPEC);
  build($('devLook'), LOOK_SPEC);
  const text = () => FEEL_SPEC.map((s) => `${s.key}: ${+feel[s.key].toFixed(2)}`).join(', ') + ` (pixel: ${feel.pixel})`;
  $('devCopy').onclick = () => {
    out.hidden = false; out.textContent = text();
    navigator.clipboard?.writeText(text()).then(() => { out.textContent = `${text()}\ncopied`; }, () => {});
  };
  $('devReset').onclick = () => { for (const k of Object.keys(DEFAULTS) as FeelKey[]) setFeel(k, DEFAULTS[k]); shows.forEach((f) => f()); };
  const toggle = () => { panel.hidden = !panel.hidden; };
  $('devBtn').onclick = toggle;
  if (!import.meta.env.DEV) $('devBtn').style.display = 'none'; // players don't see it; ` still opens the panel
  $('devClose').onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.key === '`') toggle(); });
}
