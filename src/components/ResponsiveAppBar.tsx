'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { Add, CalendarMonth, Info, Person, Search } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const pages = [
  {
    id: 1,
    name: '一覧',
    path: '/events',
    icon: <Search sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '2rem' }} />,
  },
  {
    id: 2,
    name: '新規イベント',
    path: '/events/new',
    icon: <Add sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '2rem' }} />,
  },
  {
    id: 3,
    name: '使い方',
    path: '/manual',
    icon: <Info sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '2rem' }} />,
  },
];

interface Props {
  userName: string | null; // ユーザー名を受け取るプロパティ
}

const ResponsiveAppBar: React.FC<Props> = ({ userName }) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  // const handleButtonClick = () => {
  //   handleCloseNavMenu(); // メニューを閉じる
  // };
  const router = useRouter();

  // ページ遷移の共通関数
  const goTo = (path: string) => {
    if (path === '/manual') {
      window.open('./app/sample.pdf', '_blank');
    } else router.push(path);
  };

  return (
    <AppBar
      position="static"
      sx={{ paddingY: '0px', minHeight: '0px', backgroundColor: '#333333' }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <CalendarMonth sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '3rem' }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '1.5rem',
            }}
          >
            アレンジ君
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: 'center', ml: 1 }} onClick={() => goTo(page.path)}>
                    {page.name}
                  </Typography>{' '}
                  {/* アイコンとテキストの間にマージンを追加 */}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            アレンジ君
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              // eslint-disable-next-line react/jsx-key
              <Button
                key={page.id}
                sx={{ my: 2, color: 'white', display: 'flex', alignItems: 'center' }}
                onClick={() => goTo(page.path)}
              >
                {page.icon}
                {page.name}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Person sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            {userName ? (
              <Typography
                sx={{
                  fontSize: {
                    xs: '0', // 小さい画面ではフォントサイズを小さく
                    sm: '1rem', // 中くらいの画面では標準のフォントサイズ
                    md: '1.125rem', // 大きい画面では少し大きく
                  },
                  fontWeight: 'bold', // ユーザー名を強調するために太字
                }}
              >
                {userName}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontSize: {
                    xs: '0', // 小さい画面ではフォントサイズを小さく
                    sm: '1rem', // 中くらいの画面では標準のフォントサイズ
                    md: '1.125rem', // 大きい画面では少し大きく
                  },
                }}
              >
                login
              </Typography>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
