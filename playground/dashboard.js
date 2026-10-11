import { initTheme } from './theme.js';
initTheme();
const $ = (selector) => document.querySelector(selector);
$('#customer-search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  let count = 0;
  document.querySelectorAll('[data-customer]').forEach((row) => {
    row.hidden = !row.dataset.customer.includes(query);
    if (!row.hidden) count++;
  });
  $('#customer-count').value = `${count} customer${count === 1 ? '' : 's'}`;
  $('#no-customers').hidden = count > 0;
  $('#dashboard-status').textContent = query
    ? `${count} matching customers.`
    : 'Showing all customers.';
});
document.querySelectorAll('.customer-view').forEach((button) =>
  button.addEventListener('click', () => {
    const { name, email, revenue, status } = button.dataset;
    $('#detail-name').textContent = name;
    $('#detail-email').textContent = email;
    $('#detail-revenue').textContent = revenue;
    $('#detail-status').textContent = status;
    $('#detail-avatar').textContent = name
      .split(' ')
      .map((part) => part[0])
      .join('');
    $('#dashboard-status').textContent = `Viewing ${name}.`;
  }),
);
