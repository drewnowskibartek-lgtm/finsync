import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/logo.svg';

const schema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail.'),
  haslo: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków.'),
});

type FormData = z.infer<typeof schema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await registerUser(data.email, data.haslo);
      navigate('/app/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Nie udało się zarejestrować.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(135deg, rgba(10,37,64,0.08), rgba(46,214,161,0.2))',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', p: 1 }}>
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <img src={logo} alt="FinSync" style={{ width: 64, height: 64 }} />
            <Typography variant="h4" fontWeight={700}>
              Rejestracja
            </Typography>
          </Stack>
          <Stack
            spacing={2}
            mt={3}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              label="E-mail"
              fullWidth
              {...register('email')}
              error={!!formState.errors.email}
              helperText={formState.errors.email?.message}
            />
            <TextField
              label="Hasło"
              type="password"
              fullWidth
              {...register('haslo')}
              error={!!formState.errors.haslo}
              helperText={formState.errors.haslo?.message}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button variant="contained" type="submit" size="large">
              Utwórz konto
            </Button>
            <Typography variant="body2" align="center">
              Masz konto? <Link to="/login">Zaloguj się</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};



