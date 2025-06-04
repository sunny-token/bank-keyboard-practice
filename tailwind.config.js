const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* 兼容所有浏览器 */
          '-ms-overflow-style': 'none',  // IE/Edge
          'scrollbar-width': 'none',     // Firefox 
          /* WebKit 内核浏览器（Chrome/Safari） */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};