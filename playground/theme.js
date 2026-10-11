export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector('#theme-toggle');
  function setTheme(theme) {
    root.dataset.ffTheme = theme;
    const next = theme === 'light' ? 'dark' : 'light';
    if (button) {
      button.textContent = theme === 'light' ? '☾  Dark mode' : '☀  Light mode';
      button.setAttribute('aria-label', `Switch to ${next} theme`);
    }
    try {
      localStorage.setItem('forest-and-fern-theme', theme);
    } catch {
      /* Storage is optional. */
    }
    document.dispatchEvent(new CustomEvent('ff:theme-change', { detail: theme }));
  }
  let theme = 'light';
  try {
    theme = localStorage.getItem('forest-and-fern-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    /* Use the default. */
  }
  setTheme(theme);
  button?.addEventListener('click', () =>
    setTheme(root.dataset.ffTheme === 'light' ? 'dark' : 'light'),
  );
  return { setTheme };
}
