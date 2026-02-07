import React from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';
import RepeatIcon from '@mui/icons-material/Repeat';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/logo.svg';
import { AiAssistant } from '../components/AiAssistant';

const drawerWidth = 260;

const MenuLink: React.FC<{
  to: string;
  label: string;
  icon: React.ReactNode;
}> = ({ to, label, icon }) => {
  const location = useLocation();
  const selected = location.pathname.startsWith(to);
  return (
    <ListItemButton component={Link} to={to} selected={selected}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

export const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen((open) => !open);

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          gap: 1,
          minHeight: { xs: 72, md: 84 },
          px: 2,
        }}
      >
        <img
          src={logo}
          alt="FinSync"
          style={{
            width: 'clamp(56px, 8vw, 96px)',
            height: 'auto',
          }}
        />
      </Toolbar>
      <Divider />
      <List>
        <MenuLink to="/app/dashboard" label="Pulpit" icon={<DashboardIcon />} />
        <MenuLink
          to="/app/transactions"
          label="Transakcje"
          icon={<ReceiptLongIcon />}
        />
        <MenuLink
          to="/app/budgets"
          label="Budżety"
          icon={<AccountBalanceWalletIcon />}
        />
        <MenuLink to="/app/categories" label="Kategorie" icon={<CategoryIcon />} />
        <MenuLink to="/app/recurring" label="Cykliczne" icon={<RepeatIcon />} />
        <MenuLink to="/app/reports" label="Raporty" icon={<InsightsIcon />} />
        <MenuLink to="/app/audit" label="Audyt" icon={<FactCheckIcon />} />
        {user?.rola !== 'VIEWER' && (
          <MenuLink
            to="/app/subscription"
            label="Subskrypcja"
            icon={<WorkspacePremiumIcon />}
          />
        )}
        {user?.rola !== 'VIEWER' && (
          <MenuLink to="/app/settings" label="Ustawienia" icon={<SettingsIcon />} />
        )}
        {user?.rola === 'ADMIN' && (
          <MenuLink to="/app/admin" label="Admin" icon={<AdminPanelSettingsIcon />} />
        )}
      </List>
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage:
          'radial-gradient(circle at 10% 0%, rgba(46,214,161,0.15), transparent 40%), radial-gradient(circle at 90% 10%, rgba(21,101,192,0.12), transparent 45%)',
      }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#ffffff',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#ffffff',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile && (
                <IconButton onClick={handleDrawerToggle} color="primary">
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" fontWeight={700}>
                Panel użytkownika
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{user?.email}</Typography>
              <IconButton onClick={logout} color="primary">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
      <AiAssistant />
    </Box>
  );
};
