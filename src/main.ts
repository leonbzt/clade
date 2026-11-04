import { mount } from 'svelte';
import App from './ui/App.svelte';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './ui/app.css';
import { start } from './ui/state.svelte';

start();
mount(App, { target: document.getElementById('app')! });
