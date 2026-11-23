import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pin OXC/rolldown tsconfig resolution to this project's root tsconfig,
  // preventing it from walking up to parent directories (e.g. D:\tsconfig.json).
  tsconfig: `${import.meta.dirname}/tsconfig.json`,
  test: { environment: 'node' },
})
