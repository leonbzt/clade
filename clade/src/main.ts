// Clade (the rebuild): for now the bare map of the sea's ground (N0). The theme's colours come from the palette.
import 'pixi.js/unsafe-eval'; // works where the page's host forbids eval
import { mount } from 'svelte';
import { css, P } from './data/palette';
import App from './ui/App.svelte';

for (const [name, i] of Object.entries(P)) document.documentElement.style.setProperty(`--${name}`, css(i));
mount(App, { target: document.getElementById('app')! });
