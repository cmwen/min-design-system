export function integrationRecipes() {
  const root = document.createElement('div');
  root.className = 'ff-stack';
  root.dataset.ffDensity = 'compact';
  root.innerHTML = `
    <section class="ff-card ff-stack" aria-labelledby="integration-controls">
      <h2 id="integration-controls">Compact controls and actions</h2>
      <div class="ff-cluster">
        <button class="ff-button" type="button" data-ff-size="sm">Small</button>
        <button class="ff-button" type="button">Compact</button>
        <button class="ff-button" type="button" data-ff-size="lg">Large</button>
        <button class="ff-button ff-button-icon ff-button-secondary" type="button" aria-label="Refresh contexts"><span aria-hidden="true">↻</span></button>
        <button class="ff-button ff-button-danger" type="button">Revoke access</button>
        <button class="ff-button ff-button-danger" type="button" disabled>Delete unavailable</button>
      </div>
      <div class="ff-cluster" aria-label="Status examples">
        <span class="ff-tag" data-ff-tone="neutral">Archived</span>
        <span class="ff-tag" data-ff-tone="info">Syncing</span>
        <span class="ff-tag" data-ff-tone="success">Connected</span>
        <span class="ff-tag" data-ff-tone="warning">Expiring</span>
        <span class="ff-tag" data-ff-tone="danger">Revoked</span>
      </div>
    </section>
    <section class="ff-card ff-stack" aria-labelledby="integration-contexts">
      <h2 id="integration-contexts">Selectable contexts</h2>
      <button class="ff-selectable" type="button" aria-pressed="true"><strong>Design workspace</strong><span class="ff-metadata">Selected · Updated today</span></button>
      <button class="ff-selectable ff-list-row" type="button" aria-pressed="false"><strong>Engineering workspace</strong><span class="ff-metadata">Available · 4 sources</span></button>
      <button class="ff-selectable ff-list-row" type="button" aria-pressed="false" disabled><strong>Archived workspace</strong><span class="ff-metadata">Unavailable</span></button>
    </section>
    <section class="ff-card ff-stack" aria-labelledby="integration-feedback">
      <h2 id="integration-feedback">Fields and feedback</h2>
      <div class="ff-field">
        <label class="ff-field-label" for="integration-name">Connection name (required)</label>
        <input class="ff-input" id="integration-name" required aria-invalid="true" aria-describedby="integration-help integration-error" />
        <p class="ff-field-help" id="integration-help">Use a name your team recognizes.</p>
        <p class="ff-field-error" id="integration-error">Enter a connection name.</p>
      </div>
      <div class="ff-alert" data-ff-tone="warning"><p>Access expires tomorrow. Renew the connection to keep syncing.</p><button class="ff-button ff-button-icon ff-button-quiet" type="button" aria-label="Dismiss expiry notice"><span aria-hidden="true">×</span></button></div>
      <div class="ff-busy" role="status">Refreshing connections…</div>
      <button class="ff-button" type="button" aria-busy="true" disabled>Refreshing…</button>
      <div class="ff-empty-state"><h3>No shared connections</h3><p>Connect a source to share it with your team.</p><button class="ff-button" type="button">Connect a source</button></div>
    </section>
    <section class="ff-card ff-stack" aria-labelledby="integration-navigation">
      <h2 id="integration-navigation">Responsive navigation</h2>
      <div class="ff-responsive-nav">
        <nav class="ff-sidebar-nav" aria-label="Workspace"><a class="ff-nav-link" href="#integration-contexts" aria-current="page">Contexts <span class="ff-pill" data-ff-tone="info">3</span></a><a class="ff-nav-link" href="#integration-feedback">Connections</a></nav>
        <nav class="ff-bottom-nav" aria-label="Workspace"><a class="ff-nav-link" href="#integration-contexts" aria-current="page">Contexts <span class="ff-pill" data-ff-tone="info">3</span></a><a class="ff-nav-link" href="#integration-feedback">Connections</a></nav>
      </div>
    </section>`;
  root.querySelectorAll('.ff-selectable:not(:disabled)').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(selected));
      const metadata = button.querySelector('.ff-metadata');
      metadata.textContent = metadata.textContent.replace(
        /Selected|Available/,
        selected ? 'Selected' : 'Available',
      );
    });
  });
  const dismiss = root.querySelector('[aria-label="Dismiss expiry notice"]');
  dismiss.addEventListener('click', () => {
    dismiss.closest('.ff-alert').hidden = true;
    root.querySelector('#integration-name').focus();
  });
  return root;
}
