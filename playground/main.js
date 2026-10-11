import { initTheme } from './theme.js';

initTheme();
const $ = (selector) => document.querySelector(selector);
const status = $('#status');
const palette = [
  ['Primary', '--ff-color-primary'],
  ['Background', '--ff-color-bg'],
  ['Surface', '--ff-color-surface'],
  ['Accent', '--ff-color-accent'],
  ['Text', '--ff-color-text'],
  ['Muted', '--ff-color-muted'],
];
function renderPalette() {
  const css = getComputedStyle(document.documentElement);
  $('#swatches').replaceChildren();
  $('#palette-inputs').replaceChildren();
  $('#palette-preview').removeAttribute('style');
  palette.forEach(([name, token]) => {
    const value = css.getPropertyValue(token).trim();
    const block = document.createElement('div');
    block.className = 'swatch';
    const color = document.createElement('div');
    color.className = 'swatch-color';
    color.style.background = value;
    const title = document.createElement('strong');
    title.textContent = name;
    const code = document.createElement('code');
    code.textContent = value;
    block.append(color, title, code);
    $('#swatches').append(block);
    const label = document.createElement('label');
    label.textContent = name;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.dataset.token = token;
    input.addEventListener('input', () =>
      $('#palette-preview').style.setProperty(token, input.value),
    );
    label.append(input);
    $('#palette-inputs').append(label);
  });
}
renderPalette();
document.addEventListener('ff:theme-change', renderPalette);
$('#palette-reset').addEventListener('click', renderPalette);

function updateShape() {
  const shape = $('#shape-preset').value;
  const strength = $('#wave-enabled').checked ? Number($('#wave-strength').value) : 0;
  const border = $('#border-width').value;
  const size = $('#sample-size').value;
  const preview = $('#shape-preview');
  preview.dataset.ffShape = shape;
  preview.dataset.ffWaveStrength = String(strength);
  preview.style.setProperty('--ff-border-width', `${border}px`);
  $('#shape-stage').style.setProperty('--sample-width', `${size}px`);
  $('#wave-output').value = String(strength);
  $('#border-output').value = `${border} px`;
  $('#size-output').value = `${size} px`;
  $('#shape-code').textContent =
    `<article class="ff-card"\n  data-ff-shape="${shape}"\n  data-ff-wave-strength="${strength}"\n  style="--ff-border-width: ${border}px">\n  Your content stays native.\n</article>`;
}
['#shape-preset', '#wave-enabled', '#wave-strength', '#border-width', '#sample-size'].forEach(
  (selector) => $(selector).addEventListener('input', updateShape),
);
updateShape();

function updateMotion() {
  const preview = $('#motion-preview');
  preview.dataset.ffMotion = $('#motion-preset').value;
  preview.dataset.ffReducedMotion = String($('#reduce-motion').checked);
}
$('#motion-preset').addEventListener('change', updateMotion);
$('#reduce-motion').addEventListener('change', updateMotion);
$('#press-sample').addEventListener('click', () => {
  status.textContent =
    'A gentle press. Native button activation works with pointer, Enter, or Space.';
});
$('#selected-sample').addEventListener('change', (event) => {
  status.textContent = event.target.checked
    ? 'Selected. A checkmark and color both indicate the state.'
    : 'Selection cleared.';
});
updateMotion();

$('#indeterminate').indeterminate = true;
const density = $('#density');
function updateDensity() {
  $('#density-output').value = `${density.value}%`;
}
density.addEventListener('input', updateDensity);
const form = $('#controls-form');
// This invalid field is a deliberate standalone state sample, outside submission.
$('#invalid-email').setAttribute('form', 'validation-state-demo');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  status.textContent = `Applied: ${values.get('project')} · ${values.get('layout')} layout · ${values.get('density')}% density · ${document.documentElement.dataset.ffTheme} theme.`;
});
form.addEventListener('reset', () => {
  requestAnimationFrame(() => {
    $('#indeterminate').indeterminate = true;
    updateDensity();
    status.textContent = 'Form fields reset to their starting values.';
  });
});
document.querySelectorAll('[data-notice]').forEach((button) =>
  button.addEventListener('click', () => {
    status.textContent = button.dataset.notice;
  }),
);

const sectionLinks = [...document.querySelectorAll('.sidebar a[href*="index.html#"]')];
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-10% 0px -65% 0px' },
);
['overview', 'theme-lab', 'shape-lab', 'motion-lab', 'native-controls'].forEach((id) =>
  observer.observe(document.getElementById(id)),
);
