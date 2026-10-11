import { initTabs } from '../src/tabs.js';
import { initTheme } from './theme.js';
initTheme();
const $ = (selector) => document.querySelector(selector);
const status = $('#component-status');
const projects = [
  { name: 'Canopy Dashboard', owner: 'Oliver Moss', status: 'Active', budget: 9450 },
  { name: 'Fern Journal', owner: 'Isla Brooks', status: 'Planning', budget: 3600 },
  { name: 'Forest Analytics', owner: 'Noah Hill', status: 'Active', budget: 12800 },
  { name: 'Moss & Meadow', owner: 'Ava Green', status: 'Complete', budget: 14200 },
  { name: 'Organic Studio', owner: 'Ava Green', status: 'Active', budget: 7680 },
  { name: 'Woodland Notes', owner: 'Isla Brooks', status: 'Planning', budget: 2400 },
];
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
let sortKey = 'name';
let ascending = true;
function renderTable() {
  const query = $('#table-search').value.trim().toLowerCase();
  const rows = projects.filter((project) =>
    `${project.name} ${project.owner}`.toLowerCase().includes(query),
  );
  rows.sort((a, b) => {
    const comparison =
      sortKey === 'budget' ? a.budget - b.budget : a[sortKey].localeCompare(b[sortKey]);
    return ascending ? comparison : -comparison;
  });
  $('#project-rows').replaceChildren(
    ...rows.map((project) => {
      const row = document.createElement('tr');
      for (const key of ['name', 'owner', 'status', 'budget']) {
        const cell = document.createElement(key === 'name' ? 'th' : 'td');
        if (key === 'name') cell.scope = 'row';
        if (key === 'budget') cell.dataset.ffNumeric = '';
        cell.textContent = key === 'budget' ? currency.format(project[key]) : project[key];
        row.append(cell);
      }
      return row;
    }),
  );
  document.querySelectorAll('[data-column]').forEach((header) => {
    if (header.dataset.column === sortKey)
      header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    else header.removeAttribute('aria-sort');
    header.querySelector('span').textContent =
      header.dataset.column === sortKey ? (ascending ? '↑' : '↓') : '↕';
  });
  $('#table-count').value = `${rows.length} project${rows.length === 1 ? '' : 's'}`;
  $('#table-empty').hidden = rows.length > 0;
  $('#table-status').textContent =
    `${rows.length} projects, sorted by ${sortKey}, ${ascending ? 'ascending' : 'descending'}.`;
}
$('#table-search').addEventListener('input', renderTable);
document.querySelectorAll('[data-sort]').forEach((button) =>
  button.addEventListener('click', () => {
    ascending = sortKey === button.dataset.sort ? !ascending : true;
    sortKey = button.dataset.sort;
    renderTable();
  }),
);
$('#table-compact').addEventListener('change', (event) => {
  $('#project-table').dataset.ffDensity = event.target.checked ? 'compact' : 'comfortable';
});
renderTable();

const revenue = [72000, 88000, 82000, 106000, 114000, 128400];
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const ns = 'http://www.w3.org/2000/svg';
function svgElement(tag, attributes, text) {
  const element = document.createElementNS(ns, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text) element.textContent = text;
  return element;
}
function renderChart() {
  const type = $('#chart-type').value;
  const marks = $('#revenue-chart-marks');
  const points = revenue.map((value, index) => [60 + index * 100, 210 - (value / 150000) * 180]);
  const elements = [];
  for (let value = 0; value <= 150000; value += 50000) {
    const y = 210 - (value / 150000) * 180;
    elements.push(svgElement('path', { class: 'ff-chart-grid', d: `M50 ${y}H585` }));
    elements.push(svgElement('text', { x: 8, y: y + 5 }, value ? `${value / 1000}k` : '0'));
  }
  months.forEach((month, index) =>
    elements.push(
      svgElement('text', { x: points[index][0], y: 244, 'text-anchor': 'middle' }, month),
    ),
  );
  if (type === 'line') {
    const path = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join(' ');
    elements.push(svgElement('path', { class: 'ff-chart-area', d: `${path}L560 210H60Z` }));
    elements.push(svgElement('path', { class: 'ff-chart-line', d: path }));
    points.forEach(([cx, cy]) =>
      elements.push(svgElement('circle', { class: 'ff-chart-point', cx, cy, r: 4 })),
    );
  } else {
    points.forEach(([x, y]) =>
      elements.push(
        svgElement('rect', {
          class: 'ff-chart-bar',
          x: x - 20,
          y,
          width: 40,
          height: 210 - y,
          rx: 6,
        }),
      ),
    );
  }
  marks.replaceChildren(...elements);
  $('#revenue-chart-title').textContent = `Monthly revenue, ${type} chart`;
  $('#chart-status').textContent =
    `Showing the ${type} chart. Exact values are in the revenue data table.`;
}
$('#chart-type').addEventListener('change', renderChart);
renderChart();

