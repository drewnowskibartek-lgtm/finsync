import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSubscription } from '../hooks/useSubscription';
import { api } from '../api/client';
import logo from '../assets/logo.svg';
import { useAuth } from '../auth/AuthContext';

export const Settings: React.FC = () => {
  const { data: sub } = useSubscription();
  const { user } = useAuth();

  const goCheckout = async () => {
    const res = await api.post('/subscriptions/checkout');
    window.location.href = res.data.url;
  };

  const goPortal = async () => {
    const res = await api.post('/subscriptions/portal');
    window.location.href = res.data.url;
  };

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Ustawienia i subskrypcja
      </Typography>
      {user?.rola === 'VIEWER' && (
        <Typography variant="body1" mb={2}>
          Konto Viewer nie ma dostępu do ustawień subskrypcji.
        </Typography>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2}>
                Profil
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="E-mail"
                  value={user?.email ?? ''}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Rola"
                  value={user?.rola ?? ''}
                  fullWidth
                  disabled
                />
                <TextField label="Hasło" value="********" fullWidth disabled />
                <Button variant="outlined" disabled>
                  Zmień hasło (wkrótce)
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="flex-start">
                <img
                  src={logo}
                  alt="FinSync"
                  style={{ width: 48, height: 48, maxWidth: '100%' }}
                />
                <Typography variant="h3">Subskrypcja</Typography>
                <Typography variant="body1">
                  Aktualny plan: <strong>{sub?.plan ?? 'brak'}</strong>
                </Typography>
                <Typography variant="body2">
                  Status: {sub?.status ?? 'brak'}
                </Typography>
                <Typography variant="body2">
                  Następne rozliczenie:{' '}
                  {sub?.currentPeriodEnd?.slice(0, 10) ?? 'brak'}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    onClick={goCheckout}
                    disabled={user?.rola === 'VIEWER'}
                  >
                    Przejdź na Pro
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={goPortal}
                    disabled={user?.rola === 'VIEWER'}
                  >
                    Portal płatności
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



