import { expect, waitFor } from 'storybook/test';

export async function cardPlay({ canvas, args, userEvent, step }) {
  await step('Explore the project and log the live callback', async () => {
    const button = canvas.getByRole('button', { name: 'Explore project' });
    await userEvent.click(button);
    await expect(button).toHaveTextContent('Ready to explore');
    await expect(args.onExplore).toHaveBeenCalledWith({ project: args.label });
    button.textContent = 'Explore project';
  });
}
export async function accordionPlay({ canvas, args, userEvent, step }) {
  await step('Open and close the native disclosure', async () => {
    const summary = canvas.getByText('Can I use this without a framework?');
    const details = summary.closest('details');
    await userEvent.click(summary);
    await expect(details).toHaveAttribute('open');
    await waitFor(() =>
      expect(args.onToggle).toHaveBeenCalledWith({ title: summary.textContent, open: true }),
    );
    await userEvent.click(summary);
    await expect(details).not.toHaveAttribute('open');
    await waitFor(() =>
      expect(args.onToggle).toHaveBeenCalledWith({ title: summary.textContent, open: false }),
    );
  });
}
export async function tabsPlay({ canvas, args, userEvent, step }) {
  await step('Select Notes, move to Activity by keyboard, and wrap to Overview', async () => {
    const notes = await canvas.findByRole('tab', { name: 'Notes' });
    await userEvent.click(notes);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Field notes');
    await expect(args.onSelect).toHaveBeenCalledWith({ panel: 'story-notes', label: 'Notes' });
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Recent activity');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(args.onSelect).toHaveBeenCalledWith({
      panel: 'story-overview',
      label: 'Overview',
    });
  });
}
export async function pillsPlay({ canvas, args, userEvent, step }) {
  await step('Toggle a filter on and off and verify its action payload', async () => {
    const button = canvas.getByRole('button', { name: 'Development' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onToggle).toHaveBeenCalledWith({ label: 'Development', pressed: true });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onToggle).toHaveBeenLastCalledWith({ label: 'Development', pressed: false });
  });
}
export async function layoutPlay({ canvasElement, step }) {
  await step('Keep content inside its container', async () => {
    const layout = canvasElement.querySelector('.ff-sidebar-layout');
    await expect(layout).toBeVisible();
    const rect = layout.getBoundingClientRect();
    for (const child of layout.children) {
      const childRect = child.getBoundingClientRect();
      await expect(childRect.right).toBeLessThanOrEqual(rect.right + 1);
      await expect(childRect.left).toBeGreaterThanOrEqual(rect.left - 1);
    }
  });
}
export async function tablePlay({ canvas, canvasElement, args, userEvent, step }) {
  await step('Sort the numeric column both ways', async () => {
    const button = canvas.getByRole('button', { name: /Budget/ });
    await userEvent.click(button);
    await expect(canvasElement.querySelector('[aria-sort]')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await expect(canvasElement.querySelector('tbody tr')).toHaveTextContent('Canopy Dashboard');
    await expect(args.onSort).toHaveBeenCalledWith({ column: 'budget', direction: 'descending' });
    await userEvent.click(button);
    await expect(canvasElement.querySelector('tbody tr')).toHaveTextContent('Fern Journal');
    await expect(args.onSort).toHaveBeenLastCalledWith({
      column: 'budget',
      direction: 'ascending',
    });
  });
}
export async function chartPlay({ canvas, args, userEvent, step }) {
  await step('Expose exact chart data through a native disclosure', async () => {
    const summary = canvas.getByText('View exact data');
    await userEvent.click(summary);
    await expect(canvas.getByRole('table')).toHaveTextContent('$106,000');
    await waitFor(() => expect(args.onDataToggle).toHaveBeenCalledWith({ open: true }));
    await userEvent.click(summary);
    await waitFor(() => expect(args.onDataToggle).toHaveBeenLastCalledWith({ open: false }));
  });
}
export async function modalPlay({ canvas, canvasElement, args, userEvent, step }) {
  const open = canvas.getByRole('button', { name: 'New project' });
  const dialog = canvasElement.querySelector('dialog');
  await step('Native validation prevents an empty submission', async () => {
    await userEvent.click(open);
    await expect(canvas.getByLabelText('Project name (required)')).toHaveFocus();
    const count = args.onCreate.mock.calls.length;
    await userEvent.click(canvas.getByRole('button', { name: 'Create project' }));
    await expect(dialog).toBeVisible();
    await expect(args.onCreate.mock.calls.length).toBe(count);
  });
  await step('Create a project and report its value', async () => {
    await userEvent.type(canvas.getByLabelText('Project name (required)'), 'Fern Journal');
    await userEvent.click(canvas.getByRole('button', { name: 'Create project' }));
    await waitFor(() => expect(dialog).not.toBeVisible());
    await expect(args.onCreate).toHaveBeenCalledWith({ project: 'Fern Journal' });
    await waitFor(() => expect(args.onClose).toHaveBeenCalledWith({ reason: 'save' }));
  });
  await step('Cancel restores trigger focus', async () => {
    await userEvent.click(open);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(args.onClose).toHaveBeenCalledWith({ reason: 'cancel' }));
    await expect(open).toHaveFocus();
  });
}
export async function popupPlay({ canvas, canvasElement, args, userEvent, step }) {
  await step('Open a native popup, perform an action, and close it again', async () => {
    const trigger = canvas.getByRole('button', { name: 'Project actions' });
    const popup = canvasElement.querySelector('#story-popup');
    await userEvent.click(trigger);
    await expect(popup).toBeVisible();
    await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith({ open: true }));
    await userEvent.click(canvas.getByRole('button', { name: 'Duplicate project' }));
    await expect(args.onDuplicate).toHaveBeenCalledWith({ project: 'Organic Studio' });
    await expect(canvas.getByRole('status')).toHaveTextContent('Duplicated in this demo.');
    await expect(popup).not.toBeVisible();
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(popup).not.toBeVisible();
    await waitFor(() => expect(args.onToggle).toHaveBeenLastCalledWith({ open: false }));
  });
}
export async function brandPlay({ canvas, canvasElement, args, userEvent, step }) {
  await step('Pause and resume the ambient mark', async () => {
    await userEvent.click(canvas.getByRole('button', { name: 'Pause logo animation' }));
    await expect(canvasElement.querySelector('.ff-brand-mark')).toHaveAttribute(
      'data-ff-paused',
      'true',
    );
    await expect(args.onPause).toHaveBeenCalledWith({ paused: true });
    await userEvent.click(canvas.getByRole('button', { name: 'Resume logo animation' }));
    await expect(args.onPause).toHaveBeenLastCalledWith({ paused: false });
    await expect(canvas.getByRole('button', { name: 'Pause logo animation' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
}
export async function controlsPlay({ canvas, args, userEvent, step }) {
  await step('Search and choose a project type', async () => {
    const search = canvas.getByRole('searchbox');
    await userEvent.type(search, 'Fern');
    await expect(search).toHaveValue('Fern');
    await expect(args.onSearch).toHaveBeenLastCalledWith('Fern');
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'Dashboard');
    await expect(args.onKind).toHaveBeenLastCalledWith('Dashboard');
    await userEvent.clear(search);
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'Website');
  });
  await step('Switch and checkbox keep native state; disabled action stays disabled', async () => {
    const compact = canvas.getByRole('switch');
    const share = canvas.getByRole('checkbox');
    await userEvent.click(compact);
    await expect(compact).toBeChecked();
    await expect(args.onCompact).toHaveBeenLastCalledWith(true);
    await userEvent.click(share);
    await expect(share).toBeChecked();
    await expect(args.onShare).toHaveBeenLastCalledWith(true);
    await expect(canvas.getByRole('button', { name: 'Unavailable action' })).toBeDisabled();
    await userEvent.click(compact);
    await userEvent.click(share);
  });
}

// Expose the outcome to browser CI while preserving Storybook's own reporting.
export function tested(play) {
  return async (context) => {
    const root = context.canvasElement;
    delete root.dataset.ffTestError;
    root.dataset.ffTestState = 'running';
    try {
      await play(context);
      root.dataset.ffTestState = 'passed';
    } catch (error) {
      root.dataset.ffTestState = 'failed';
      root.dataset.ffTestError = error.message;
      throw error;
    }
  };
}
