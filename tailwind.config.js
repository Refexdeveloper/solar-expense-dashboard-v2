/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#023957',
                secondary: '#145d7c',
                accent: '#fcc40f',
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                body: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
