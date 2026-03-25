import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import UserInfoProvider from './components/userInfo/UserInfoProvider';
import ToastInfoProvider from './components/toaster/ToastInfoProvider';

library.add(fab);

// Make the API base URL available to non-Vite-aware modules.
(globalThis as { __TWEETER_SERVER_URL__?: string }).__TWEETER_SERVER_URL__ = import.meta.env.VITE_SERVER_URL;

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <UserInfoProvider>
        <ToastInfoProvider>
            <App />
        </ToastInfoProvider>
    </UserInfoProvider>
);
