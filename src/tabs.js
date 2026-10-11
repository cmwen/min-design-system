/** Enhance anchor-based tabs; without JavaScript every linked panel stays readable. */
export function initTabs(root = document) {
  const cleanups = [];
  for (const group of root.querySelectorAll('[data-ff-tabs]')) {
    if (group.dataset.ffTabsReady) continue;
    const list = group.querySelector('.ff-tab-list');
    if (!list) continue;
    const tabs = [...list.querySelectorAll('.ff-tab')];
    const available = [...group.querySelectorAll('.ff-tab-panel')];
    const panels = tabs.map((tab) =>
      available.find((panel) => panel.id === tab.getAttribute('aria-controls')),
    );
    if (!tabs.length || panels.some((panel) => !panel)) continue;
    const controller = new AbortController();
    group.dataset.ffTabsReady = 'true';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', group.dataset.ffTabs || 'Sections');
    function select(index, focus = false) {
      tabs.forEach((tab, current) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(index === current));
        tab.tabIndex = index === current ? 0 : -1;
        panels[current].hidden = index !== current;
        panels[current].setAttribute('role', 'tabpanel');
        panels[current].setAttribute('aria-labelledby', tab.id);
        panels[current].tabIndex = 0;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          select(index);
        },
        { signal: controller.signal },
      );
      tab.addEventListener(
        'keydown',
        (event) => {
          let next;
          if (event.key === ' ' || event.key === 'Enter') next = index;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== undefined) {
            event.preventDefault();
            select(next, true);
          }
        },
        { signal: controller.signal },
      );
    });
    select(0);
    cleanups.push(() => {
      controller.abort();
      delete group.dataset.ffTabsReady;
      list.removeAttribute('role');
      list.removeAttribute('aria-label');
      tabs.forEach((tab, index) => {
        tab.removeAttribute('role');
        tab.removeAttribute('aria-selected');
        tab.removeAttribute('tabindex');
        panels[index].hidden = false;
        panels[index].removeAttribute('role');
        panels[index].removeAttribute('aria-labelledby');
        panels[index].removeAttribute('tabindex');
      });
    });
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}
