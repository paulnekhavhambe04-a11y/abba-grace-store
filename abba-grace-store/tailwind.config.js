/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: { 50:'#f6f2fb',100:'#ebe2f6',200:'#d4c2ec',300:'#b496dc',400:'#8f65c6',500:'#6f3fae',600:'#5a2d92',700:'#47227a',800:'#341a5a',900:'#22103d' },
        gold: { 300:'#f0d58a',400:'#e2b94f',500:'#c99a2e',600:'#a87a1c' },
        ivory: '#fbf7ee'
      },
      fontFamily: { display: ['"Playfair Display"','Georgia','serif'], sans: ['Inter','system-ui','sans-serif'] }
    }
  },
  plugins: []
}
