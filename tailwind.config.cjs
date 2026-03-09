/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		colors: {
			'paper': '#f7f7f7',
			'cartridge': {
				DEFAULT: '#F2EAE0',
				400: '#F2EAE0',
				500: '#E8DDD2',
				600: '#D8CFC5',
			},
			'clay': '#8C8278',
			'purple': '#9582d9',
			'orange': '#ff6600',
			'amber': '#F5762A',
			'braun-green': '#4E7942',
			'indigo': '#000f1d',
			'white': '#FFFFFF',
			'blue': '#4da2ff',
			'turquoise': '#5dceff',
			'green': '#21935b',
			'plum': '#A0295A',
		},
		fontFamily: {
			'serif': ['DegularText', 'serif'],
			'display': ['Obviously', 'DegularDisplay', 'irregardless-variable', 'sans-serif'],
			'body': ['DegularText', 'sans-serif'],
			'sans': ['PPNeueBit', 'monospace'],
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
