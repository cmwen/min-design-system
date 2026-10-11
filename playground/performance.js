import { initTheme } from './theme.js';
initTheme();
document.querySelector('#perf-wave').addEventListener('change', (event) => {
  document.querySelector('#perf-surfaces').dataset.ffWave = event.target.checked ? 'soft' : 'off';
});
