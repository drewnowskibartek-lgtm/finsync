import React, { useEffect, useState } from 'react';
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
import { api } from '../api/client';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../auth/AuthContext';

interface Category {
  id: string;
  nazwa: string;
  globalna: boolean;
}

export const Categories: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [nazwa, setNazwa] = useState('');
  const { data: sub } = useSubscription();
  const { user } = useAuth();

  const load = async () => {
    const res = await api.get('/categories');
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!nazwa) return;
    await api.post('/categories', { nazwa });
    setNazwa('');
    load();
  };

  const canEdit = user?.rola === 'ADMIN' || user?.rola === 'USER';
  const isPro = sub?.plan === 'PRO';

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Kategorie
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8} md={8}>
              <TextField
                label="Nazwa kategorii"
                fullWidth
                value={nazwa}
                onChange={(e) => setNazwa(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <Button
                variant="contained"
                fullWidth
                disabled={!isPro || !canEdit}
                onClick={create}
              >
                Dodaj (Pro)
              </Button>
            </Grid>
          </Grid>
          {!isPro && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Własne kategorie są dostępne tylko w planie Pro.
            </Typography>
          )}
          {!canEdit && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Konto Viewer nie może dodawać kategorii.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Stack spacing={1}>
        {items.map((c) => (
          <Card key={c.id}>
            <CardContent>
              <Typography variant="body1">
                {c.nazwa}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};