const dialog = $('#project-dialog');
const dialogTrigger = $('#open-project-dialog');
if (typeof dialog.showModal === 'function') {
  dialogTrigger.addEventListener('click', () => {
    $('#dialog-form').reset();
    dialog.returnValue = '';
    dialog.showModal();
  });
} else {
  // Don't imitate a modal without native focus containment/inert behavior.
  dialogTrigger.hidden = true;
  dialog.dataset.ffInline = '';
  dialog.setAttribute('open', '');
  $('#dialog-form').method = 'get';
  $('#dialog-close').hidden = true;
  $('#dialog-cancel').hidden = true;
  $('#dialog-description').textContent =
    'Your browser displays this form inline. The result stays in this demo.';
}
[$('#dialog-close'), $('#dialog-cancel')].forEach((button) =>
  button.addEventListener('click', () => dialog.close()),
);
$('#dialog-form').addEventListener('submit', (event) => {
  if (typeof dialog.showModal !== 'function') event.preventDefault();
  const values = new FormData($('#dialog-form'));
  status.textContent = `Created “${values.get('project')}” · ${values.get('kind')}. Demo only; no data was sent.`;
});

const popup = $('#project-actions');
const popupTrigger = $('#project-actions-trigger');
const hasPopover = typeof popup.showPopover === 'function';
function positionPopup() {
  if (!hasPopover || !popup.matches(':popover-open')) return;
  const trigger = popupTrigger.getBoundingClientRect();
  const rect = popup.getBoundingClientRect();
  const margin = 16;
  const left = Math.max(margin, Math.min(trigger.left, window.innerWidth - rect.width - margin));
  const below = trigger.bottom + 8;
  const top = Math.max(
    margin,
    Math.min(
      below + rect.height > window.innerHeight - margin ? trigger.top - rect.height - 8 : below,
      window.innerHeight - rect.height - margin,
    ),
  );
  popup.style.setProperty('--ff-popover-left', `${left}px`);
  popup.style.setProperty('--ff-popover-top', `${top}px`);
}
if (hasPopover) {
  popup.addEventListener('toggle', positionPopup);
  window.addEventListener('resize', positionPopup);
  window.addEventListener('scroll', positionPopup, { passive: true });
} else {
  popup.removeAttribute('popover');
  popupTrigger.hidden = true;
  $('#popup-fallback').hidden = false;
  popup.querySelector('[popovertargetaction]').hidden = true;
}
popup.querySelectorAll('[data-popup-action]').forEach((button) =>
  button.addEventListener('click', async () => {
    if (button.dataset.popupAction === 'Duplicate project') {
      const copies = projects.filter((project) =>
        project.name.startsWith('Organic Studio (copy'),
      ).length;
      projects.push({
        ...projects.find((project) => project.name === 'Organic Studio'),
        name: `Organic Studio (copy ${copies + 1})`,
      });
      renderTable();
      status.textContent = 'Duplicated Organic Studio in the demo table. No data was sent.';
    } else {
      try {
        await navigator.clipboard.writeText('Organic Studio');
        status.textContent = 'Copied Organic Studio to the clipboard.';
      } catch {
        status.textContent = 'Clipboard access is unavailable. Project name: Organic Studio.';
      }
    }
    if (hasPopover) {
      popup.hidePopover();
      popupTrigger.focus();
    }
  }),
);

const componentBoundary = $('.site-shell');
for (const [id, attribute] of [
  ['component-wave', 'ffWave'],
  ['component-shape', 'ffShape'],
  ['component-motion', 'ffMotion'],
]) {
  const control = $(`#${id}`);
  const apply = () => {
    componentBoundary.dataset[attribute] = control.value;
  };
  control.addEventListener('change', apply);
  apply();
}
initTabs(componentBoundary);
document.querySelectorAll('[data-demo-pill]').forEach((pill) => {
  pill.addEventListener('click', () => {
    pill.setAttribute('aria-pressed', String(pill.getAttribute('aria-pressed') !== 'true'));
    const selected = [...document.querySelectorAll('[data-demo-pill][aria-pressed="true"]')].map(
      (item) => item.textContent,
    );
    $('#pill-status').textContent = `Selected: ${selected.join(', ') || 'none'}.`;
  });
});
$('[data-layout-action]').addEventListener('click', () => {
  $('#layout-status').textContent = 'A small action, right where you need it.';
});
let ambientPaused = false;
function updateAmbient() {
  document.querySelectorAll('.ff-brand-mark').forEach((mark) => {
    mark.dataset.ffPaused = String(ambientPaused || document.hidden);
  });
  $('#ambient-toggle').setAttribute('aria-pressed', String(ambientPaused));
  $('#ambient-toggle').textContent = ambientPaused
    ? 'Resume logo animation'
    : 'Pause logo animation';
}
$('#ambient-toggle').addEventListener('click', () => {
  ambientPaused = !ambientPaused;
  updateAmbient();
});
document.addEventListener('visibilitychange', updateAmbient);
updateAmbient();
