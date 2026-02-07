import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../api/client';

export const AiAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; mode?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [mode, setMode] = useState<'help' | 'analysis' | 'report'>('help');

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: msg, mode }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: msg, mode });
      setMessages((m) => [...m, { role: 'ai', text: res.data.reply, mode }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Nie udało się uzyskać odpowiedzi AI.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/report');
      setReport(res.data.reply);
    } catch {
      setReport('Nie udało się wygenerować raportu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          bgcolor: 'primary.main',
          color: 'white',
          boxShadow: '0 10px 25px rgba(10,37,64,0.25)',
          '&:hover': { bgcolor: 'primary.dark' },
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <SmartToyIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            bgcolor: '#ffffff',
            opacity: 1,
            boxShadow: '0 24px 60px rgba(10,37,64,0.35)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h3">Asystent AI</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Pomoc w obsłudze systemu i analiza budżetu.
          </Typography>

          <Card sx={{ mb: 2, bgcolor: '#f5f7fb' }}>
            <CardContent>
              <Typography variant="h4" mb={1}>
                Raport budżetu
              </Typography>
              <Button
                variant="contained"
                onClick={generateReport}
                disabled={loading}
              >
                Generuj raport
              </Button>
              {report && (
                <Typography variant="body2" mt={2} whiteSpace="pre-line">
                  {report}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} mb={1}>
            {[
              { id: 'help', label: 'Pomoc' },
              { id: 'analysis', label: 'Analiza' },
              { id: 'report', label: 'Raport' },
            ].map((m) => (
              <Button
                key={m.id}
                size="small"
                variant={mode === m.id ? 'contained' : 'outlined'}
                onClick={() => setMode(m.id as any)}
              >
                {m.label}
              </Button>
            ))}
          </Stack>

          <Stack
            spacing={1}
            sx={{ maxHeight: { xs: '40vh', sm: 360 }, overflow: 'auto', mb: 2 }}
          >
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  bgcolor: m.role === 'user' ? 'primary.main' : '#eef2f7',
                  color: m.role === 'user' ? 'white' : 'text.primary',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '85%',
                  border: m.role === 'user' ? 'none' : '1px solid #d9e2ef',
                }}
              >
                <Typography variant="body2">{m.text}</Typography>
              </Box>
            ))}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              placeholder="Zadaj pytanie..."
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
            />
            <Button variant="contained" onClick={send} disabled={loading}>
              Wyślij
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};





