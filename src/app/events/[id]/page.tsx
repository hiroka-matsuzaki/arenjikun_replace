/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
  EventDate,
  EventResponse,
  MergedgatedData,
  Respondent,
  UserPossibility,
} from '@/types/event';
import Grid from '@mui/material/Grid2';

import {
  Backdrop,
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { EmojiPeople, Link } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';

// フォームデータの型
type FormData = {
  [key: string]: string | number; // 動的に生成されるフィールドをサポート
};

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);

  // 年、月、日、曜日を取得
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekDays[date.getDay()];

  // フォーマット
  return `${year}年${month}月${day}日(${dayOfWeek})`;
};
const formattedDataAndTime = (eventDate: EventDate) => {
  const formattedDate = formatDate(eventDate.dated_on);
  // 開始時間と終了時間のフォーマット
  const startTime = formatTime(eventDate.start_time);
  const endTime = formatTime(eventDate.end_time);
  return `${formattedDate} ${startTime}-${endTime}`;
};

const EventDetail: React.FC = () => {
  const { user } = useUser(); // UserContextからユーザー情報を取得
  const [eventDetail, setEventDetail] = useState<EventResponse>();
  const [respondents, setRespondent] = useState<Respondent[]>();

  const [myPossibilities, setMyPossibilities] = useState<UserPossibility[]>();

  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const goTo = (path: string) => router.push(path);
  const handleEditClick = () => {
    goTo(`/events/${id}/edit`);
  };

  const mergedEventData = (
    eventDates: EventDate[],
    userPossibilities: UserPossibility[]
  ): MergedgatedData[] => {
    // user_possibilities を事前に event_date_id でグループ化
    const groupedPossibilities = (userPossibilities || []).reduce(
      (acc, possibility) => {
        if (!acc[possibility.event_date_id]) {
          acc[possibility.event_date_id] = [];
        }
        acc[possibility.event_date_id].push(possibility);
        return acc;
      },
      {} as Record<number, UserPossibility[]>
    );

    // event_dates を整形
    return eventDates.map((eventDate) => ({
      id: eventDate.id,
      dated_on: eventDate.dated_on,
      event_id: eventDate.event_id,
      start_time: eventDate.start_time,
      end_time: eventDate.end_time,
      possibilities: (groupedPossibilities[eventDate.id] || []).map((possibility) => ({
        user_id: possibility.user_id,
        user_name: possibility.user_name,
        possibility: possibility.possibility,
        comment: possibility.comment,
      })),
    }));
  };

  const aggregatedData = eventDetail
    ? mergedEventData(eventDetail.event_dates, eventDetail.user_possibilities)
    : [];
  console.log(aggregatedData);
  // イベントを取得する関数
  const fetchEventDetail = async () => {
    try {
      const response = await fetch(`https://azure-api-opf.azurewebsites.net/api/events/${id}`);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data: EventResponse = await response.json();
      console.log('データ:', data);
      const users = Array.from(
        data.user_possibilities
          .reduce((map, item) => {
            if (!map.has(item.user_id)) {
              map.set(item.user_id, { user_id: item.user_id, user_name: item.user_name });
            }
            return map;
          }, new Map())
          .values()
      );
      setRespondent(users);
      setEventDetail(data);
      fetchMyPossibilities(data);
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const fetchMyPossibilities = async (eventDetail: EventResponse | undefined) => {
    if (!eventDetail) {
      throw new Error("fetchMyPossibilities: 引数 'eventDetail' が undefined です。");
    }
    const myPossibilities = eventDetail.user_possibilities.filter(
      (item) => item.user_name === user?.user_name
    );
    console.log('myPossibilities:', myPossibilities);

    setMyPossibilities(myPossibilities || null);
  };

  useEffect(() => {
    fetchEventDetail();
  }, []); // 空の依存配列
  const [onOff, setonOff] = React.useState(false);
  const { handleSubmit, control } = useForm<FormData>();
  const handleCopyLink = () => {
    const urlToCopy = window.location.href; // 現在のURL
    navigator.clipboard
      .writeText(urlToCopy)
      .then(() => {
        alert('URLをコピーしました: ' + urlToCopy);
      })
      .catch((err) => {
        console.error('URLコピーに失敗しました', err);
      });
  };
  const onSubmit = async (data: FormData) => {
    const formattedData = eventDetail?.event_dates.map((event, index) => ({
      dated_on: event.dated_on,
      start_time: event.start_time,
      end_time: event.end_time,
      possibility: data[`possibility_${index}`] as number,
      comment: data[`comment_${index}`] as string,
    }));

    console.log('送信データ:', formattedData);

    try {
      const updateResponse = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/events/${id}/update_join?user_code=${user?.user_code}`,
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: {
              xs: '1.5rem', // 小さい画面ではフォントサイズを小さく
              sm: '1.75rem', // 中くらいの画面では少し大きく
              md: '2rem', // 大きい画面ではさらに大きく
              lg: '2.25rem', // より大きい画面ではもっと大きく
            },
            fontWeight: 'bold', // 太字にしたい場合
          }}
        >
          {eventDetail?.events.subject}
        </Typography>
        <Tooltip title="URLをコピー">
          <IconButton onClick={handleCopyLink} color="primary">
            <Link />
          </IconButton>
        </Tooltip>
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
        <Box
          sx={{
            borderLeft: '5px solid #4caf50', // 緑色の縦ライン
            boxShadow: 2, // ボックスの影
            paddingLeft: '20px', // 左側の余白を広げる（縦ラインからの距離を調整）
            paddingRight: '20px', // 右側の余白
            paddingTop: '16px', // 上部の余白
            paddingBottom: '16px', // 下部の余白
            borderRadius: '8px', // ボックスの角を丸くする
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
                md: '1.5rem',
                lg: '1.75rem',
              },
              fontWeight: 'bold', // 太字にしたい場合
            }}
          >
            会議室・会場・備考等
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            {eventDetail?.events.description}
          </Typography>
        </Box>

        <Box
          sx={{
            borderLeft: '5px solid #fbc02d', // ダークイエローの縦ライン
            boxShadow: 2, // 左端に縦ラインを追加（カラー調整可）
            paddingLeft: '20px', // 左側の余白を広げる（縦ラインからの距離を調整）
            paddingRight: '20px', // 右側の余白
            paddingTop: '16px', // 上部の余白
            paddingBottom: '16px', // 下部の余白
            borderRadius: '8px', // ボックスの角を丸くする
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
                md: '1.5rem',
                lg: '1.75rem',
              },
              fontWeight: 'bold', // 太字にしたい場合
            }}
          >
            イベント参加の状況
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 2, padding: 1, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 170 }}>イベント候補日</TableCell>
                  <TableCell sx={{ minWidth: 50 }}>
                    <Typography color="success">〇</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 50 }}>
                    <Typography color="action">？</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 50 }}>
                    <Typography color="error">×</Typography>
                  </TableCell>
                  {respondents?.map((respondent, index) => (
                    <TableCell key={index} sx={{ minWidth: 150 }}>
                      {respondent.user_name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {eventDetail?.event_dates.map((event_date) => (
                  <TableRow key={event_date.id}>
                    <TableCell sx={{ padding: '10px' }}>
                      <Typography>{formattedDataAndTime(event_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ textAlign: 'center' }}>
                        {
                          eventDetail?.user_possibilities.filter(
                            (possibility) =>
                              possibility.possibility === 1 &&
                              possibility.event_date_id === event_date.id
                          ).length
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ textAlign: 'center' }}>
                        {
                          eventDetail?.user_possibilities.filter(
                            (possibility) =>
                              possibility.possibility === 5 &&
                              possibility.event_date_id === event_date.id
                          ).length
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ textAlign: 'center' }}>
                        {
                          eventDetail?.user_possibilities.filter(
                            (possibility) =>
                              possibility.possibility === 0 &&
                              possibility.event_date_id === event_date.id
                          ).length
                        }
                      </Typography>
                    </TableCell>
                    {respondents?.map((respondent, index) =>
                      eventDetail.user_possibilities
                        .filter(
                          (item) =>
                            item.event_date_id === event_date.id &&
                            item.user_id === respondent.user_id
                        )
                        .map((data) => (
                          <TableCell key={index} sx={{ minWidth: 100, textAlign: 'center' }}>
                            <Typography
                              sx={{
                                color:
                                  data.possibility === 1
                                    ? 'green'
                                    : data.possibility === 5
                                      ? 'gray'
                                      : 'red',
                              }}
                            >
                              {data.possibility === 1 ? '〇' : data.possibility === 5 ? '？' : '×'}
                            </Typography>
                          </TableCell>
                        ))
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            borderLeft: '5px solid #f44336', // 赤色の縦ライン
            boxShadow: 2, // 左端に縦ラインを追加（カラー調整可）
            paddingLeft: '20px', // 左側の余白を広げる（縦ラインからの距離を調整）
            paddingRight: '20px', // 右側の余白
            paddingTop: '16px', // 上部の余白
            paddingBottom: '16px', // 下部の余白
            borderRadius: '8px', // ボックスの角を丸くする
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
                md: '1.5rem',
                lg: '1.75rem',
              },
              fontWeight: 'bold', // 太字にしたい場合
            }}
          >
            参加・不参加の入力
          </Typography>

          {/* Backdrop */}
          <Backdrop
            open={onOff}
            onClick={() => {
              fetchEventDetail();
              setonOff(false);
            }}
            sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }}
          />
          {onOff && (
            <Box
              sx={{
                position: 'fixed',
                top: '3%',
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 2,
                boxShadow: 24,
                zIndex: (theme) => theme.zIndex.modal,
                width: '80%',
                maxWidth: '800px',
                height: 'auto',
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontSize: {
                    xs: '1rem',
                    sm: '1.25rem',
                    md: '1.5rem',
                    lg: '1.75rem',
                  },
                  fontWeight: 'bold',
                }}
              >
                参加・不参加の入力
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  border: '1px solid #ccc',
                  padding: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>ログインID</FormLabel>
                      <OutlinedInput defaultValue={user?.login_code} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>社員番号</FormLabel>
                      <OutlinedInput defaultValue={user?.user_code} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>会社</FormLabel>
                      <OutlinedInput defaultValue={user?.company} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>部署</FormLabel>
                      <OutlinedInput defaultValue={user?.department} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel>名前</FormLabel>
                      <OutlinedInput defaultValue={user?.user_name} disabled />
                    </FormControl>
                  </Grid>
                </Grid>
                <Box mb={2} sx={{ width: '100%', pt: 2 }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TableContainer
                      component={Paper}
                      sx={{ boxShadow: 2, padding: 1, overflowX: 'auto' }}
                    >
                      <Table sx={{ minWidth: '600px' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 150 }}>イベント候補日</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>参加可否</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>コメント</TableCell>
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
                                  defaultValue={
                                    myPossibilities?.find(
                                      (item) => item.event_date_id === event_date.id
                                    )?.possibility
                                  }
                                  rules={{ required: '選択してください' }}
                                  render={({ field }) => (
                                    <ToggleButtonGroup
                                      value={field.value} // 選択状態を管理
                                      exclusive // 単一選択モード
                                      onChange={(event, newValue) => {
                                        if (newValue !== null) {
                                          field.onChange(newValue); // 値を更新
                                        }
                                      }}
                                      sx={{
                                        '& .MuiToggleButtonGroup-grouped': {
                                          margin: 0, // ボタン間の隙間をなくす
                                          border: '1px solid #ddd', // ボーダーの色
                                          borderRadius: '4px', // 角を丸める
                                          '&:not(:last-of-type)': {
                                            borderRight: 'none', // ボタン同士をくっつける
                                          },
                                          '&.Mui-selected': {
                                            color: '#fff', // 選択されたボタンの文字色
                                          },
                                        },
                                      }}
                                      aria-label="選択肢"
                                    >
                                      <ToggleButton
                                        value={1}
                                        aria-label="〇"
                                        sx={{
                                          backgroundColor: 'white', // 未選択時は背景を白に
                                          color: '#4caf50', // 枠と文字は緑色
                                          '&.Mui-selected': {
                                            backgroundColor: '#4caf50', // 選択時は緑の背景
                                            borderColor: '#4caf50', // 枠も緑
                                            color: '#fff', // 文字は白
                                          },
                                          '&:hover': {
                                            backgroundColor: '#e8f5e9', // ホバー時はうっすら緑色に
                                          },
                                          fontSize: '20px', // 文字を少し大きくする
                                        }}
                                      >
                                        〇
                                      </ToggleButton>
                                      <ToggleButton
                                        value={5}
                                        aria-label="？"
                                        sx={{
                                          backgroundColor: 'white', // 未選択時は背景を白に
                                          color: '#9e9e9e', // 枠と文字はグレー
                                          '&.Mui-selected': {
                                            backgroundColor: '#9e9e9e', // 選択時はグレーの背景
                                            borderColor: '#9e9e9e', // 枠もグレー
                                            color: '#fff', // 文字は白
                                          },
                                          '&:hover': {
                                            backgroundColor: '#f5f5f5', // ホバー時はうっすらグレーに
                                          },
                                          fontSize: '20px', // 文字を少し大きくする
                                        }}
                                      >
                                        ？
                                      </ToggleButton>
                                      <ToggleButton
                                        value={0}
                                        aria-label="×"
                                        sx={{
                                          backgroundColor: 'white', // 未選択時は背景を白に
                                          color: '#f44336', // 枠と文字は赤色
                                          '&.Mui-selected': {
                                            backgroundColor: '#f44336', // 選択時は赤の背景
                                            borderColor: '#f44336', // 枠も赤
                                            color: '#fff', // 文字は白
                                          },
                                          '&:hover': {
                                            backgroundColor: '#ffebee', // ホバー時はうっすら赤色に
                                          },
                                          fontSize: '20px', // 文字を少し大きくする
                                        }}
                                      >
                                        ×
                                      </ToggleButton>
                                    </ToggleButtonGroup>
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
            </Box>
          )}

          <Button
            onClick={() => setonOff(true)}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#a0c4ff',
              '&:hover': {
                backgroundColor: '#7bb7f0',
              },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: {
                xs: '12px 24px',
                sm: '16px 32px',
                md: '16px 40px',
              },
              fontSize: {
                xs: '16px',
                sm: '18px',
                md: '20px',
              },
              borderRadius: '10px',
              minHeight: {
                xs: '60px',
                sm: '70px',
                md: '80px',
              },
              width: 'auto', // 幅を自動調整
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '1.25rem',
                  md: '1.5rem',
                  lg: '1.75rem',
                },
                textAlign: 'left',
                whiteSpace: 'pre-line',
              }}
            >
              ユーザーを追加して
              <br /> 参加不参加を入力する
            </Typography>
            <EmojiPeople
              sx={{
                fontSize: {
                  xs: '0px',
                  sm: '60px',
                  md: '100px',
                },
              }}
            />
          </Button>
        </Box>
        <Typography
          sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}
          onClick={handleEditClick}
        >
          編集
        </Typography>
      </Box>
    </>
  );
};

export default EventDetail;
