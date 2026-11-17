// Clade (the rebuild): for now the bare map of the sea's ground (N0). The theme's colours come from the palette.
import 'pixi.js/unsafe-eval'; // works where the page's host forbids eval
import { mount } from 'svelte';
import { css, P } from './data/palette';
import App from './ui/App.svelte';
import BuildToy from './ui/toy/BuildToy.svelte';
import KitToy from './ui/toy/KitToy.svelte';

for (const [name, i] of Object.entries(P)) document.documentElement.style.setProperty(`--${name}`, css(i));
const toy = new URLSearchParams(location.search).get('toy');
mount(toy === 'kit' ? KitToy : toy === 'build' ? BuildToy : App,
  { target: document.getElementById('app')! });
