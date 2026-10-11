import { integrationRecipes } from '../playground/integration-recipes.js';
import { tested } from './recipe-interactions.js';
import { expect } from 'storybook/test';
export default {
  title: 'Components/App integration',
  tags: ['autodocs'],
};
export const Recipes = {
  render: integrationRecipes,
  play: tested(async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /Engineering workspace/ });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  }),
};
