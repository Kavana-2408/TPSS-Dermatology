import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const result = await signIn('credentials', {
      redirect: false,  // We don't want automatic redirection
      email: email,
      password: password,
    });

    if (result?.error) {
      setError('Invalid credentials. Please try again.');
    } else {
      router.push('/dashboard');  // Redirect on successful login
    }
  };

  return (
    <Box sx={{ width: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Login
      </Typography>
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button type="submit" fullWidth variant="contained" sx={{ marginTop: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
}
