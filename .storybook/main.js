export default {
  framework: {
    name: '@storybook/html-vite',
    options: { builder: { viteConfigPath: '.storybook/vite.config.js' } },
  },
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  docs: { defaultName: 'Guide' },
};
