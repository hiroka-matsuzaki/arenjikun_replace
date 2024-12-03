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
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { EmojiPeople } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';

// フォームデータの型
type FormData = {
  [key: string]: string | number; // 動的に生成されるフィールドをサポート
};

const EventDetail: React.FC = () => {
  const { user } = useUser(); // UserContextからユーザー情報を取得

  const [eventDetail, setEventDetail] = useState<EventResponse>();
  const params = useParams();
  const id = params?.id as string | undefined;

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
  const { handleSubmit, control } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const formattedData = eventDetail?.event_dates.map((event, index) => ({
      dated_on: event.dated_on,
      start_time: event.start_time,
      end_time: event.end_time,
      possibility: data[`possibility_${index}`] as number,
      comment: data[`comment_${index}`] as string,
    }));

    console.log('送信データ:', formattedData);
    // ここでPOSTリクエストを送信
    try {
      // 1. GETリクエストで user_id を取得
      const userEmail = user?.email;
      if (!userEmail) {
        throw new Error('ユーザーのメールアドレスが見つかりません。');
      }

      const userResponse = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/users?email=${userEmail}`
      );

      if (!userResponse.ok) {
        throw new Error(`ユーザーID取得エラー: ${userResponse.statusText}`);
      }

      const userId = await userResponse.text();
      console.log('取得したユーザーID:', userId);

      // 2. PUTリクエストで formattedData を送信

      const updateResponse = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/events/${id}/update_join?user_id=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`更新エラー: ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.text();
      console.log('更新結果:', updateResult);

      alert('データが正常に送信されました！');
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラー:', error.message);
        alert('エラーが発生しました: ' + error.message);
      } else {
        console.error('未知のエラー:', error);
        alert('未知のエラーが発生しました。');
      }
    }
  };
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
          {onOff && (
            <Box
              sx={{
                position: 'fixed',
                top: '3%', // 上部に配置
                left: '50%',
                transform: 'translateX(-50%)', // 横方向に中央配置
                bgcolor: 'background.paper',
                p: 2, // パディングを少し小さくしてコンパクトに
                borderRadius: 2,
                boxShadow: 24,
                zIndex: (theme) => theme.zIndex.modal, // Backdropより上に表示
                width: '80%', // 幅を調整
                maxWidth: '800px', // 最大幅を指定（任意）
                height: 'auto', // 高さは自動調整
                border: '3px solid red',
                overflowY: 'auto', // はみ出す部分はスクロール
              }}
            >
              <Typography variant="h5" gutterBottom>
                参加・不参加の入力
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start', // 左寄せ
                  // border: '1px solid #ccc',
                  padding: 2, // 内側の余白
                  backgroundColor: 'white',
                  borderRadius: 1, // 角丸を少しつける
                  mb: 2, // 下に余白を追加
                  border: '3px solid green',
                }}
              >
                <Grid container spacing={2}>
                  {/* ログインID */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>ログインID</FormLabel>
                      <OutlinedInput defaultValue={user?.login_code} disabled />
                    </FormControl>
                  </Grid>

                  {/* 社員番号 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>社員番号</FormLabel>
                      <OutlinedInput defaultValue="99999" disabled />
                    </FormControl>
                  </Grid>

                  {/* 会社 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>会社</FormLabel>
                      <OutlinedInput defaultValue={user?.companyts} disabled />
                    </FormControl>
                  </Grid>

                  {/* 部署 */}
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>部署</FormLabel>
                      <OutlinedInput defaultValue={user?.department} disabled />
                    </FormControl>
                  </Grid>

                  {/* 名前 */}
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel>名前</FormLabel>
                      <OutlinedInput defaultValue={user?.user_name} disabled />
                    </FormControl>
                  </Grid>
                </Grid>
                <Box mb={2} sx={{ border: '3px solid blue', width: '100%' }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>イベント候補日</TableCell>
                            <TableCell>参加可否</TableCell>
                            <TableCell>コメント</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {eventDetail?.event_dates.map((event_date, index) => (
                            <TableRow key={event_date.id}>
                              <TableCell sx={{ padding: '10px' }}>
                                {new Date(event_date.dated_on).toLocaleDateString()}
                              </TableCell>
                              <TableCell sx={{ padding: '10px' }}>
                                <Controller
                                  name={`possibility_${index}`}
                                  control={control}
                                  defaultValue=""
                                  rules={{ required: '選択してください' }}
                                  render={({ field, fieldState }) => (
                                    <Select
                                      {...field}
                                      error={!!fieldState.error}
                                      displayEmpty
                                      sx={{
                                        minHeight: '30px', // 最小高さを指定
                                        height: 'auto',
                                        '& .MuiSelect-select': {
                                          paddingTop: '5px',
                                          paddingBottom: '5px',
                                        },
                                        '& .MuiInputBase-root': {
                                          height: 'auto',
                                        },
                                      }}
                                    >
                                      <MenuItem value="" disabled>
                                        選択
                                      </MenuItem>
                                      <MenuItem value={1}>いける</MenuItem>
                                      <MenuItem value={5}>わからん</MenuItem>
                                      <MenuItem value={0}>無理</MenuItem>
                                    </Select>
                                  )}
                                />
                              </TableCell>
                              <TableCell sx={{ padding: '5px' }}>
                                <Controller
                                  name={`comment_${index}`}
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      placeholder="コメント"
                                      multiline
                                      rows={1}
                                      sx={{
                                        '& .MuiInputBase-root': {
                                          height: '30px',
                                          paddingTop: '5px',
                                          paddingBottom: '5px',
                                        },
                                        '& .MuiInputBase-input': {
                                          padding: '5px', // 内部の余白を微調整
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button variant="contained" type="submit">
                        送信
                      </Button>
                    </Box>
                  </form>
                </Box>
              </Box>
              {/* 登録ボタン */}
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
