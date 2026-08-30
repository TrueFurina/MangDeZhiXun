import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import LazyLoadErrorBoundary from './components/LazyLoadErrorBoundary';

const App = () => {
  return (
    <LazyLoadErrorBoundary>
      <RouterProvider router={router} />
    </LazyLoadErrorBoundary>
  );
};

export default App;
