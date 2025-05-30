import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import '@/styles/globals.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log('App routing to:', url);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Component {...pageProps} />
        </LocalizationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}