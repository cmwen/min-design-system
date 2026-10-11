import { initTheme } from './theme.js';
import { createTheme } from '../src/theme.js';

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

const shapeControls = [
  '#shape-seed',
  '#shape-variation',
  '#shape-preset',
  '#wave-enabled',
  '#wave-strength',
  '#wave-count-top',
  '#wave-count-right',
  '#wave-count-bottom',
  '#wave-count-left',
  '#border-width',
  '#sample-size',
];
const shapeStorageKey = 'forest-and-fern-shape-v1';
try {
  const saved = JSON.parse(localStorage.getItem(shapeStorageKey));
  for (const selector of shapeControls) {
    const control = $(selector);
    const value = saved?.[control.id];
    if (control.type === 'checkbox' && typeof value === 'boolean') control.checked = value;
    else if (typeof value === 'string') {
      if (control.tagName === 'SELECT') {
        if ([...control.options].some((option) => option.value === value)) control.value = value;
      } else if (control.type === 'range') {
        if (Number.isFinite(Number(value))) control.value = value;
      } else control.value = value.slice(0, 200);
    }
  }
} catch {
  /* Storage is optional; malformed settings use defaults. */
}
let generatedTheme;
let generatedCSS;
function updateShape() {
  const shape = $('#shape-preset').value;
  const strength = $('#wave-enabled').checked ? Number($('#wave-strength').value) : 0;
  const border = $('#border-width').value;
  const size = $('#sample-size').value;
  const preview = $('#shape-preview');
  const seed = $('#shape-seed').value || 'forest-and-fern';
  const variation = Number($('#shape-variation').value);
  const waveCounts = Object.fromEntries(
    ['top', 'right', 'bottom', 'left'].map((edge) => {
      const count = Number($(`#wave-count-${edge}`).value);
      $(`#wave-count-${edge}-output`).value = String(count);
      return [edge, count];
    }),
  );
  generatedTheme = createTheme({ seed, shape, variation, waveStrength: strength, waveCounts });
  preview.dataset.ffShape = shape;
  generatedTheme.apply(preview);
  preview.style.setProperty('--ff-border-width', `${border}px`);
  generatedCSS = generatedTheme.toCSS().replace('\n}', `\n  --ff-border-width: ${border}px;\n}`);
  $('#shape-stage').style.setProperty('--sample-width', `${size}px`);
  $('#wave-output').value = String(strength);
  $('#border-output').value = `${border} px`;
  $('#size-output').value = `${size} px`;
  $('#variation-output').value = `${Math.round(variation * 100)}%`;
  $('#shape-code').textContent =
    `<!-- Load the library CSS, then your exported theme CSS. -->\n<section class="ff-theme ff-seeded-theme" data-ff-theme="light">\n  <article class="ff-card">Your content stays native.</article>\n</section>\n\n// Optional JavaScript alternative (generator v1):\nimport { createTheme } from '@cmwen/min-design-system/theme';\nconst theme = createTheme(${JSON.stringify({ seed, shape, variation, waveStrength: strength, waveCounts }, null, 2)});\ntheme.apply(document.querySelector('.ff-theme'));`;
  try {
    localStorage.setItem(
      shapeStorageKey,
      JSON.stringify(
        Object.fromEntries(
          shapeControls.map((selector) => {
            const control = $(selector);
            return [control.id, control.type === 'checkbox' ? control.checked : control.value];
          }),
        ),
      ),
    );
  } catch {
    /* Storage is optional. */
  }
}
shapeControls.forEach((selector) => $(selector).addEventListener('input', updateShape));
$('#shape-randomize').addEventListener('click', () => {
  const bytes = crypto.getRandomValues(new Uint32Array(2));
  $('#shape-seed').value = [...bytes].map((value) => value.toString(16).padStart(8, '0')).join('');
  updateShape();
  $('#shape-status').textContent =
    `New seed: ${generatedTheme.seed}. Increase variation if you want more difference between seeds.`;
});
$('#shape-export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([generatedCSS], { type: 'text/css' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'forest-and-fern-seeded-theme.css';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#shape-status').textContent =
    'CSS exported. Load it after the library stylesheet and add ff-seeded-theme to your theme boundary.';
});
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
