import '../src/index.css';
import './workshop.css';
export default {
  globalTypes: {
    theme: {
      description: 'Forest theme',
      toolbar: { icon: 'circlehollow', items: ['light', 'dark'], dynamicTitle: true },
    },
    wave: {
      description: 'Surface edges',
      toolbar: { icon: 'contrast', items: ['off', 'soft', 'expressive'], dynamicTitle: true },
    },
    motion: {
      description: 'Movement',
      toolbar: {
        icon: 'play',
        items: ['none', 'subtle', 'organic', 'expressive'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', wave: 'off', motion: 'organic' },
  decorators: [
    (story, context) => {
      const boundary = document.createElement('div');
      boundary.className = 'ff-theme workshop';
      boundary.dataset.ffTheme = context.globals.theme;
      boundary.dataset.ffWave = context.globals.wave;
      boundary.dataset.ffMotion = context.globals.motion;
      const content = story();
      if (typeof content === 'string') boundary.innerHTML = content;
      else boundary.append(content);
      return boundary;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'Native HTML recipes styled by Forest & Fern. Use the toolbar to compare light/dark themes, wave edges, and motion. The CSS has no runtime dependencies.',
      },
    },
  },
};
