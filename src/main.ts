import { mount } from 'svelte';
import App from './ui/App.svelte';
import './ui/app.css';
import { start } from './ui/state.svelte';

start();
mount(App, { target: document.getElementById('app')! });
