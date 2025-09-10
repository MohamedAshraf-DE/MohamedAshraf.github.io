import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/', // correct for user page
    assetsInclude: ['**/*.glb'], // keep this if you use GLB assets
});