import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';

import './index.css';
import App from './routes/App.jsx';
import Landing from './routes/Landing.jsx';
import Dashboard from './routes/Dashboard.jsx';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-center text-slate-100">
        <h1 className="text-4xl font-semibold text-brand-400">{error.status}</h1>
        <p className="mt-4 text-lg">{error.statusText || 'Something went wrong.'}</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-center text-slate-100">
      <h1 className="text-4xl font-semibold text-brand-400">Unexpected Error</h1>
      <p className="mt-4 text-lg text-slate-300">
        Sorry, something went wrong. Please refresh the page or go back to the landing page.
      </p>
      <a href="/" className="btn-primary mt-6">Go Home</a>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
