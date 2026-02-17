import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api/client';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../auth/AuthContext';
import { formatAmount } from '../utils/format';

interface RecurringItem {
  id: string;
  odbiorca: string;
  kwota: number;
  czestotliwosc: string;
  nastepnaData: string;
}

const normalizeAmount = (value: string) =>
  Number(value.replace(/\s/g, '').replace(',', '.'));

export const Recurring: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState<RecurringItem[]>([]);
  const { data: sub } = useSubscription();
  const { user } = useAuth();
  const isPro = sub?.plan === 'PRO';
  const canEdit = user?.rola === 'ADMIN' || user?.rola === 'USER';
  const [form, setForm] = useState({
    odbiorca: '',
    kwota: '',
    czestotliwosc: 'MIESIECZNA',
    nastepnaData: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    odbiorca: '',
    kwota: '',
    czestotliwosc: 'MIESIECZNA',
    nastepnaData: '',
  });

  const load = async () => {
    const res = await api.get('/recurring');
    setItems(res.data);
  };

  useEffect(() => {
    if (sub?.plan === 'PRO') load();
  }, [sub?.plan]);

  const create = async () => {
    const kwota = normalizeAmount(form.kwota);
    await api.post('/recurring', { ...form, kwota });
    load();
  };

  const openEdit = (r: RecurringItem) => {
    setEditId(r.id);
    setEditForm({
      odbiorca: r.odbiorca ?? '',
      kwota: String(r.kwota ?? ''),
      czestotliwosc: r.czestotliwosc ?? 'MIESIECZNA',
      nastepnaData: r.nastepnaData?.slice(0, 10) ?? '',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const kwota = normalizeAmount(editForm.kwota);
    await api.patch(`/recurring/${editId}`, { ...editForm, kwota });
    setEditOpen(false);
    setEditId(null);
    load();
  };

  const removeItem = async (id: string) => {
    if (!window.confirm('Czy na pewno usunąć cykliczną płatność?')) return;
    await api.delete(`/recurring/${id}`);
    load();
  };

  if (!isPro) {
    return (
      <Box>
        <Typography variant="h2" mb={2}>
          Cykliczne
        </Typography>
        <Typography>Funkcja dostępna tylko w planie Pro.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Cykliczne
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Odbiorca"
                fullWidth
                value={form.odbiorca}
                onChange={(e) =>
                  setForm((f) => ({ ...f, odbiorca: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Kwota"
                type="text"
                inputMode="decimal"
                fullWidth
                value={form.kwota}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kwota: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Częstotliwość"
                fullWidth
                value={form.czestotliwosc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, czestotliwosc: e.target.value }))
                }
              >
                <MenuItem value="DZIENNA">Dzienna</MenuItem>
                <MenuItem value="TYGODNIOWA">Tygodniowa</MenuItem>
                <MenuItem value="MIESIECZNA">Miesięczna</MenuItem>
                <MenuItem value="ROCZNA">Roczna</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Następna data"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.nastepnaData}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nastepnaData: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={create}
                sx={{ height: '100%' }}
                disabled={!canEdit}
              >
                Dodaj
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack spacing={1}>
        {items.map((r) => (
          <Card key={r.id}>
            <CardContent>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'flex-start' : 'center'}
                spacing={isMobile ? 1 : 0}
              >
                <Typography variant="body1">
                  {r.odbiorca} - {formatAmount(r.kwota)} PLN - {r.czestotliwosc} - następna:{' '}
                  {r.nastepnaData?.slice(0, 10)}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => openEdit(r)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => removeItem(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {!canEdit && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          Konto Viewer nie może dodawać cyklicznych transakcji.
        </Typography>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj cykliczną płatność</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Odbiorca"
                fullWidth
                value={editForm.odbiorca}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, odbiorca: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Kwota"
                type="text"
                inputMode="decimal"
                fullWidth
                value={editForm.kwota}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, kwota: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Częstotliwość"
                fullWidth
                value={editForm.czestotliwosc}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    czestotliwosc: e.target.value,
                  }))
                }
              >
                <MenuItem value="DZIENNA">Dzienna</MenuItem>
                <MenuItem value="TYGODNIOWA">Tygodniowa</MenuItem>
                <MenuItem value="MIESIECZNA">Miesięczna</MenuItem>
                <MenuItem value="ROCZNA">Roczna</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Następna data"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editForm.nastepnaData}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, nastepnaData: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!canEdit}>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
