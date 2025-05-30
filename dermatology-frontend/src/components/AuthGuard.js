import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';

export default function AuthGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?error=SessionRequired&callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'authenticated') {
    return children;
  }

  return null;
}