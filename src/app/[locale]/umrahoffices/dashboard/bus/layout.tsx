'use client';

import { Provider } from 'react-redux';
import { store } from './redux/store';

export default function BusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        async
        defer
      />
      <Provider store={store}>
        {children}
      </Provider>
    </>
  );
} 