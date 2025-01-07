'use client';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

const HomePage: React.FC = () => {
  const router = useRouter();

  const goToNewEvent = () => router.push('/events/new');

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
          mx: { xs: '5%', sm: '10%', md: '15%' }, // 左右の余白を画面幅に合わせて調整
          mt: { xs: '5%', sm: '2%' }, // 上部にマージンを追加、モバイルでは少し大きく
          backgroundColor: 'white',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            marginBottom: '16px',
            fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' }, // フォントサイズを画面幅に合わせて調整
            textAlign: 'center',
          }}
        >
          新しいイベントを作成します。
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={goToNewEvent}
          sx={{
            backgroundColor: 'white', // 通常の背景を白に
            color: 'primary.main', // 通常の文字とアイコンを青色に
            border: '2px solid', // 外枠を青色に
            borderColor: 'primary.main',
            borderRadius: '24px', // ボタンの角を丸く
            paddingY: { xs: '10px', sm: '12px', md: '14px' }, // 縦の余白をデバイスに合わせて調整
            paddingX: { xs: '20px', sm: '24px', md: '28px' }, // 横の余白をデバイスに合わせて調整
            textTransform: 'none', // テキストを通常のケースに
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, // ボタン内のフォントサイズを調整
            '&:hover': {
              backgroundColor: 'primary.main', // ホバー時の背景色を青に
              color: 'white', // ホバー時の文字とアイコンを白に
              borderColor: 'primary.main', // 枠線を青色に
              '.MuiSvgIcon-root': {
                color: 'white', // ホバー時にアイコンを白に
              },
            },
            width: { xs: '100%', sm: 'auto' }, // モバイルではボタン幅を100%に
          }}
        >
          <Add
            sx={{
              display: { xs: 'none', md: 'flex' }, // モバイルではアイコンを非表示
              mr: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, // アイコンのサイズをデバイスに合わせて調整
              color: 'primary.main', // アイコンを青色に
            }}
          />
          新規イベント
        </Button>
      </Box>
    </div>
  );
};

export default HomePage;
