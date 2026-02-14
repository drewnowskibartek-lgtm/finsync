import React from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/logo.svg';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goApp = () => {
    if (user) {
      navigate('/app/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(21,101,192,0.12) 0%, rgba(46,214,161,0.12) 50%, rgba(10,37,64,0.12) 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          background:
            'radial-gradient(circle, rgba(46,214,161,0.18) 0%, rgba(46,214,161,0) 70%)',
          filter: 'blur(8px)',
          animation: 'float 10s ease-in-out infinite',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          background:
            'radial-gradient(circle, rgba(21,101,192,0.20) 0%, rgba(21,101,192,0) 70%)',
          filter: 'blur(8px)',
          animation: 'float 12s ease-in-out infinite reverse',
          zIndex: 0,
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(18px)' },
        },
      }}
    >
      <Box
        sx={{
          borderBottom: '1px solid rgba(10,37,64,0.08)',
          background: '#fff',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2 }}
          >
            <Box
              component="img"
              src={logo}
              alt="FinSync"
              sx={{ height: { xs: 48, md: 56 } }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={goApp}>
                Zaloguj się
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#1565c0' }}
                onClick={goApp}
              >
                Przejdź do aplikacji
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#0a2540',
                mb: 2,
              }}
            >
              FinSync – budżet bez chaosu
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: '#455a64', mb: 3, lineHeight: 1.6 }}
            >
              Porządkuj finanse osobiste w jednym miejscu. Rejestruj transakcje,
              planuj budżety, sprawdzaj raporty i miej pełną kontrolę nad
              wydatkami.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{ backgroundColor: '#1565c0' }}
                onClick={goApp}
              >
                Zacznij porządkować budżet
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ borderColor: '#2ed6a1', color: '#0a2540' }}
                onClick={() => navigate('/login')}
              >
                Przejdź do logowania
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background:
                  'linear-gradient(180deg, rgba(21,101,192,0.10) 0%, rgba(46,214,161,0.10) 100%)',
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  background: '#fff',
                  borderRadius: 3,
                  border: '1px solid rgba(10,37,64,0.08)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(246,249,252,0.95) 100%)',
                  boxShadow: '0 10px 24px rgba(10,37,64,0.12)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 18px 44px rgba(10,37,64,0.18)',
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#0a2540', fontWeight: 700, mb: 1 }}
                >
                  Dlaczego FinSync
                </Typography>
                <Stack spacing={1}>
                  <Typography sx={{ color: '#455a64' }}>
                    ? Jeden pulpit z kluczowymi liczbami
                  </Typography>
                  <Typography sx={{ color: '#455a64' }}>
                    ? Bud?ety, limity i szybkie alerty
                  </Typography>
                  <Typography sx={{ color: '#455a64' }}>
                    ? Raporty miesi?czne i trendy
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 } }}>
          {[
            {
              title: 'Przejrzysty dashboard',
              desc: 'Przychody, wydatki, saldo i trend 12 miesięcy w jednym widoku.',
            },
            {
              title: 'Transakcje pod kontrolą',
              desc: 'Dodawanie, filtrowanie, wykrywanie duplikatów i pełna historia.',
            },
            {
              title: 'Budżety i rolowanie',
              desc: 'Ustaw limity, obserwuj wykorzystanie i przenoś niewykorzystane środki.',
            },
            {
              title: 'Asystent AI',
              desc: 'Analiza paragonów, podsumowania i wsparcie w obsłudze aplikacji.',
            },
            {
              title: 'Plany i uprawnienia',
              desc: 'Free/Pro, role użytkowników i bezpieczna izolacja danych.',
            },
            {
              title: 'Raporty i eksport',
              desc: 'Raporty miesięczne oraz eksport do CSV/Excel.',
            },
          ].map((item) => (
            <Grid key={item.title} item xs={12} md={6} lg={4}>
              <Card
                sx={{
                  p: 2.5,
                  height: '100%',
                  border: '1px solid rgba(10,37,64,0.08)',
                  boxShadow: '0 8px 24px rgba(10,37,64,0.10)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 40px rgba(10,37,64,0.18)',
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: '#0a2540', mb: 1 }}
                >
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#455a64' }}>{item.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mt: { xs: 4, md: 6 } }}>
          {[
            {
              value: '12+',
              label: 'miesięcy trendów w dashboardzie',
            },
            {
              value: '0 zł',
              label: 'ukrytych kosztów w planie Free',
            },
            {
              value: '3',
              label: 'role użytkowników i pełna kontrola dostępu',
            },
            {
              value: '1 klik',
              label: 'eksport raportów do CSV/Excel',
            },
          ].map((stat) => (
            <Grid key={stat.label} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  border: '1px solid rgba(10,37,64,0.08)',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: '#1565c0' }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ color: '#455a64' }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            background: '#0a2540',
            color: '#eceff1',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Gotowy, aby uporządkować finanse?
              </Typography>
              <Typography sx={{ color: '#b0bec5' }}>
                Zaloguj się i przejdź do panelu – wszystko jest już przygotowane.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              sx={{ backgroundColor: '#2ed6a1', color: '#0a2540' }}
              onClick={goApp}
            >
              Wejdź do panelu FinSync
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
