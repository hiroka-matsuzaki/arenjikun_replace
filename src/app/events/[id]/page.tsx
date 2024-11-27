/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { EventResponse } from '@/types/event';
import Grid from '@mui/material/Grid2';

import {
  Backdrop,
  Box,
  Button,
  FormControl,
  FormLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { Add, EmojiPeople } from '@mui/icons-material';

const EventDetail: React.FC = () => {
  const { user } = useUser(); // UserContextからユーザー情報を取得

  const [eventDetail, setEventDetail] = useState<EventResponse>(); //
  const { id } = useParams();
  // イベントを取得する関数
  const fetchEventDetail = async () => {
    try {
      // const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL;

      const response = await fetch(`https://azure-api-opf.azurewebsites.net/api/events/${id}`);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data: EventResponse = await response.json();
      setEventDetail(data);
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  // 初回レンダリング時のみ実行
  useEffect(() => {
    fetchEventDetail();
  }, []); // 空の依存配列
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  const convertToShortWeekday = (weekday: string): string => {
    const weekdayMap: { [key: string]: string } = {
      日曜日: '日',
      月曜日: '月',
      火曜日: '火',
      水曜日: '水',
      木曜日: '木',
      金曜日: '金',
      土曜日: '土',
    };
    return weekdayMap[weekday] || '';
  };
  const [onOff, setonOff] = React.useState(false);
  return (
    <>
      <Box
        display="flex"
        sx={{
          justifyContent: 'left',
          height: '80px', // 縦方向の中央揃え
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '10%', // 左右の余白を画面幅の3%に設定
          mt: '2%', // 上部に20pxのマージンを追加
        }}
      >
        <Typography variant="h4" gutterBottom>
          {eventDetail?.events.subject}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          // height: '70vh', // ボックス全体の高さ
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '10%', // 左右の余白を画面幅の3%に設定
          backgroundColor: 'white',
          gap: 4,
        }}
      >
        <Box>
          <Typography gutterBottom>会議室・会場・備考等</Typography>
          {eventDetail?.events.description}
        </Box>
        <Box>
          <Typography gutterBottom>イベント参加の状況</Typography>
          {eventDetail?.event_dates?.map((eventDate) => {
            // 日付のフォーマット
            const formattedDate = new Date(eventDate.dated_on);
            const options: Intl.DateTimeFormatOptions = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            };
            const dateString = formattedDate.toLocaleDateString('ja-JP', options);

            // 曜日を取得して変換
            const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
            const weekday = formattedDate.toLocaleDateString('ja-JP', weekdayOptions);
            const shortWeekday = convertToShortWeekday(weekday); // （木）形式に変換

            // 開始時間と終了時間のフォーマット
            const startTime = formatTime(eventDate.start_time);
            const endTime = formatTime(eventDate.end_time);

            return (
              <Box
                key={eventDate.id}
                sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <Typography variant="h6">{`${dateString} (${shortWeekday}) ${startTime}-${endTime}`}</Typography>
              </Box>
            );
          })}
        </Box>
        <Box>
          <Typography gutterBottom>参加・不参加の入力</Typography>

          {/* Backdrop */}
          <Backdrop
            open={onOff}
            onClick={() => setonOff(false)} // 背景クリックで閉じる
            sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }}
          />
          {/* モーダル風フォーム */}
          {onOff && (
            <Box
              sx={{
                position: 'fixed',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
                boxShadow: 24,
                zIndex: (theme) => theme.zIndex.modal, // Backdropより上に表示
                width: '70%',
              }}
            >
              <Typography variant="h5" gutterBottom>
                参加・不参加の入力
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'left',
                  justifyContent: 'left',
                  // height: '70vh', // ボックス全体の高さ
                  border: '1px solid #ccc', // 四角の枠線
                  padding: '20px', // 内側の余白
                  backgroundColor: 'white',
                }}
              >
                <Grid container spacing={2}>
                  {/* ログインID */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                        <FormLabel>ログインID</FormLabel>
                      </Box>
                      <OutlinedInput defaultValue={user?.login_code} disabled />
                    </FormControl>
                  </Grid>

                  {/* 社員番号 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                        <FormLabel>社員番号</FormLabel>
                      </Box>
                      <OutlinedInput defaultValue="99999" disabled />
                    </FormControl>
                  </Grid>

                  {/* 会社 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                        <FormLabel>会社</FormLabel>
                      </Box>
                      <OutlinedInput defaultValue={user?.company} disabled />
                    </FormControl>
                  </Grid>

                  {/* 部署 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                        <FormLabel>部署</FormLabel>
                      </Box>
                      <OutlinedInput defaultValue={user?.department} disabled />
                    </FormControl>
                  </Grid>
                  <FormControl fullWidth>
                    <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                      <FormLabel>名前</FormLabel>
                    </Box>
                    <OutlinedInput defaultValue={user?.user_name} disabled />
                  </FormControl>
                </Grid>
              </Box>
              {/* ボタン */}
              <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: '#a0c4ff', // 薄い青の背景色
                    '&:hover': {
                      backgroundColor: '#7bb7f0', // ホバー時の色
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1, // アイコンと文字の間にスペースを追加
                  }}
                >
                  登録
                  <Add sx={{ fontSize: 20 }} /> {/* アイコンのサイズを調整 */}
                </Button>
              </Box>
            </Box>
          )}

          {/* トリガーボタン */}
          <Button
            onClick={() => setonOff(true)}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#a0c4ff', // 薄い青の背景色
              '&:hover': {
                backgroundColor: '#7bb7f0', // ホバー時の色
              },
              display: 'flex',
              alignItems: 'center',
              gap: 1, // アイコンと文字の間にスペースを追加
            }}
          >
            <Typography sx={{ fontSize: 18, textAlign: 'left', whiteSpace: 'pre-line' }}>
              ユーザーを追加して
              <br /> 参加不参加を入力する
            </Typography>
            <EmojiPeople sx={{ fontSize: 60 }} /> {/* アイコンのサイズを調整 */}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default EventDetail;
