import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '@mui/material/styles';

export const Admin: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [plans, setPlans] = useState({ plan: 'PRO', stripePriceId: '' });
  const [categoryName, setCategoryName] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createUser, setCreateUser] = useState({
    email: '',
    haslo: '',
    rola: 'USER',
    plan: 'FREE',
    status: '',
    zablokowany: false,
  });
  const [createUserMessage, setCreateUserMessage] = useState<string | null>(
    null,
  );

  const [logFilters, setLogFilters] = useState({
    poziom: '',
    zawiera: '',
  });

  const { user } = useAuth();

  if (user?.rola !== 'ADMIN') {
    return (
      <Box>
        <Typography variant="h2" mb={2}>
          Admin
        </Typography>
        <Typography>Brak uprawnień do panelu admina.</Typography>
      </Box>
    );
  }

  const loadAll = async () => {
    setLoadError(null);
    const results = await Promise.allSettled([
      api.get('/admin/users'),
      api.get('/admin/categories'),
      api.get('/admin/subscriptions'),
      api.get('/admin/logs', { params: logFilters }),
    ]);
    const [u, c, s, l] = results;
    if (u.status === 'fulfilled') setUsers(u.value.data);
    if (c.status === 'fulfilled') setCategories(c.value.data);
    if (s.status === 'fulfilled') setSubs(s.value.data);
    if (l.status === 'fulfilled') setLogs(l.value.data);
    const rejected = results.find((r) => r.status === 'rejected');
    if (rejected) {
      setLoadError('Nie udało się pobrać części danych admina.');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const userCols: GridColDef[] = useMemo(
    () => [
      { field: 'email', headerName: 'E-mail', flex: 1 },
      {
        field: 'rola',
        headerName: 'Rola',
        flex: 0.7,
        renderCell: (params) => (
          <TextField
            select
            size="small"
            value={params.row.rola}
            onChange={(e) =>
              api
                .patch(`/admin/users/${params.row.id}/role`, {
                  rola: e.target.value,
                })
                .then(loadAll)
            }
          >
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="VIEWER">VIEWER</MenuItem>
          </TextField>
        ),
      },
      {
        field: 'zablokowany',
        headerName: 'Zablokowany',
        flex: 0.7,
        renderCell: (params) => (
          <Switch
            checked={!!params.row.zablokowany}
            onChange={(e) =>
              api
                .patch(
                  `/admin/users/${params.row.id}/${e.target.checked ? 'block' : 'unblock'}`,
                )
                .then(loadAll)
            }
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Akcje',
        flex: 1.2,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                api.patch(`/admin/users/${params.row.id}/block`).then(loadAll)
              }
            >
              Zablokuj
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                api.patch(`/admin/users/${params.row.id}/unblock`).then(loadAll)
              }
            >
              Odblokuj
            </Button>
          </Box>
        ),
      },
    ],
    [],
  );

  const subCols: GridColDef[] = useMemo(
    () => [
      { field: 'email', headerName: 'Użytkownik', flex: 1.2 },
      { field: 'plan', headerName: 'Plan', flex: 0.7 },
      { field: 'status', headerName: 'Status', flex: 0.8 },
      {
        field: 'currentPeriodEnd',
        headerName: 'Następne rozliczenie',
        flex: 1,
      },
    ],
    [],
  );

  const logCols: GridColDef[] = useMemo(
    () => [
      { field: 'poziom', headerName: 'Poziom', flex: 0.6 },
      { field: 'wiadomosc', headerName: 'Wiadomość', flex: 2 },
      { field: 'utworzono', headerName: 'Czas', flex: 1 },
    ],
    [],
  );

  const subRows = subs.map((s) => ({
    ...s,
    email: s.uzytkownik?.email,
    currentPeriodEnd: s.currentPeriodEnd?.slice(0, 10) ?? 'brak',
  }));

  const userColVisibility = useMemo(
    () =>
      isMobile
        ? {
            actions: false,
          }
        : {},
    [isMobile],
  );

  const subColVisibility = useMemo(
    () =>
      isMobile
        ? {
            status: false,
            currentPeriodEnd: false,
          }
        : {},
    [isMobile],
  );

  const logColVisibility = useMemo(
    () =>
      isMobile
        ? {
            wiadomosc: true,
            utworzono: false,
          }
        : {},
    [isMobile],
  );

  const handleCreateUser = async () => {
    setCreateUserMessage(null);
    if (!createUser.email || !createUser.haslo) {
      setCreateUserMessage('Podaj e-mail i hasło.');
      return;
    }
    try {
      const created = await api.post('/admin/users', {
        email: createUser.email,
        haslo: createUser.haslo,
        rola: createUser.rola,
        plan: createUser.plan,
        status: createUser.status || undefined,
        zablokowany: createUser.zablokowany,
      });
      setUsers((prev) => [created.data, ...prev]);
      setCreateUser({
        email: '',
        haslo: '',
        rola: 'USER',
        plan: 'FREE',
        status: '',
        zablokowany: false,
      });
      setCreateUserMessage('Użytkownik został utworzony.');
      await loadAll();
    } catch (e: any) {
      setCreateUserMessage(
        e?.response?.data?.message ?? 'Nie udało się utworzyć użytkownika.',
      );
    }
  };

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Admin
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Użytkownicy" />
        <Tab label="Subskrypcje" />
        <Tab label="Kategorie globalne" />
        <Tab label="Plany Stripe" />
        <Tab label="Logi systemowe" />
      </Tabs>
      {loadError && (
        <Typography variant="body2" color="error" mb={2}>
          {loadError}
        </Typography>
      )}

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h3" mb={2}>
              Dodaj użytkownika
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="E-mail"
                  fullWidth
                  value={createUser.email}
                  onChange={(e) =>
                    setCreateUser((u) => ({ ...u, email: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Hasło"
                  type="password"
                  fullWidth
                  value={createUser.haslo}
                  onChange={(e) =>
                    setCreateUser((u) => ({ ...u, haslo: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Rola"
                  fullWidth
                  value={createUser.rola}
                  onChange={(e) =>
                    setCreateUser((u) => ({ ...u, rola: e.target.value }))
                  }
                >
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="USER">USER</MenuItem>
                  <MenuItem value="VIEWER">VIEWER</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Plan"
                  fullWidth
                  value={createUser.plan}
                  onChange={(e) =>
                    setCreateUser((u) => ({ ...u, plan: e.target.value }))
                  }
                >
                  <MenuItem value="FREE">Free</MenuItem>
                  <MenuItem value="PRO">Pro</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={createUser.status}
                  onChange={(e) =>
                    setCreateUser((u) => ({ ...u, status: e.target.value }))
                  }
                >
                  <MenuItem value="">Domyślny</MenuItem>
                  <MenuItem value="AKTYWNA">AKTYWNA</MenuItem>
                  <MenuItem value="WSTRZYMANA">WSTRZYMANA</MenuItem>
                  <MenuItem value="ANULOWANA">ANULOWANA</MenuItem>
                  <MenuItem value="BRAK">BRAK</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
                >
                  <Switch
                    checked={createUser.zablokowany}
                    onChange={(e) =>
                      setCreateUser((u) => ({
                        ...u,
                        zablokowany: e.target.checked,
                      }))
                    }
                  />
                  <Typography variant="body2">Zablokowany</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreateUser}
                >
                  Utwórz
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button variant="outlined" fullWidth onClick={loadAll}>
                  Odśwież listę
                </Button>
              </Grid>
            </Grid>
            {createUserMessage && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {createUserMessage}
              </Typography>
            )}
            <Box sx={{ width: '100%' }}>
              <DataGrid
                autoHeight
                rows={users}
                columns={userCols}
                columnVisibilityModel={userColVisibility}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25, page: 0 } },
                }}
                density={isMobile ? 'compact' : 'standard'}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                autoHeight
                rows={subRows}
                columns={subCols}
                columnVisibilityModel={subColVisibility}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25, page: 0 } },
                }}
                density={isMobile ? 'compact' : 'standard'}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  label="Nowa kategoria globalna"
                  fullWidth
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() =>
                    api
                      .post('/admin/categories', { nazwa: categoryName })
                      .then(() => setCategoryName(''))
                      .then(loadAll)
                  }
                >
                  Dodaj kategorię
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                autoHeight
                rows={categories}
                columns={[
                  { field: 'nazwa', headerName: 'Nazwa', flex: 1 },
                  {
                    field: 'akcje',
                    headerName: 'Akcje',
                    flex: 0.6,
                    renderCell: (params) => (
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          api
                            .post(`/admin/categories/${params.row.id}/delete`)
                            .then(loadAll)
                        }
                      >
                        Usuń
                      </Button>
                    ),
                  },
                ]}
                columnVisibilityModel={isMobile ? { akcje: false } : {}}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25, page: 0 } },
                }}
                density={isMobile ? 'compact' : 'standard'}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Plan"
                  fullWidth
                  value={plans.plan}
                  onChange={(e) =>
                    setPlans((p) => ({ ...p, plan: e.target.value }))
                  }
                >
                  <MenuItem value="FREE">Free</MenuItem>
                  <MenuItem value="PRO">Pro</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Stripe Price ID"
                  fullWidth
                  value={plans.stripePriceId}
                  onChange={(e) =>
                    setPlans((p) => ({ ...p, stripePriceId: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() =>
                    api
                      .post('/admin/plans', plans)
                      .then(() => setPlans({ plan: 'PRO', stripePriceId: '' }))
                  }
                >
                  Zapisz mapowanie
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
              Mapowanie planów jest wymagane do Stripe Billing.
            </Typography>
          </CardContent>
        </Card>
      )}

      {tab === 4 && (
        <Card>
          <CardContent>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Poziom"
                  fullWidth
                  value={logFilters.poziom}
                  onChange={(e) =>
                    setLogFilters((f) => ({ ...f, poziom: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Zawiera"
                  fullWidth
                  value={logFilters.zawiera}
                  onChange={(e) =>
                    setLogFilters((f) => ({ ...f, zawiera: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" fullWidth onClick={loadAll}>
                  Filtruj logi
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                autoHeight
                rows={logs}
                columns={logCols}
                columnVisibilityModel={logColVisibility}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25, page: 0 } },
                }}
                density={isMobile ? 'compact' : 'standard'}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};



