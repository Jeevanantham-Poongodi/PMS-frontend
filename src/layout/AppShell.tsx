import { useState, type ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  AlertOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FieldTimeOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import type { Health, Me } from '../api'
import { FLOW_PATHS } from '../state/flowPaths'

// The signed-in frame: navigation to the dashboard, the five flows, stock and items, and an app
// bar with the user and sign-out. The drawer is permanent on wide screens, a menu on phones.

const DRAWER_WIDTH = 240

type NavItem = { to: string; label: string; icon: ReactNode }

const OVERVIEW: NavItem[] = [{ to: '/', label: 'Dashboard', icon: <DashboardOutlined /> }]
const FLOWS: NavItem[] = [
  { to: `/flows/${FLOW_PATHS[1]}`, label: 'Procurement', icon: <ShoppingCartOutlined /> },
  { to: `/flows/${FLOW_PATHS[2]}`, label: 'Ward indent', icon: <ApartmentOutlined /> },
  { to: `/flows/${FLOW_PATHS[3]}`, label: 'Dispensing', icon: <MedicineBoxOutlined /> },
  { to: `/flows/${FLOW_PATHS[4]}`, label: 'Expiry', icon: <FieldTimeOutlined /> },
  { to: `/flows/${FLOW_PATHS[5]}`, label: 'Recall', icon: <AlertOutlined /> },
]
const RECORDS: NavItem[] = [
  { to: '/stock', label: 'Stock', icon: <DatabaseOutlined /> },
  { to: '/items', label: 'Items', icon: <AppstoreOutlined /> },
]

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

export function AppShell({
  me,
  health,
  onSignOut,
  children,
}: {
  me: Me
  health: Health | null
  onSignOut: () => void
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const section = (title: string, items: NavItem[]) => (
    <List dense subheader={<ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px' }}>{title}</ListSubheader>}>
      {items.map((item) => (
        <ListItemButton
          key={item.to}
          component={RouterLink}
          to={item.to}
          selected={isActive(pathname, item.to)}
          onClick={() => setOpen(false)}
          sx={{ borderRadius: 2, mx: 1, '&.Mui-selected': { color: 'primary.main', fontWeight: 600 } }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: 'inherit', fontSize: 16 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  )

  const navigation = (
    <Box component="nav" aria-label="Main" sx={{ py: 1 }}>
      {section('Overview', OVERVIEW)}
      {section('Flows', FLOWS)}
      {section('Records', RECORDS)}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setOpen(true)} sx={{ display: { md: 'none' } }}>
            <MenuOutlined />
          </IconButton>
          <Typography component={RouterLink} to="/" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', flex: 1 }} noWrap>
            Hospital Pharmacy
          </Typography>
          {health && health.status !== 'ok' && (
            <Chip size="small" color="warning" label={health.database === 'unreachable' ? 'Database unreachable' : 'Degraded'} />
          )}
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, mr: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {me.display_name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {me.roles.join(', ') || 'no role'}
            </Typography>
          </Box>
          <Button color="inherit" size="small" startIcon={<LogoutOutlined />} onClick={onSignOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        <Toolbar />
        <Divider />
        {navigation}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        {navigation}
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
