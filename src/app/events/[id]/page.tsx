/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { EventDate, EventResponse, MergedgatedData, UserPossibility } from '@/types/event';
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
      // const userEmail = user?.email;
      // if (!userEmail) {
      //   throw new Error('ユーザーのメールアドレスが見つかりません。');
      // }

      // const userResponse = await fetch(
      //   `https://azure-api-opf.azurewebsites.net/api/users?email=${userEmail}`
      // );

      // if (!userResponse.ok) {
      //   throw new Error(`ユーザーID取得エラー: ${userResponse.statusText}`);
      // }

      // const userCode = await userResponse.text();
      console.log('取得した従業員ID:', user?.user_code);

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
        <Typography variant="h4" gutterBottom>
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
            boxShadow: 2, // 左端に縦ラインを追加（カラー調整可）
            paddingLeft: '10px', // 文字を右に少しずらす
          }}
        >
          <Typography variant="h5" gutterBottom>
            会議室・会場・備考等
          </Typography>
          {eventDetail?.events.description}
        </Box>
        <Box
          sx={{
            borderLeft: '5px solid #fbc02d', // ダークイエローの縦ライン
            boxShadow: 2, // 左端に縦ラインを追加（カラー調整可）
            paddingLeft: '10px', // 文字を右に少しずらす
          }}
        >
          <Typography variant="h5" gutterBottom>
            イベント参加の状況
          </Typography>
          <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
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
                    {eventDetail?.user_possibilities.map((user_possibilitie, index) => (
                      <TableCell key={index} sx={{ minWidth: 100 }}>
                        {user_possibilitie.user_name}
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
                              (possibility) => possibility.possibility === 1
                            ).length
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ textAlign: 'center' }}>
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) => possibility.possibility === 5
                            ).length
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ textAlign: 'center' }}>
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) => possibility.possibility === 0
                            ).length
                          }
                        </Typography>
                      </TableCell>
                      {eventDetail?.user_possibilities
                        .filter(
                          (user_possibilitie) => user_possibilitie.event_date_id === event_date.id
                        )
                        .map((user_possibilitie, index) => (
                          <TableCell key={index} sx={{ minWidth: 100, textAlign: 'center' }}>
                            <Typography
                              sx={{
                                color:
                                  user_possibilitie.possibility === 1
                                    ? 'green'
                                    : user_possibilitie.possibility === 5
                                      ? 'gray'
                                      : 'red',
                              }}
                            >
                              {user_possibilitie.possibility === 1
                                ? '〇'
                                : user_possibilitie.possibility === 5
                                  ? '？'
                                  : '×'}
                            </Typography>
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box
          sx={{
            borderLeft: '5px solid #f44336', // 赤色の縦ライン
            boxShadow: 2, // 左端に縦ラインを追加（カラー調整可）
            paddingLeft: '10px', // 文字を右に少しずらす
          }}
        >
          <Typography variant="h5" gutterBottom>
            参加・不参加の入力
          </Typography>

          {/* Backdrop */}
          <Backdrop
            open={onOff}
            onClick={() => {
              fetchEventDetail();
              setonOff(false);
            }} // 背景クリックで閉じる
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
                // border: '3px solid red',
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
                  border: '1px solid #ccc',
                  padding: 2, // 内側の余白
                  backgroundColor: 'white',
                  borderRadius: 1, // 角丸を少しつける
                  mb: 2, // 下に余白を追加
                  // border: '3px solid green',
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
                      <OutlinedInput defaultValue={user?.user_code} disabled />
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
                <Box mb={2} sx={{ width: '100%', pt: 2 }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TableContainer component={Paper} sx={{ boxShadow: 2, padding: 1 }}>
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
