
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './envCheck'

// Additional environment check
console.log('Vite env mode:', import.meta.env.MODE);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
