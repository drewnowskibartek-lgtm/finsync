import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
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

interface Budget {
  id: string;
  kategoriaId: string;
  kategoria: { nazwa: string };
  rok: number;
  miesiac: number;
  kwota: number;
  roluj?: boolean;
}

interface Category {
  id: string;
  nazwa: string;
  globalna: boolean;
}

interface AdvancedBudget {
  id: string;
  kategoria: string;
  kwota: number;
  wydano: number;
  procent: number;
  carryOver?: number;
  available?: number;
  remaining?: number;
}

const normalizeAmount = (value: string) =>
  Number(value.replace(/\s/g, '').replace(',', '.'));

export const Budgets: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [advanced, setAdvanced] = useState<AdvancedBudget[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    kategoriaId: '',
    rok: new Date().getFullYear(),
    miesiac: new Date().getMonth() + 1,
    kwota: '',
    roluj: false,
  });
  const [form, setForm] = useState({
    kategoriaId: '',
    rok: new Date().getFullYear(),
    miesiac: new Date().getMonth() + 1,
    kwota: '',
    roluj: false,
  });
  const { data: sub } = useSubscription();
  const { user } = useAuth();

  const load = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
      const cats = await api.get('/categories');
      setCategories(cats.data);
      if (sub?.plan === 'PRO') {
        const adv = await api.get('/reports/advanced');
        setAdvanced(adv.data.budzety ?? []);
      } else {
        setAdvanced([]);
      }
    } catch {
      setBudgets([]);
      setCategories([]);
      setAdvanced([]);
    }
  };

  useEffect(() => {
    load();
  }, [sub?.plan]);

  const create = async () => {
    const kwota = normalizeAmount(form.kwota);
    await api.post('/budgets', { ...form, kwota });
    load();
  };
  const canEdit = user?.rola === 'ADMIN' || user?.rola === 'USER';

  const openEdit = (b: Budget) => {
    setEditId(b.id);
    setEditForm({
      kategoriaId: b.kategoriaId ?? '',
      rok: b.rok,
      miesiac: b.miesiac,
      kwota: String(b.kwota),
      roluj: !!b.roluj,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const kwota = normalizeAmount(editForm.kwota);
    await api.patch(`/budgets/${editId}`, { ...editForm, kwota });
    setEditOpen(false);
    setEditId(null);
    load();
  };

  const removeBudget = async (id: string) => {
    if (!window.confirm('Czy na pewno usunąć budżet?')) return;
    await api.delete(`/budgets/${id}`);
    load();
  };

  const advancedMap = useMemo(() => {
    const map = new Map<string, AdvancedBudget>();
    for (const b of advanced) map.set(b.id, b);
    return map;
  }, [advanced]);

  const progressColor = (procent: number) => {
    if (procent >= 100) return 'error.main';
    if (procent >= 80) return 'warning.main';
    return 'primary.main';
  };

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Budżety
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Kategoria"
                fullWidth
                value={form.kategoriaId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kategoriaId: e.target.value }))
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nazwa}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Rok"
                type="number"
                fullWidth
                value={form.rok}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rok: Number(e.target.value) }))
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Miesiąc"
                type="number"
                fullWidth
                value={form.miesiac}
                onChange={(e) =>
                  setForm((f) => ({ ...f, miesiac: Number(e.target.value) }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={form.roluj}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, roluj: e.target.checked }))
                    }
                  />
                }
                label="Roluj niewykorzystane środki"
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
          {sub?.plan !== 'PRO' && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Zaawansowane wykorzystanie budżetu jest dostępne w planie Pro.
            </Typography>
          )}
          {!canEdit && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Konto Viewer nie może dodawać budżetów.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Stack spacing={1}>
        {budgets.map((b) => {
          const adv = advancedMap.get(b.id);
          const procent = adv?.procent ?? 0;
          return (
            <Card key={b.id}>
              <CardContent>
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  justifyContent="space-between"
                  alignItems={isMobile ? 'flex-start' : 'center'}
                  spacing={isMobile ? 1 : 0}
                >
                  <Typography variant="body1">
                    {b.kategoria?.nazwa} - {b.rok}/{b.miesiac} - {b.kwota} PLN
                  </Typography>
                  {sub?.plan === 'PRO' && (
                    <Chip
                      size="small"
                      label={`${procent}%`}
                      color={
                        procent >= 100
                          ? 'error'
                          : procent >= 80
                            ? 'warning'
                            : 'primary'
                      }
                      variant="outlined"
                    />
                  )}
                </Stack>
                {sub?.plan === 'PRO' && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Wydano: {adv?.wydano ?? 0} PLN ({procent}%)
                      {adv?.carryOver && adv.carryOver > 0 && (
                        <> • przeniesione: {adv.carryOver} PLN</>
                      )}
                      {adv?.available !== undefined &&
                        adv?.remaining !== undefined && (
                          <>
                            {' '}
                            • dostępne: {adv.available} PLN • pozostało:{' '}
                            {adv.remaining} PLN
                          </>
                        )}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, procent)}
                      sx={{
                        mt: 1,
                        height: 8,
                        bgcolor: '#eceff1',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: progressColor(procent),
                        },
                      }}
                    />
                    {procent >= 100 && (
                      <Typography variant="body2" color="error" mt={1}>
                        Przekroczono budżet.
                      </Typography>
                    )}
                    {procent >= 80 && procent < 100 && (
                      <Typography variant="body2" color="warning.main" mt={1}>
                        Zbliżasz się do limitu budżetu (80%).
                      </Typography>
                    )}
                  </>
                )}
                {canEdit && (
                  <Stack direction="row" spacing={1} mt={2}>
                    <IconButton size="small" onClick={() => openEdit(b)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeBudget(b.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {b.roluj && (
                      <Typography variant="body2" color="text.secondary">
                        Rolowanie włączone
                      </Typography>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          );
        })}
        {budgets.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak budżetów. Dodaj pierwszy budżet powyżej.
          </Typography>
        )}
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj budżet</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Kategoria"
                fullWidth
                value={editForm.kategoriaId}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, kategoriaId: e.target.value }))
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nazwa}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Rok"
                type="number"
                fullWidth
                value={editForm.rok}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, rok: Number(e.target.value) }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Miesiąc"
                type="number"
                fullWidth
                value={editForm.miesiac}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, miesiac: Number(e.target.value) }))
                }
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.roluj}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, roluj: e.target.checked }))
                    }
                  />
                }
                label="Roluj niewykorzystane środki"
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



