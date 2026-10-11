import { initTabs } from '../src/tabs.js';
import { useEffect } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import {
  tested,
  cardPlay,
  accordionPlay,
  tabsPlay,
  pillsPlay,
  layoutPlay,
  tablePlay,
  chartPlay,
  modalPlay,
  popupPlay,
  brandPlay,
  controlsPlay,
} from './recipe-interactions.js';

function node(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"><path d="M169 38h122l-61 98z"/><path d="M94 172 376 158 130 470"/><path d="M94 172c8 19 27 35 53 45"/><path d="M90 224 130 470"/><path d="M90 224 426 462"/></g></svg>`;
export default {
  title: 'Components/Recipes',
  tags: ['autodocs'],
};
export const Card = {
  play: tested(cardPlay),
  argTypes: {
    label: { control: 'text' },
    shape: { control: 'select', options: ['soft', 'organic', 'expressive', 'none'] },
  },
  args: { label: 'Organic Studio', shape: 'organic', onExplore: fn().mockName('onExplore') },

  render: ({ label, shape, onExplore }) => {
    const root = node(
      `<article class="ff-card ff-stack" ><h2></h2><p>A small creative workspace, ready for its next season.</p><div class="ff-cluster"><span class="ff-tag">Design</span><span class="ff-pill">3 collaborators</span></div><button class="ff-button" type="button">Explore project</button></article>`,
    );
    root.querySelector('article').dataset.ffShape = shape;
    root.querySelector('h2').textContent = label;
    root.querySelector('button').addEventListener('click', (event) => {
      event.currentTarget.textContent = 'Ready to explore';
      onExplore({ project: label });
    });
    return root;
  },
};
export const Accordion = {
  play: tested(accordionPlay),
  args: { onToggle: fn().mockName('onToggle') },
  render: ({ onToggle }) => {
    const root = node(
      `<article class="ff-card"><h2>Useful answers</h2><details class="ff-accordion"><summary>Can I use this without a framework?</summary><div class="ff-accordion-content"><p>Yes. Import the CSS and keep native HTML.</p></div></details><details class="ff-accordion"><summary>Is motion optional?</summary><div class="ff-accordion-content"><p>Choose Still in the toolbar. System reduced motion always takes priority.</p></div></details></article>`,
    );
    root
      .querySelectorAll('details')
      .forEach((details) =>
        details.addEventListener('toggle', () =>
          onToggle({ title: details.querySelector('summary').textContent, open: details.open }),
        ),
      );
    return root;
  },
};
export const Tabs = {
  play: tested(tabsPlay),
  args: { onSelect: fn().mockName('onSelect') },
  render: ({ onSelect }) => {
    const root = node(
      `<article class="ff-card" data-ff-tabs="Project details"><div class="ff-tab-list"><a class="ff-tab" href="#story-overview" id="story-tab-overview" aria-controls="story-overview">Overview</a><a class="ff-tab" href="#story-notes" id="story-tab-notes" aria-controls="story-notes">Notes</a><a class="ff-tab" href="#story-activity" id="story-tab-activity" aria-controls="story-activity">Activity</a></div><section class="ff-tab-panel" id="story-overview"><h2>Organic Studio</h2><p>Growing thoughtfully.</p></section><section class="ff-tab-panel" id="story-notes"><h2>Field notes</h2><p>Start with the pieces people reach for every day.</p></section><section class="ff-tab-panel" id="story-activity"><h2>Recent activity</h2><p>Added the first component collection.</p></section></article>`,
    );
    const cleanup = initTabs(root);
    useEffect(() => cleanup, [root]);
    let selected = 'story-overview';
    const report = () => {
      const active = root.querySelector('[aria-selected="true"]');
      const panel = active?.getAttribute('aria-controls');
      if (panel && selected !== panel) {
        selected = panel;
        onSelect({ panel, label: active.textContent });
      }
    };
    root.addEventListener('click', report);
    root.addEventListener('keydown', report);
    return root;
  },
};
export const PillsAndTags = {
  play: tested(pillsPlay),
  args: { onToggle: fn().mockName('onToggle') },
  render: ({ onToggle }) => {
    const root = node(
      `<article class="ff-card ff-stack"><h2>Labels &amp; choices</h2><div class="ff-cluster"><span class="ff-tag">Active</span><span class="ff-pill">6 projects</span></div><div class="ff-cluster" role="group" aria-label="Project filters"><button class="ff-pill" type="button" aria-pressed="true">Design</button><button class="ff-pill" type="button" aria-pressed="false">Development</button></div></article>`,
    );
    root.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', () => {
        const pressed = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(pressed));
        onToggle({ label: button.textContent, pressed });
      }),
    );
    return root;
  },
};
export const Layout = {
  play: tested(layoutPlay),
  render: () =>
    node(
      `<div class="ff-sidebar-layout"><aside class="ff-card"><h2>Context</h2><span class="ff-tag">Organic Studio</span></aside><article class="ff-card ff-stack"><h2>Room to grow</h2><p>The sidebar and main content stack as their container gets narrower.</p><div class="ff-grid"><article class="ff-card"><h3>Stack</h3><p>Vertical rhythm.</p></article><article class="ff-card"><h3>Cluster</h3><p>Wrapping actions.</p></article></div></article></div>`,
    ),
};
export const Table = {
  play: tested(tablePlay),
  args: { onSort: fn().mockName('onSort') },
  render: ({ onSort }) => {
    const root = node(
      `<article class="ff-card"><div class="ff-table-region" role="region" aria-label="Project budgets" tabindex="0"><table class="ff-table"><caption>Project budgets</caption><thead><tr><th scope="col">Project</th><th scope="col" aria-sort="ascending" data-ff-numeric><button class="ff-table-sort" type="button">Budget <span aria-hidden="true">↑</span></button></th></tr></thead><tbody></tbody></table></div></article>`,
    );
    const rows = [
      ['Fern Journal', 3600],
      ['Organic Studio', 7680],
      ['Canopy Dashboard', 9450],
    ];
    let ascending = true;
    const render = () => {
      const body = root.querySelector('tbody');
      body.replaceChildren();
      [...rows]
        .sort((a, b) => (a[1] - b[1]) * (ascending ? 1 : -1))
        .forEach(([name, budget]) => {
          const row = document.createElement('tr');
          row.innerHTML = `<th scope="row"></th><td data-ff-numeric></td>`;
          row.firstChild.textContent = name;
          row.lastChild.textContent = `$${budget.toLocaleString('en-US')}`;
          body.append(row);
        });
      root
        .querySelector('[aria-sort]')
        .setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      root.querySelector('button span').textContent = ascending ? '↑' : '↓';
    };
    root.querySelector('button').addEventListener('click', () => {
      ascending = !ascending;
      render();
      onSort({ column: 'budget', direction: ascending ? 'ascending' : 'descending' });
    });
    render();
    return root;
  },
};
export const Chart = {
  play: tested(chartPlay),
  args: { onDataToggle: fn().mockName('onDataToggle') },
  render: ({ onDataToggle }) => {
    const root = node(
      `<article class="ff-card"><figure><svg class="ff-chart" viewBox="0 0 400 180" role="img" aria-labelledby="story-chart-title story-chart-desc"><title id="story-chart-title">Revenue growing through the season</title><desc id="story-chart-desc">May 72 thousand, June 88 thousand, July 82 thousand, August 106 thousand dollars. Exact values follow.</desc><path class="ff-chart-grid" d="M20 150H380"/><path class="ff-chart-area" d="M20 100L140 80L260 90L380 40V150H20Z"/><path class="ff-chart-line" d="M20 100L140 80L260 90L380 40"/></svg><figcaption>Revenue through the season</figcaption></figure><details class="ff-accordion"><summary>View exact data</summary><div class="ff-table-region"><table class="ff-table"><caption>Revenue in US dollars</caption><thead><tr><th scope="col">Month</th><th scope="col">Revenue</th></tr></thead><tbody><tr><th scope="row">May</th><td>$72,000</td></tr><tr><th scope="row">June</th><td>$88,000</td></tr><tr><th scope="row">July</th><td>$82,000</td></tr><tr><th scope="row">August</th><td>$106,000</td></tr></tbody></table></div></details></article>`,
    );
    root
      .querySelector('details')
      .addEventListener('toggle', (event) => onDataToggle({ open: event.currentTarget.open }));
    return root;
  },
};
export const Modal = {
  play: tested(modalPlay),
  args: {
    onOpen: fn().mockName('onOpen'),
    onCreate: fn().mockName('onCreate'),
    onClose: fn().mockName('onClose'),
  },
  render: ({ onOpen, onCreate, onClose }) => {
    const root = node(
      `<button class="ff-button" type="button">New project</button><dialog class="ff-dialog ff-wave-surface" aria-labelledby="story-dialog-title"><form method="dialog" class="ff-stack"><h2 id="story-dialog-title">A new beginning</h2><label for="story-project-name">Project name (required)</label><input class="ff-input" id="story-project-name" name="project" required autofocus/><div class="ff-overlay-actions"><button class="ff-button ff-button-secondary" type="button" data-cancel>Cancel</button><button class="ff-button" value="save">Create project</button></div></form></dialog>`,
    );
    const dialog = root.querySelector('dialog');
    root.querySelector('button').addEventListener('click', () => {
      dialog.returnValue = '';
      root.querySelector('form').reset();
      dialog.showModal();
      onOpen();
    });
    root.querySelector('[data-cancel]').addEventListener('click', () => dialog.close('cancel'));
    root
      .querySelector('form')
      .addEventListener('submit', () =>
        onCreate({ project: new FormData(root.querySelector('form')).get('project') }),
      );
    dialog.addEventListener('close', () => onClose({ reason: dialog.returnValue || 'dismiss' }));
    return root;
  },
};
export const Popup = {
  play: tested(popupPlay),
  args: { onToggle: fn().mockName('onToggle'), onDuplicate: fn().mockName('onDuplicate') },
  render: ({ onToggle, onDuplicate }) => {
    const root = node(
      `<button class="ff-button" type="button" popovertarget="story-popup">Project actions</button><div class="ff-popover ff-wave-surface" popover="auto" id="story-popup" aria-labelledby="story-popup-title"><h2 id="story-popup-title">Project actions</h2><div class="ff-popover-actions"><button class="ff-button ff-button-secondary" type="button">Duplicate project</button><button class="ff-button ff-button-quiet" type="button" popovertarget="story-popup" popovertargetaction="hide">Close</button></div></div><p role="status"></p>`,
    );
    root.querySelector('.ff-popover-actions button').addEventListener('click', () => {
      root.querySelector('[role="status"]').textContent = 'Duplicated in this demo.';
      onDuplicate({ project: 'Organic Studio' });
      root.querySelector('[popover]').hidePopover();
      root.querySelector('button').focus();
    });
    root
      .querySelector('[popover]')
      .addEventListener('toggle', (event) => onToggle({ open: event.newState === 'open' }));
    return root;
  },
};
export const AmbientBrand = {
  play: tested(brandPlay),
  args: { onPause: fn().mockName('onPause') },
  render: ({ onPause }) => {
    const root = node(
      `<article class="ff-card ff-stack"><h2>Min Wen</h2><span class="ff-brand-mark" data-ff-ambient="true" aria-hidden="true">${brandSvg}</span><p>A quiet signature. The icon is from cmwen.dev.</p><button class="ff-button ff-button-secondary" type="button" aria-pressed="false">Pause logo animation</button></article>`,
    );
    let paused = false;
    const mark = root.querySelector('.ff-brand-mark');
    const update = () => {
      mark.dataset.ffPaused = String(paused || document.hidden);
    };
    root.querySelector('button').addEventListener('click', (event) => {
      paused = !paused;
      onPause({ paused });
      event.currentTarget.setAttribute('aria-pressed', String(paused));
      event.currentTarget.textContent = paused ? 'Resume logo animation' : 'Pause logo animation';
      update();
    });
    useEffect(() => {
      document.addEventListener('visibilitychange', update);
      update();
      return () => document.removeEventListener('visibilitychange', update);
    }, [root]);
    return root;
  },
};
export const NativeControls = {
  play: tested(controlsPlay),
  args: {
    onSearch: fn().mockName('onSearch'),
    onKind: fn().mockName('onKind'),
    onCompact: fn().mockName('onCompact'),
    onShare: fn().mockName('onShare'),
  },
  render: ({ onSearch, onKind, onCompact, onShare }) => {
    const root = node(
      `<article class="ff-card ff-stack"><h2>Native controls</h2><label for="story-search">Search projects</label><input class="ff-input" type="search" id="story-search" placeholder="Name or owner…"/><label for="story-kind">Project type</label><select class="ff-select" id="story-kind"><option>Website</option><option>Dashboard</option></select><label class="ff-cluster"><input class="ff-switch" type="checkbox" role="switch"/>Compact rows</label><label class="ff-cluster"><input type="checkbox"/>Share with collaborators</label><button class="ff-button" type="button" disabled>Unavailable action</button></article>`,
    );
    root
      .querySelector('#story-search')
      .addEventListener('input', (event) => onSearch(event.currentTarget.value));
    root
      .querySelector('#story-kind')
      .addEventListener('change', (event) => onKind(event.currentTarget.value));
    root
      .querySelector('[role="switch"]')
      .addEventListener('change', (event) => onCompact(event.currentTarget.checked));
    root
      .querySelector('input[type="checkbox"]:not([role])')
      .addEventListener('change', (event) => onShare(event.currentTarget.checked));
    return root;
  },
};
