import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { api } from '../api/client';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../auth/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';

interface TransactionRow {
  id: string;
  data: string;
  kwota: number;
  waluta: string;
  odbiorca: string;
  referencja?: string;
  kategoriaId?: string;
  kategoria?: { nazwa: string };
  metoda?: string;
  notatka?: string;
  czyUzgodnione?: boolean;
  flagaDuplikatu?: boolean;
}

interface Category {
  id: string;
  nazwa: string;
  globalna: boolean;
}

const normalizeAmount = (value: unknown) => {
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isNaN(num) ? value : num;
  }
  return value;
};

const schema = z.object({
  data: z.string().min(1, 'Data jest wymagana.'),
  kwota: z.preprocess(
    normalizeAmount,
    z.number().finite('Kwota musi być liczbą.'),
  ),
  waluta: z.string().length(3, 'Waluta musi mieć 3 znaki.').default('PLN'),
  odbiorca: z.string().min(2, 'Odbiorca musi mieć co najmniej 2 znaki.'),
  referencja: z.string().optional(),
  kategoriaId: z.string().optional(),
  metoda: z.string().optional(),
  notatka: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const Transactions: React.FC = () => {
  const LOW_CONFIDENCE_THRESHOLD = 0.4;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [filters, setFilters] = useState({
    od: '',
    do: '',
    kategoriaId: '',
    kwotaMin: '',
    kwotaMax: '',
    szukaj: '',
    waluta: '',
    metoda: '',
  });
  const { data: sub } = useSubscription();
  const { user } = useAuth();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    data: '',
    kwota: '',
    waluta: '',
    odbiorca: '',
    referencja: '',
    kategoria: '',
    metoda: '',
    notatka: '',
  });
  const [importErrors, setImportErrors] = useState<
    { wiersz: number; blad: string }[]
  >([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{
    data?: string;
    kwota?: number;
    waluta?: string;
    odbiorca?: string;
    metoda?: string;
    notatka?: string;
    confidence?: {
      data?: number;
      kwota?: number;
      waluta?: number;
      odbiorca?: number;
      metoda?: number;
      notatka?: number;
    };
  } | null>(null);
  const [receiptDraft, setReceiptDraft] = useState<{
    data?: string;
    kwota?: number;
    waluta?: string;
    odbiorca?: string;
    metoda?: string;
    notatka?: string;
  } | null>(null);
  const [lowConfidenceConfirmed, setLowConfidenceConfirmed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    data: '',
    kwota: '',
    waluta: 'PLN',
    odbiorca: '',
    referencja: '',
    kategoriaId: '',
    metoda: 'karta',
    notatka: '',
    czyUzgodnione: false,
  });

  const { register, handleSubmit, reset, formState, setValue, control } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        waluta: 'PLN',
        metoda: 'karta',
        kategoriaId: '',
        referencja: '',
        notatka: '',
      },
    });

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.nazwa])),
    [categories],
  );

  const load = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== '' && value !== undefined && value !== null,
        ),
      );
      const res = await api.get('/transactions', { params });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setRows(data);
    } catch {
      setRows([]);
    }
    try {
      const cats = await api.get('/categories');
      setCategories(cats.data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const openEdit = (row: TransactionRow) => {
    setEditId(row.id);
    setEditForm({
      data: row.data?.slice(0, 10) ?? '',
      kwota:
        row.kwota !== undefined && row.kwota !== null
          ? String(row.kwota)
          : '',
      waluta: row.waluta ?? 'PLN',
      odbiorca: row.odbiorca ?? '',
      referencja: row.referencja ?? '',
      kategoriaId: row.kategoriaId ?? '',
      metoda: row.metoda ?? 'karta',
      notatka: row.notatka ?? '',
      czyUzgodnione: !!row.czyUzgodnione,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const payload: any = {
      ...editForm,
      kwota: normalizeAmount(editForm.kwota),
    };
    try {
      const res = await api.patch(`/transactions/${editId}`, payload);
      const updated = res.data;
      setRows((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...updated } : r)),
      );
      setEditOpen(false);
      setEditId(null);
      load();
    } catch (e: any) {
      setImportResult(
        e?.response?.data?.message ?? 'Nie udało się zapisać zmian.',
      );
    }
  };

  const removeRow = async (id: string) => {
    if (!window.confirm('Czy na pewno usunąć transakcję?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      load();
    } catch (e: any) {
      setImportResult(
        e?.response?.data?.message ?? 'Nie udało się usunąć transakcji.',
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/transactions', data);
      if (res?.data?.id) {
        const katName =
          res.data.kategoria?.nazwa ??
          (res.data.kategoriaId
            ? categoryMap.get(res.data.kategoriaId)
            : undefined);
        setRows((prev) => [
          {
            ...res.data,
            kategoria: katName ? { nazwa: katName } : res.data.kategoria,
          },
          ...prev.filter((r) => r.id !== res.data.id),
        ]);
      }
      setImportResult(null);
      reset({ waluta: 'PLN', metoda: 'karta', kategoriaId: '' });
      load();
    } catch (e: any) {
      setImportResult(
        e?.response?.data?.message ?? 'Nie udało się dodać transakcji.',
      );
    }
  };

  const canEdit = user?.rola === 'ADMIN' || user?.rola === 'USER';
  const canExport = user?.rola !== 'VIEWER';
  const isPro = sub?.plan === 'PRO';

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'data', headerName: 'Data', flex: 1 },
      { field: 'kwota', headerName: 'Kwota', flex: 1 },
      { field: 'waluta', headerName: 'Waluta', flex: 0.7 },
      { field: 'odbiorca', headerName: 'Odbiorca', flex: 1.2 },
      {
        field: 'kategoria',
        headerName: 'Kategoria',
        flex: 1,
        valueGetter: (params) =>
          params?.row?.kategoria?.nazwa ??
          (params?.row?.kategoriaId
            ? categoryMap.get(params.row.kategoriaId) ?? ''
            : ''),
      },
      {
        field: 'czyUzgodnione',
        headerName: 'Uzgodnione',
        flex: 0.7,
        renderCell: (params) => (
          <span
            style={{
              display: 'inline-flex',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: params.row.czyUzgodnione ? '#e8f5e9' : '#eceff1',
              color: params.row.czyUzgodnione ? '#179d46' : '#546e7a',
            }}
          >
            {params.row.czyUzgodnione ? 'Tak' : 'Nie'}
          </span>
        ),
      },
      {
        field: 'flagaDuplikatu',
        headerName: 'Duplikat',
        flex: 0.7,
        renderCell: (params) => (
          <span
            style={{
              display: 'inline-flex',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: params.row.flagaDuplikatu ? '#ffebee' : '#eceff1',
              color: params.row.flagaDuplikatu ? '#e53935' : '#546e7a',
            }}
          >
            {params.row.flagaDuplikatu ? 'Tak' : 'Nie'}
          </span>
        ),
      },
      { field: 'referencja', headerName: 'Referencja', flex: 1 },
      {
        field: 'actions',
        headerName: 'Akcje',
        flex: 0.6,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edytuj">
              <span>
                <IconButton
                  size="small"
                  onClick={() => openEdit(params.row)}
                  disabled={!canEdit}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Usuń">
              <span>
                <IconButton
                  size="small"
                  onClick={() => removeRow(params.row.id)}
                  disabled={!canEdit}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [canEdit, categoryMap],
  );

  const columnVisibilityModel = useMemo(
    () =>
      isMobile
        ? {
            referencja: false,
            flagaDuplikatu: false,
            czyUzgodnione: false,
          }
        : {},
    [isMobile],
  );

  const handleImport = async () => {
    if (!importFile) return;
    if (!mapping.data || !mapping.kwota || !mapping.odbiorca) {
      setImportResult('Ustaw mapowanie pól: data, kwota, odbiorca.');
      return;
    }
    const text = await importFile.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    const rows = parsed.data.map((r) => ({
      data: r[mapping.data] ?? '',
      kwota: r[mapping.kwota] ?? '',
      waluta: r[mapping.waluta] ?? 'PLN',
      odbiorca: r[mapping.odbiorca] ?? '',
      referencja: r[mapping.referencja] ?? '',
      kategoria: r[mapping.kategoria] ?? '',
      metoda: r[mapping.metoda] ?? '',
      notatka: r[mapping.notatka] ?? '',
    }));

    const normalized = Papa.unparse(rows, { quotes: false });
    const blob = new Blob([normalized], { type: 'text/csv;charset=utf-8' });
    const form = new FormData();
    form.append('file', blob, 'normalized.csv');
    const res = await api.post('/transactions/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setImportResult(
      `Dodane: ${res.data.dodane}, duplikaty: ${res.data.duplikaty}, błędy: ${res.data.bledy.length}`,
    );
    setImportErrors(res.data.bledy ?? []);
    load();
  };

  const handleReceiptParse = async () => {
    if (!receiptFile) return;
    setReceiptStatus('Analizuję obraz...');
    setReceiptData(null);
    setReceiptDraft(null);
    setLowConfidenceConfirmed(false);
    const form = new FormData();
    form.append('file', receiptFile);
    try {
      const res = await api.post('/ai/receipt/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data?.data ?? {};
      const normalized = {
        data: data.data ?? undefined,
        kwota:
          data.kwota !== undefined && data.kwota !== null
            ? Number(data.kwota)
            : undefined,
        waluta: data.waluta ?? undefined,
        odbiorca: data.odbiorca ?? undefined,
        metoda: data.metoda ?? undefined,
        notatka: data.notatka ?? undefined,
        confidence: data.confidence ?? undefined,
      };
      setReceiptData(normalized);
      setReceiptDraft({
        data: normalized.data,
        kwota: normalized.kwota,
        waluta: normalized.waluta,
        odbiorca: normalized.odbiorca,
        metoda: normalized.metoda,
        notatka: normalized.notatka,
      });
      setReceiptStatus('Znaleziono dane. Sprawdź i zatwierdź.');
    } catch (e: any) {
      setReceiptStatus(
        e?.response?.data?.message ?? 'Nie udało się przetworzyć paragonu.',
      );
    }
  };

  const applyReceiptData = () => {
    if (!receiptDraft) return;
    if (hasLowConfidence && !lowConfidenceConfirmed) {
      setReceiptStatus(
        'Potwierdź pola o niskiej pewności przed zatwierdzeniem.',
      );
      return;
    }
    if (receiptDraft.data) setValue('data', receiptDraft.data);
    if (receiptDraft.kwota !== undefined)
      setValue('kwota', Number(receiptDraft.kwota));
    if (receiptDraft.waluta) setValue('waluta', receiptDraft.waluta);
    if (receiptDraft.odbiorca) setValue('odbiorca', receiptDraft.odbiorca);
    if (receiptDraft.metoda) setValue('metoda', receiptDraft.metoda);
    if (receiptDraft.notatka) setValue('notatka', receiptDraft.notatka);
    setReceiptStatus('Uzupełniono pola z paragonu.');
  };

  const lowConfidenceFields = useMemo(() => {
    if (!receiptData?.confidence) return [];
    return (
      [
        ['data', receiptData.confidence.data],
        ['kwota', receiptData.confidence.kwota],
        ['waluta', receiptData.confidence.waluta],
        ['odbiorca', receiptData.confidence.odbiorca],
        ['metoda', receiptData.confidence.metoda],
        ['notatka', receiptData.confidence.notatka],
      ] as const
    )
      .filter(
        ([, value]) => value !== undefined && value < LOW_CONFIDENCE_THRESHOLD,
      )
      .map(([key]) => key);
  }, [receiptData]);

  const hasLowConfidence = lowConfidenceFields.length > 0;

  const confidenceLabel = (value?: number) => {
    if (value === undefined) return 'Pewność: brak';
    const percent = Math.round(value * 100);
    return value < LOW_CONFIDENCE_THRESHOLD
      ? `Pewność: ${percent}% (niska)`
      : `Pewność: ${percent}%`;
  };

  const isLowConfidence = (value?: number) =>
    value !== undefined && value < LOW_CONFIDENCE_THRESHOLD;

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Transakcje
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h3" mb={1}>
            Dodaj transakcję
          </Typography>
          <Grid
            container
            spacing={2}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('data')}
                error={!!formState.errors.data}
                helperText={formState.errors.data?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Kwota"
                type="text"
                inputMode="decimal"
                fullWidth
                {...register('kwota')}
                error={!!formState.errors.kwota}
                helperText={formState.errors.kwota?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Controller
                control={control}
                name="waluta"
                render={({ field }) => (
                  <TextField
                    label="Waluta"
                    fullWidth
                    select
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!formState.errors.waluta}
                    helperText={formState.errors.waluta?.message}
                  >
                    {['PLN', 'EUR', 'USD', 'GBP'].map((w) => (
                      <MenuItem key={w} value={w}>
                        {w}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Odbiorca"
                fullWidth
                {...register('odbiorca')}
                error={!!formState.errors.odbiorca}
                helperText={formState.errors.odbiorca?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Controller
                control={control}
                name="metoda"
                render={({ field }) => (
                  <TextField
                    select
                    label="Metoda"
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  >
                    {[
                      { id: 'karta', label: 'Karta' },
                      { id: 'przelew', label: 'Przelew' },
                      { id: 'gotowka', label: 'Gotówka' },
                      { id: 'blikiem', label: 'BLIK' },
                    ].map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Controller
                control={control}
                name="kategoriaId"
                render={({ field }) => (
                  <TextField
                    select
                    label="Kategoria"
                    fullWidth
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  >
                    <MenuItem value="">Brak</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nazwa}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={!canEdit}
                sx={{ height: '100%' }}
              >
                Dodaj
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12} md={8}>
              <TextField label="Notatka" fullWidth {...register('notatka')} />
            </Grid>
            <Grid item xs={12} md={4}>
              {isPro && canEdit && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label">
                    Wybierz paragon
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setReceiptFile(file);
                        setReceiptStatus(null);
                        setReceiptData(null);
                        setReceiptDraft(null);
                        setLowConfidenceConfirmed(false);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!receiptFile}
                    onClick={handleReceiptParse}
                  >
                    Analizuj paragon
                  </Button>
                </Stack>
              )}
              {!isPro && (
                <Typography variant="body2" color="text.secondary">
                  Analiza paragonów jest dostępna w planie Pro.
                </Typography>
              )}
              {receiptFile && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {receiptFile.name}
                </Typography>
              )}
              {receiptStatus && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {receiptStatus}
                </Typography>
              )}
              {receiptData && receiptDraft && (
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" mb={1}>
                    Podgląd danych z paragonu
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Data"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={receiptDraft.data ?? ''}
                        onChange={(e) =>
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            data: e.target.value || undefined,
                          }))
                        }
                        error={isLowConfidence(receiptData.confidence?.data)}
                        helperText={confidenceLabel(
                          receiptData.confidence?.data,
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Kwota"
                        type="text"
                        inputMode="decimal"
                        fullWidth
                        value={
                          receiptDraft.kwota !== undefined
                            ? receiptDraft.kwota
                            : ''
                        }
                        onChange={(e) => {
                          const v = normalizeAmount(e.target.value);
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            kwota: typeof v === 'number' ? v : undefined,
                          }));
                        }}
                        error={isLowConfidence(receiptData.confidence?.kwota)}
                        helperText={confidenceLabel(
                          receiptData.confidence?.kwota,
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Waluta"
                        fullWidth
                        value={receiptDraft.waluta ?? ''}
                        onChange={(e) =>
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            waluta: e.target.value || undefined,
                          }))
                        }
                        error={isLowConfidence(receiptData.confidence?.waluta)}
                        helperText={confidenceLabel(
                          receiptData.confidence?.waluta,
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Odbiorca"
                        fullWidth
                        value={receiptDraft.odbiorca ?? ''}
                        onChange={(e) =>
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            odbiorca: e.target.value || undefined,
                          }))
                        }
                        error={isLowConfidence(
                          receiptData.confidence?.odbiorca,
                        )}
                        helperText={confidenceLabel(
                          receiptData.confidence?.odbiorca,
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Metoda"
                        fullWidth
                        value={receiptDraft.metoda ?? ''}
                        onChange={(e) =>
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            metoda: e.target.value || undefined,
                          }))
                        }
                        error={isLowConfidence(receiptData.confidence?.metoda)}
                        helperText={confidenceLabel(
                          receiptData.confidence?.metoda,
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Notatka"
                        fullWidth
                        value={receiptDraft.notatka ?? ''}
                        onChange={(e) =>
                          setReceiptDraft((d) => ({
                            ...(d ?? {}),
                            notatka: e.target.value || undefined,
                          }))
                        }
                        error={isLowConfidence(receiptData.confidence?.notatka)}
                        helperText={confidenceLabel(
                          receiptData.confidence?.notatka,
                        )}
                      />
                    </Grid>
                  </Grid>
                  {hasLowConfidence && (
                    <Box mt={1}>
                      <Typography variant="body2" color="error">
                        Wykryto pola o niskiej pewności. Sprawdź je i potwierdź.
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={lowConfidenceConfirmed}
                            onChange={(e) =>
                              setLowConfidenceConfirmed(e.target.checked)
                            }
                          />
                        }
                        label="Potwierdzam pola o niskiej pewności"
                      />
                    </Box>
                  )}
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button variant="contained" onClick={applyReceiptData}>
                      Zatwierdź i wstaw do formularza
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setReceiptData(null);
                        setReceiptDraft(null);
                      }}
                    >
                      Odrzuć
                    </Button>
                  </Stack>
                </Card>
              )}
            </Grid>
          </Grid>
          {!canEdit && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Konto Viewer nie może dodawać transakcji.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Data od"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.od}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, od: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Data do"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.do}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, do: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Kategoria"
                fullWidth
                value={filters.kategoriaId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, kategoriaId: e.target.value }))
                }
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nazwa}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Kwota min"
                type="number"
                fullWidth
                value={filters.kwotaMin}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, kwotaMin: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Kwota max"
                type="number"
                fullWidth
                value={filters.kwotaMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, kwotaMax: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Waluta"
                fullWidth
                value={filters.waluta}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, waluta: e.target.value }))
                }
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {['PLN', 'EUR', 'USD', 'GBP'].map((w) => (
                  <MenuItem key={w} value={w}>
                    {w}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Metoda"
                fullWidth
                value={filters.metoda}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, metoda: e.target.value }))
                }
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {[
                  { id: 'karta', label: 'Karta' },
                  { id: 'przelew', label: 'Przelew' },
                  { id: 'gotowka', label: 'Gotówka' },
                  { id: 'blikiem', label: 'BLIK' },
                ].map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Szukaj"
                fullWidth
                value={filters.szukaj}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, szukaj: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={load}
                sx={{ height: '100%' }}
              >
                Filtruj
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
        <Button
          variant="outlined"
          disabled={!canExport}
          onClick={async () => {
            const res = await api.get('/transactions/export', {
              params: { format: 'csv' },
              responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transakcje.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Eksport CSV
        </Button>
        <Button
          variant="outlined"
          disabled={!canExport}
          onClick={async () => {
            const res = await api.get('/transactions/export', {
              params: { format: 'xlsx' },
              responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transakcje.xlsx';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Eksport XLSX
        </Button>
        <Button variant="outlined" disabled={!isPro || !canEdit}>
          Import CSV (Pro)
        </Button>
      </Stack>
      {isPro && canEdit && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h3" mb={1}>
              Import CSV (Pro)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" component="label">
                Wybierz plik CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImportFile(file);
                    setImportErrors([]);
                    if (file) {
                      const text = await file.text();
                      const parsed = Papa.parse(text, { preview: 1 });
                      const headers = (parsed.data?.[0] as string[]) ?? [];
                      setCsvHeaders(headers.filter((h) => !!h));
                    } else {
                      setCsvHeaders([]);
                    }
                  }}
                />
              </Button>
              <Typography variant="body2">
                {importFile ? importFile.name : 'Nie wybrano pliku'}
              </Typography>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={!importFile}
              >
                Importuj
              </Button>
            </Stack>
            {csvHeaders.length > 0 && (
              <Grid container spacing={2} mt={1}>
                {(
                  [
                    ['data', 'Data'],
                    ['kwota', 'Kwota'],
                    ['waluta', 'Waluta'],
                    ['odbiorca', 'Odbiorca'],
                    ['referencja', 'Referencja'],
                    ['kategoria', 'Kategoria'],
                    ['metoda', 'Metoda'],
                    ['notatka', 'Notatka'],
                  ] as const
                ).map(([key, label]) => (
                  <Grid item xs={12} md={3} key={key}>
                    <TextField
                      select
                      label={`Mapowanie: ${label}`}
                      fullWidth
                      value={mapping[key]}
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [key]: e.target.value }))
                      }
                    >
                      <MenuItem value="">Brak</MenuItem>
                      {csvHeaders.map((h) => (
                        <MenuItem key={h} value={h}>
                          {h}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                ))}
              </Grid>
            )}
            {importResult && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {importResult}
              </Typography>
            )}
            {importErrors.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="error">
                  Błędy importu:
                </Typography>
                {importErrors.slice(0, 10).map((e, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    Wiersz {e.wiersz}: {e.blad}
                  </Typography>
                ))}
                {importErrors.length > 10 && (
                  <Typography variant="body2" color="text.secondary">
                    ... i {importErrors.length - 10} kolejnych błędów.
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj transakcję</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editForm.data}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, data: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Waluta"
                fullWidth
                value={editForm.waluta}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, waluta: e.target.value }))
                }
              >
                {['PLN', 'EUR', 'USD', 'GBP'].map((w) => (
                  <MenuItem key={w} value={w}>
                    {w}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Odbiorca"
                fullWidth
                value={editForm.odbiorca}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, odbiorca: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Referencja"
                fullWidth
                value={editForm.referencja}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, referencja: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Kategoria"
                fullWidth
                value={editForm.kategoriaId}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, kategoriaId: e.target.value }))
                }
              >
                <MenuItem value="">Brak</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nazwa}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Metoda"
                fullWidth
                value={editForm.metoda}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, metoda: e.target.value }))
                }
              >
                <MenuItem value="karta">Karta</MenuItem>
                <MenuItem value="przelew">Przelew</MenuItem>
                <MenuItem value="gotowka">Gotówka</MenuItem>
                <MenuItem value="blikiem">Blik</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Notatka"
                fullWidth
                value={editForm.notatka}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notatka: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editForm.czyUzgodnione}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        czyUzgodnione: e.target.checked,
                      }))
                    }
                  />
                }
                label="Uzgodnione"
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

      <Card>
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25, page: 0 } },
              }}
              columnVisibilityModel={columnVisibilityModel}
              disableRowSelectionOnClick
              density={isMobile ? 'compact' : 'standard'}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  background: 'rgba(10,37,64,0.04)',
                  color: '#0a2540',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  background: 'rgba(46,214,161,0.06)',
                },
              }}
            />
          </Box>
          {rows.length === 0 && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              Brak transakcji do wyświetlenia.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};




