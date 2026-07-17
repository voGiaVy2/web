/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Bảng màu "Tổ Ấm" - lấy cảm hứng từ mái nhà, ánh đèn ấm buổi tối
        ink: '#132A2C',      // chữ chính - xanh than đậm
        teal: {
          DEFAULT: '#0F5257',
          50: '#EAF3F3',
          100: '#CFE4E4',
          400: '#1B7A80',
          600: '#0F5257',
          700: '#0B3E42',
          900: '#062629',
        },
        sand: '#FAF6EF',     // nền chính
        sandDeep: '#F0E9DA',
        amber: {
          DEFAULT: '#E2A33D',
          600: '#C88827',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
