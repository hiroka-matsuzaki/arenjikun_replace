'use client';

import { EventList, EventResponse } from '@/types/event';
import { Backdrop, Box, Button, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const EventDetail: React.FC = () => {
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
          <Backdrop open={onOff} onClick={() => setonOff(false)}>
            <Typography>入力画面を出す</Typography>
          </Backdrop>
          <Button onClick={() => setonOff(true)}>ユーザーを追加して参加不参加を入力する</Button>
        </Box>
      </Box>
    </>
  );
};

export default EventDetail;
