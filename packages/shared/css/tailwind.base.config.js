/** @type {import('tailwindcss').Config} */
module.exports = {
  // This is a `relative` config, it will be effective in separated config files.
  content: {
    files: ['./*.{svelte,vue,ts,tsx}'],
    relative: true,
  },
  darkMode: ['class', 'dark-theme'],
  theme: {},
};
