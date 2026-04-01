import {Outlet, useNavigation} from 'react-router-dom';
import {LoadingState} from '@/shared/feedback';
import {AppLayout} from './AppLayout';

function RootLayout() {
  const navigation = useNavigation();

  return <AppLayout>{navigation.state === 'idle' ? <Outlet /> : <LoadingState />}</AppLayout>;
}

export {RootLayout};
