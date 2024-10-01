/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit', // Just-In-Time mode (optional, but good for development)
	content: [
		'./public/index.html', // Ensure it's pointing to your public directory
		'./src/**/*.{js,jsx,ts,tsx}', // Includes all React components
	],
	theme: {
		extend: {
			maxHeight: {
				'4/5': '80%', // Custom height for 4/5
			},
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
