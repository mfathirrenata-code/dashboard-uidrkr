import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './layouts/dashboard';

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById("app"));
    Index.render(
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>
    );
}