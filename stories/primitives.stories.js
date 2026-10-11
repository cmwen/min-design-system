import { expect, fn } from 'storybook/test';
import { tested } from './recipe-interactions.js';
import { NativeControls } from './recipes.stories.js';
function node(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}
export default {
  title: 'Foundations/Primitives',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Small native HTML and CSS building blocks. Actions report actual control events; interaction steps assert the resulting state.',
      },
    },
  },
};
export const Buttons = {
  name: 'Buttons',
  args: { onActivate: fn().mockName('onActivate') },
  argTypes: { onActivate: { control: false, table: { category: 'Events' } } },
  render: ({ onActivate }) => {
    const root = node(
      '<section class="ff-stack"><h1 class="ff-heading">Button primitive</h1><p>Native buttons keep keyboard activation, focus and disabled behavior.</p><div class="ff-cluster"><button class="ff-button" type="button">Primary action</button><button class="ff-button" type="button" disabled>Disabled action</button><a class="ff-link" href="#primitive-note">Text link</a></div><p id="primitive-note" role="status">Ready</p></section>',
    );
    root.querySelector('button').addEventListener('click', () => {
      onActivate({ source: 'primary' });
      root.querySelector('[role="status"]').textContent = 'Activated';
    });
    return root;
  },
  play: tested(async ({ canvas, args, userEvent, step }) => {
    await step('Activate the live button and preserve disabled semantics', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Primary action' }));
      await expect(args.onActivate).toHaveBeenCalledWith({ source: 'primary' });
      await expect(canvas.getByRole('status')).toHaveTextContent('Activated');
      await expect(canvas.getByRole('button', { name: 'Disabled action' })).toBeDisabled();
      await expect(canvas.getByRole('link', { name: 'Text link' })).toHaveAttribute(
        'href',
        '#primitive-note',
      );
    });
  }),
};
export const LayoutPrimitives = {
  name: 'Layout',
  render: () =>
    node(
      '<section class="ff-stack"><h1 class="ff-heading">Layout primitives</h1><p>Resize the canvas: clusters wrap and grids adapt without JavaScript.</p><div class="ff-card ff-stack"><h2>Stack · vertical rhythm</h2><div class="ff-cluster" aria-label="Wrapping cluster"><span class="ff-tag">One</span><span class="ff-tag">Two</span><span class="ff-tag">Three</span></div><div class="ff-grid"><article class="ff-card"><h3>Grid cell one</h3><p>Flexible columns.</p></article><article class="ff-card"><h3>Grid cell two</h3><p>Shared spacing.</p></article></div></div></section>',
    ),
  play: tested(async ({ canvasElement, step }) => {
    await step('Use native CSS grid and flex layouts', async () => {
      await expect(getComputedStyle(canvasElement.querySelector('.ff-grid')).display).toBe('grid');
      await expect(getComputedStyle(canvasElement.querySelector('.ff-cluster')).flexWrap).toBe(
        'wrap',
      );
      await expect(getComputedStyle(canvasElement.querySelector('.ff-stack')).display).toBe('flex');
    });
  }),
};

export const NativeInputs = { ...NativeControls, name: 'Native inputs' };
export const Surfaces = {
  render: () =>
    node(
      '<section class="ff-stack"><h1 class="ff-heading">Surface shapes</h1><p>Try wave edges in the toolbar. All four shapes use the same card primitive.</p><div class="ff-grid">' +
        ['none', 'soft', 'organic', 'expressive']
          .map(
            (shape) =>
              `<article class="ff-card" data-ff-shape="${shape}"><h2>${shape}</h2><p>Content and focus stay readable inside every surface.</p><button class="ff-button" type="button">Try ${shape}</button></article>`,
          )
          .join('') +
        '</div></section>',
    ),
  play: tested(async ({ canvasElement, step }) => {
    await step('Apply distinct radii to the same surface primitive', async () => {
      const cards = [...canvasElement.querySelectorAll('[data-ff-shape]')];
      const radii = cards.map((card) => getComputedStyle(card).borderTopLeftRadius);
      await expect(radii[0]).toBe('0px');
      await expect(new Set(radii).size).toBe(4);
    });
  }),
};
