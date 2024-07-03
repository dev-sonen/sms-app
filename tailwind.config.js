/** @type { import( 'tailwindcss' ).Config } */

module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
            },
            fontFamily: {
                'open-sans-light': [ 'open-sans-light' , 'sans-serif' ],
                'open-sans-regular': [ 'open-sans-regular' , 'sans-serif' ],
                'open-sans-medium': [ 'open-sans-medium' , 'sans-serif' ],
                'open-sans-semibold': [ 'open-sans-semibold' , 'sans-serif' ],
                'open-sans-bold': [ 'open-sans-bold' , 'sans-serif' ],
                'open-sans-extrabold': [ 'open-sans-extrabold' , 'sans-serif' ],
            }
        }
    },
    plugins: []
}
