/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			'cartridge': {
				DEFAULT: '#FAFAF9',
				400: '#FAFAF9',
				500: '#EDECE8',
				600: '#DDDBD5',
			},
			'purple': '#9582d9',
			'orange': '#E55504',
			'amber': '#F5762A',
			'braun-green': '#4E7942',
			'indigo': '#1E1B16',
		},
		fontFamily: {
			'serif': ['swear-text', 'serif'],
			'display': ['irregardless-variable', 'sans-serif'],
			'mono': ['VulfMonoLightItalic', 'monospace'],
		},
		extend: {
			rotate: {
        '15': '15deg',
      }
		},
	},
	plugins: [],
}
