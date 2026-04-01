import {AppProvider} from '@/app/providers';
import {RouterProvider} from 'react-router-dom';
import {router} from '@/app/router';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export {App};
