import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { useSubscription } from '../hooks/useSubscription';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/logo.svg';

export const Subscription: React.FC = () => {
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

  if (user?.rola === 'VIEWER') {
    return (
      <Box>
        <Typography variant="h2" mb={2}>
          Subskrypcja
        </Typography>
        <Typography>Konto Viewer nie ma dostępu do subskrypcji.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Subskrypcja
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2} alignItems="flex-start">
            <img
              src={logo}
              alt="FinSync"
              style={{ width: 48, height: 48, maxWidth: '100%' }}
            />
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
            <Typography variant="body2">
              Historia płatności: dostępna w portalu Stripe.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={goCheckout}>
                Przejdź na Pro
              </Button>
              <Button variant="outlined" onClick={goPortal}>
                Portal płatności
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};



