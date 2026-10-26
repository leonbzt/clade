import { mount } from 'svelte';
import App from './ui/App.svelte';
import { start } from './ui/game.svelte';

start();
mount(App, { target: document.getElementById('app')! });
