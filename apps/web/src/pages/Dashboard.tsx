import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { api } from '../api/client';
import type { DashboardData } from '../api/types';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
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
      return {
        od: start.toISOString().slice(0, 10),
        do: end.toISOString().slice(0, 10),
      };
    }
    if (!od || !doDate) return undefined;
    return { od, do: doDate };
  };

  const load = async () => {
    try {
      const params = buildParams();
      const res = await api.get<DashboardData>('/reports/dashboard', { params });
      setData(res.data);
    } catch {
      setData(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Pulpit
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Tryb zakresu"
                fullWidth
                value={mode}
                onChange={(e) => setMode(e.target.value as 'month' | 'range')}
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

      <Grid container spacing={2}>
        {[
          { label: 'Przychody', value: data?.przychody ?? 0 },
          { label: 'Wydatki', value: data?.wydatki ?? 0 },
          { label: 'Saldo', value: data?.saldo ?? 0 },
          {
            label: 'Wskaźnik oszczędności',
            value: `${(data?.wskOszczednosci ?? 0).toFixed(1)}%`,
          },
          { label: 'Budżet', value: data?.budzetLacznie ?? 0 },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h3">{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={8}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h3" mb={1}>
                Trend 12 miesięcy
              </Typography>
              <Box sx={{ height: { xs: 220, md: 280 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.trend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="miesiac" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="suma" stroke="#1565c0" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h3" mb={1}>
                Top 5 kategorii
              </Typography>
              <Box sx={{ height: { xs: 220, md: 280 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.top5 ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nazwa" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="suma" fill="#2ed6a1" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!data && (
        <Stack mt={2}>
          <Typography color="text.secondary">
            Brak danych do wyświetlenia.
          </Typography>
        </Stack>
      )}
    </Box>
  );
};
