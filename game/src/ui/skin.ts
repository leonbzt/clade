// The menus' skin: a small stone texture made once and handed to CSS (--stone), so panels and buttons read as carved
// stone in a brass frame, the old-RPG way, without image files.
import { hash } from '../view/shade';

export function skin() {
  const N = 48, cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const g = cv.getContext('2d')!, img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const cell = hash(Math.floor(x / 6), Math.floor(y / 4), 61), grain = hash(x, y, 62), o = (y * N + x) * 4;
    const v = 0.5 + (cell - 0.5) * 0.35 + (grain - 0.5) * 0.25;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = v > 0.5 ? 255 : 0;
    img.data[o + 3] = Math.round(Math.abs(v - 0.5) * 2 * 40);
  }
  g.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--stone', `url(${cv.toDataURL()})`);
}
