/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          dark: '#0F2537',
          navy: '#183852',
          primary: '#1F4E79',
          brand: '#2E74B5',
          steel: '#416788',
          light: '#F4F7FA',
          slate: '#64748B',
          border: '#E2E8F0',
        },
        status: {
          open: '#F59E0B',
          assigned: '#6366F1',
          progress: '#3B82F6',
          resolved: '#10B981',
          escalated: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
