"use client";

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

const HomePage: React.FC = () => {
  const router = useRouter();

  const goToNewEvent = () => router.push("/events");
  return (
    <div>
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '20vh', // 縦方向の中央揃え
        border: '1px solid #ccc', // 四角の枠線
        borderRadius: '8px', // 四角の角を丸める
        padding: '20px', // 内側の余白
        boxShadow: 2, // 影を追加
        mx: '15%', // 左右の余白を画面幅の3%に設定
        mt: '2%', // 上部に20pxのマージンを追加
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        新しいイベントを作成します。
      </Typography>
      <Button variant="contained" color="primary" onClick={goToNewEvent} >
          <Add sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '2rem' }} />
          新規イベント
        </Button>
    </Box>
    </div>
  );
};

export default HomePage;
