/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			'cartridge': {
				DEFAULT: '#f0f4ff',
				400: '#f0f4ff',
				500: '#dce4f7',
				600: '#c4d0ef',
			},
			'purple': '#9582d9',
			'orange': '#1755F4',
			'amber': '#F5762A',
			'indigo': '#0a1f4e',
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
