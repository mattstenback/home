/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			'cartridge': {
				DEFAULT: '#f2f9ff',
				400: '#f2f9ff',
				500: '#dfe8f8',
				600: '#ced7f2',
			},
			'purple': '#9582d9',
			'orange': '#f2884b',
			'indigo': '#273858',
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
