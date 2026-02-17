import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import { useSubscription } from '../hooks/useSubscription';
import { formatAmount } from '../utils/format';

interface AdvancedReport {
  kategorie: { nazwa: string; suma: number }[];
  budzety: {
    id: string;
    kategoria: string;
    kwota: number;
    wydano: number;
    procent: number;
    carryOver?: number;
    available?: number;
    remaining?: number;
  }[];
}

export const Reports: React.FC = () => {
  const { data: sub } = useSubscription();
  const [advanced, setAdvanced] = useState<AdvancedReport | null>(null);
  const [mode, setMode] = useState<'month' | 'range'>('month');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [od, setOd] = useState('');
  const [doDate, setDoDate] = useState('');

  const buildParams = () => {
    if (mode === 'month') {
      const [y, m] = month.split('-').map(Number);
      if (!y || !m) return undefined;
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      const odParam = start.toISOString().slice(0, 10);
      const doParam = end.toISOString().slice(0, 10);
      return { od: odParam, do: doParam };
    }
    if (!od || !doDate) return undefined;
    return { od, do: doDate };
  };

  const load = async () => {
    if (sub?.plan !== 'PRO') return;
    const params = buildParams();
    const res = await api.get('/reports/advanced', { params });
    setAdvanced(res.data);
  };

  useEffect(() => {
    if (sub?.plan === 'PRO') {
      load();
    }
  }, [sub?.plan]);

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Raporty
      </Typography>

      {sub?.plan !== 'PRO' && (
        <Typography variant="body1">
          Zaawansowane raporty dostępne są tylko w planie Pro.
        </Typography>
      )}

      {advanced && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      label="Tryb zakresu"
                      fullWidth
                      value={mode}
                      onChange={(e) =>
                        setMode(e.target.value as 'month' | 'range')
                      }
                    >
                      <MenuItem value="month">Miesiąc</MenuItem>
                      <MenuItem value="range">Zakres dat</MenuItem>
                    </TextField>
                  </Grid>
                  {mode === 'month' ? (
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Miesiąc"
                        type="month"
                        fullWidth
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      />
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Data od"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={od}
                          onChange={(e) => setOd(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Data do"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={doDate}
                          onChange={(e) => setDoDate(e.target.value)}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} md={2}>
                    <Button variant="contained" fullWidth onClick={load}>
                      Filtruj
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h3" mb={1}>
                  Kategorie - suma
                </Typography>
                {advanced.kategorie.map((k) => (
                  <Typography key={k.nazwa} variant="body2">
                    {k.nazwa}: {formatAmount(k.suma)} PLN
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h3" mb={1}>
                  Budżety - wykorzystanie
                </Typography>
                {advanced.budzety.map((b) => (
                  <Typography
                    key={b.id}
                    variant="body2"
                    color={
                      b.procent >= 100
                        ? 'error'
                        : b.procent >= 80
                          ? 'warning.main'
                          : 'text.primary'
                    }
                  >
                    {b.kategoria}: {formatAmount(b.wydano)}/{formatAmount(b.kwota)} PLN ({b.procent}%)
                    {b.carryOver && b.carryOver > 0 && (
                      <> • przeniesione: {formatAmount(b.carryOver)} PLN</>
                    )}
                    {b.available !== undefined && b.remaining !== undefined && (
                      <>
                        {' '}
                        • dostępne: {formatAmount(b.available)} PLN • pozostało:{' '}
                        {formatAmount(b.remaining)} PLN
                      </>
                    )}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
