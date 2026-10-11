import { initTheme } from './theme.js';
initTheme();
const form = document.querySelector('#project-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const summary = document.querySelector('#project-summary');
  summary.replaceChildren();
  [
    ['Project', values.get('project')],
    ['Contact', values.get('email')],
    ['Type', values.get('kind')],
    ['Pace', values.get('pace')],
    ['Updates', values.has('updates') ? 'Weekly' : 'Off'],
    ['Organic surfaces', values.has('organic') ? 'On' : 'Off'],
  ].forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'detail-row';
    const dt = document.createElement('dt');
    dt.textContent = key;
    const dd = document.createElement('dd');
    dd.textContent = value;
    row.append(dt, dd);
    summary.append(row);
  });
  document.querySelector('#project-result').hidden = false;
  status.textContent = `Created ${values.get('project')} locally. No data was sent.`;
});
form.addEventListener('reset', () => {
  document.querySelector('#project-result').hidden = true;
  status.textContent = 'A fresh start. Your new project will appear here.';
});
