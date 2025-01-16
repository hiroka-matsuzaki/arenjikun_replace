/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { EventDate, EventResponse, UserPossibility } from '@/types/event';
import Grid from '@mui/material/Grid2';

import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
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
  useMediaQuery,
} from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { EmojiPeople, Share } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import typographyStyles from '@/styles/typographyStyles';
import dayjs from 'dayjs';
import { User, Users } from '@/types/user';

type FormData = {
  [key: string]: string | number;
};

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
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
  const startTime = formatTime(eventDate.start_time);
  const endTime = formatTime(eventDate.end_time);
  return `${formattedDate} ${startTime}-${endTime}`;
};

const EventDetail: React.FC = () => {
  const { user } = useUser();
  // eslint-disable-next-line no-unused-vars
  const [users, setUsers] = useState<Users>();
  const [respondentUser, setRespondentUser] = useState<User>();
  const [eventDetail, setEventDetail] = useState<EventResponse>();
  const [respondents, setRespondent] = useState<Users>();
  const [myPossibilities, setMyPossibilities] = useState<UserPossibility[]>();
  const isSmallScreen = useMediaQuery('(max-width:600px)'); // 画面幅600px以下で切り替え
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams?.get('message');
  const goTo = (path: string) => router.push(path);
  const handleEditClick = () => {
    goTo(`/events/${id}/edit`);
  };
  // デバック専用削除処理
  // const handleDeleteClick = async () => {
  //   try {
  //     const deleteResponse = await fetch(
  //       `https://azure-api-opf.azurewebsites.net/api/events/${eventDetail?.events.url}/?email=s.matsuzaki@hiroka.biz`,
  //       {
  //         method: 'DELETE',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           event_id: eventDetail?.events.id,
  //         }),
  //       }
  //     );

  //     if (!deleteResponse.ok) {
  //       throw new Error(`更新エラー: ${deleteResponse.statusText}`);
  //     }

  //     const deleteResult = await deleteResponse.text();
  //     console.log('削除結果:', deleteResult);

  //     await fetchEventDetail();
  //     setonOff(false);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error('エラー:', error.message);
  //       alert('エラーが発生しました: ' + error.message);
  //     } else {
  //       console.error('未知のエラー:', error);
  //       alert('未知のエラーが発生しました。');
  //     }
  //   }
  // };
  const fetchEventDetail = async () => {
    try {
      const reqURL = `https://azure-api-opf.azurewebsites.net/api/events/${id}`;
      console.log('リクエストURL:', reqURL);

      const response = await fetch(reqURL);
      const contentType = response.headers.get('Content-Type');

      if (!response.ok) {
        const errorText = await response.text(); // JSON以外の形式も取得可能
        console.error(`HTTPエラー: ${response.status}: ${errorText}`);
        throw new Error(`HTTPエラー: ${response.status}: ${errorText}`);
      }

      // JSONの場合のみ解析
      if (contentType && contentType.includes('application/json')) {
        const data: EventResponse = await response.json();
        console.log('データ:', data);
        setEventDetail(data);
        const users = Array.from(
          data.user_possibilities
            .reduce((map, item) => {
              if (!map.has(item.user_id)) {
                map.set(item.user_id, {
                  user_id: item.user_id,
                  user_name: item.user_name,
                  email: item.email,
                });
              }
              return map;
            }, new Map())
            .values()
        );
        setRespondent(users);
      } else {
        const textData = await response.text();
        console.error('JSONではないレスポンス:', textData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const selectRespondentUser = async (userEmail: String) => {
    const response = await fetch(`https://azure-api-opf.azurewebsites.net/api/users`);
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }
    const data: Users = await response.json();
    console.log('Users:', data);
    setUsers(data);
    const selectUser = data?.find((user) => user.email === userEmail);
    if (selectUser === undefined) {
      console.log(`${userEmail}が異常です。`);
      return;
    }
    setRespondentUser(selectUser);
    fetchMyPossibilities(selectUser);
  };

  const fetchMyPossibilities = (selectUser: User) => {
    if (!eventDetail) {
      throw new Error("fetchMyPossibilities: 引数 'eventDetail' が undefined です。");
    }
    if (!selectUser) {
      throw new Error("fetchMyPossibilities: 引数 'selectUser' が undefined です。");
    }
    const myPossibilities = eventDetail.user_possibilities.filter(
      (item) => item.user_name === selectUser.user_name
    );
    console.log('myPossibilities:', myPossibilities);

    setMyPossibilities(myPossibilities || null);
  };

  useEffect(() => {
    fetchEventDetail();
    // fetchUsers();
  }, []); // 空の依存配列にすることで、初回レンダリング時のみ実行

  const [onOff, setonOff] = React.useState(false);
  const { handleSubmit, control } = useForm<FormData>();
  const tooltipTitle = '共有'; // ツールチップのタイトル

  const handleShare = async () => {
    if (!navigator.share) {
      alert('このブラウザはWeb Share APIをサポートしていません。');
      return;
    }

    try {
      await navigator.share({
        title: 'Reactアプリをシェア',
        text: 'このアプリをチェックしてください！',
        url: window.location.href, // 現在のページのURL
      });
      console.log('コンテンツの共有に成功しました！');
    } catch (error) {
      console.error('共有中にエラーが発生しました:', error);
    }
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
        `https://azure-api-opf.azurewebsites.net/api/events/${id}/update_join?user_code=${user?.user_code}&email=${user?.email}`,
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

      await fetchEventDetail();
      setonOff(false);
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
      {message && <Typography>{message}</Typography>}
      <Box
        display="flex"
        sx={{
          justifyContent: 'left',
          height: '80px',
          border: '1px solid #ccc',
          padding: '20px',
          mx: '10%',
          mt: '2%',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ ...typographyStyles.header, marginRight: '16px' }}
        >
          {eventDetail?.events.subject}
        </Typography>
        <Tooltip title={tooltipTitle}>
          <IconButton
            onClick={handleShare}
            sx={{
              backgroundColor: '#E3F2FD', // 青系の薄い背景色
              color: '#1976D2', // 青系の濃い文字色
              '&:hover': {
                backgroundColor: '#BBDEFB', // ホバー時の背景色
              },
              padding: '12px', // ボタンの大きさを調整
              borderRadius: '8px', // 少し角丸にする
            }}
          >
            <Share />
            <Typography>共有</Typography>
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          border: '1px solid #ccc',
          padding: '20px',
          mx: '10%',
          backgroundColor: 'white',
          gap: 4,
        }}
      >
        <Box
          sx={{
            borderLeft: '5px solid #4caf50',
            boxShadow: 2,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h5" gutterBottom sx={typographyStyles.subHeader}>
            会議室・会場・備考等
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            {eventDetail?.events.description}
          </Typography>
        </Box>

        <Box
          sx={{
            borderLeft: '5px solid #fbc02d',
            boxShadow: 2,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h5" gutterBottom sx={typographyStyles.subHeader}>
            イベント参加の状況
          </Typography>
          {isSmallScreen ? (
            <Box>
              {[...(eventDetail?.event_dates || [])]
                .sort((a, b) => {
                  const dateA = dayjs(a.dated_on);
                  const dateB = dayjs(b.dated_on);
                  if (dateA.isBefore(dateB)) return -1;
                  if (dateA.isAfter(dateB)) return 1;

                  const startA = dayjs(a.start_time);
                  const startB = dayjs(b.start_time);
                  if (startA.isBefore(startB)) return -1;
                  if (startA.isAfter(startB)) return 1;

                  const endA = dayjs(a.end_time);
                  const endB = dayjs(b.end_time);
                  if (endA.isBefore(endB)) return -1;
                  if (endA.isAfter(endB)) return 1;

                  return 0;
                })
                .map((event_date) => (
                  <Card key={event_date.id} sx={{ marginBottom: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant="h6">{formattedDataAndTime(event_date)}</Typography>
                      <Box>
                        <Typography>
                          〇:{' '}
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) =>
                                possibility.possibility === 1 &&
                                possibility.event_date_id === event_date.id
                            ).length
                          }
                        </Typography>
                        <Typography>
                          ？:{' '}
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) =>
                                possibility.possibility === 5 &&
                                possibility.event_date_id === event_date.id
                            ).length
                          }
                        </Typography>
                        <Typography>
                          ×:{' '}
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) =>
                                possibility.possibility === 0 &&
                                possibility.event_date_id === event_date.id
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box>
                        {respondents?.map((respondent) => {
                          const userPossibility = eventDetail?.user_possibilities.find(
                            (item) =>
                              item.event_date_id === event_date.id &&
                              item.email === respondent.email
                          );
                          return (
                            <Typography
                              key={respondent.user_code}
                              sx={{
                                color:
                                  userPossibility?.possibility === 1
                                    ? 'green'
                                    : userPossibility?.possibility === 5
                                      ? 'gray'
                                      : 'red',
                              }}
                            >
                              {respondent.user_name}:{' '}
                              {userPossibility?.possibility === 1
                                ? '〇'
                                : userPossibility?.possibility === 5
                                  ? '？'
                                  : '×'}
                            </Typography>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2, padding: 1, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 170 }}>イベント候補日</TableCell>
                    <TableCell sx={{ minWidth: 50, textAlign: 'center' }}>
                      <Typography color="success">〇</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 50, textAlign: 'center' }}>
                      <Typography color="action">？</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 50, textAlign: 'center' }}>
                      <Typography color="error">×</Typography>
                    </TableCell>
                    {respondents && respondents.length > 0 ? (
                      respondents.map(
                        (respondent, index) =>
                          respondent.user_name ? (
                            <TableCell
                              key={index}
                              onClick={async () => {
                                await selectRespondentUser(respondent.email);
                                setonOff(true);
                              }}
                              sx={{
                                minWidth: 150,
                                color: 'blue', // 特定の名前の場合は青色
                                cursor: 'pointer', // ポインタを設定
                                textDecoration: 'underline', // 下線を付ける
                                fontWeight: 'bold', // 太字にする
                                textAlign: 'center',
                              }}
                            >
                              {respondent.user_name}
                            </TableCell>
                          ) : null // user_name が null の場合は null を返す
                      )
                    ) : (
                      <TableCell colSpan={1} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                        参加者はいません。
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...(eventDetail?.event_dates || [])]
                    .sort((a, b) => {
                      const dateA = dayjs(a.dated_on);
                      const dateB = dayjs(b.dated_on);
                      if (dateA.isBefore(dateB)) return -1;
                      if (dateA.isAfter(dateB)) return 1;

                      const startA = dayjs(a.start_time);
                      const startB = dayjs(b.start_time);
                      if (startA.isBefore(startB)) return -1;
                      if (startA.isAfter(startB)) return 1;

                      const endA = dayjs(a.end_time);
                      const endB = dayjs(b.end_time);
                      if (endA.isBefore(endB)) return -1;
                      if (endA.isAfter(endB)) return 1;

                      return 0;
                    })
                    .map((event_date) => (
                      <TableRow key={event_date.id}>
                        <TableCell sx={{ padding: '10px', minWidth: 170 }}>
                          <Typography>{formattedDataAndTime(event_date)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ minWidth: 50, textAlign: 'center' }}>
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
                          <Typography sx={{ minWidth: 50, textAlign: 'center' }}>
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
                          <Typography sx={{ minWidth: 50, textAlign: 'center' }}>
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
                          eventDetail?.user_possibilities
                            .filter(
                              (item) =>
                                item.event_date_id === event_date.id &&
                                item.email === respondent.email
                            )
                            .map((data) => (
                              <TableCell key={index} sx={{ minWidth: 150, textAlign: 'center' }}>
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
                                  {data.possibility === 1
                                    ? '〇'
                                    : data.possibility === 5
                                      ? '？'
                                      : '×'}
                                </Typography>
                              </TableCell>
                            ))
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        <Box
          sx={{
            borderLeft: '5px solid #f44336',
            boxShadow: 2,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h5" gutterBottom sx={typographyStyles.subHeader}>
            参加・不参加の入力
          </Typography>

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
              <Typography variant="h5" gutterBottom sx={typographyStyles.subHeader}>
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
                      <OutlinedInput defaultValue={respondentUser?.email} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>社員番号</FormLabel>
                      <OutlinedInput defaultValue={respondentUser?.user_code} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>会社</FormLabel>
                      <OutlinedInput defaultValue={respondentUser?.company} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel>部署</FormLabel>
                      <OutlinedInput defaultValue={respondentUser?.department} disabled />
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel>名前</FormLabel>
                      <OutlinedInput defaultValue={respondentUser?.user_name} disabled />
                    </FormControl>
                  </Grid>
                </Grid>
                <Box mb={2} sx={{ width: '100%', pt: 2 }}>
                  {/* formじゃないと送信できない */}
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
                                      value={field.value}
                                      exclusive
                                      onChange={(event, newValue) => {
                                        if (newValue !== null) {
                                          field.onChange(newValue);
                                        }
                                      }}
                                      sx={{
                                        '& .MuiToggleButtonGroup-grouped': {
                                          margin: 0,
                                          border: '1px solid #ddd',
                                          borderRadius: '4px',
                                          '&:not(:last-of-type)': {
                                            borderRight: 'none',
                                          },
                                          '&.Mui-selected': {
                                            color: '#fff',
                                          },
                                        },
                                      }}
                                      aria-label="選択肢"
                                    >
                                      <ToggleButton
                                        value={1}
                                        aria-label="〇"
                                        sx={{
                                          backgroundColor: 'white',
                                          color: '#4caf50',
                                          '&.Mui-selected': {
                                            backgroundColor: '#4caf50',
                                            borderColor: '#4caf50',
                                            color: '#fff',
                                          },
                                          '&:hover': {
                                            backgroundColor: '#e8f5e9',
                                          },
                                          fontSize: '20px',
                                        }}
                                      >
                                        〇
                                      </ToggleButton>
                                      <ToggleButton
                                        value={5}
                                        aria-label="？"
                                        sx={{
                                          backgroundColor: 'white',
                                          color: '#9e9e9e',
                                          '&.Mui-selected': {
                                            backgroundColor: '#9e9e9e',
                                            borderColor: '#9e9e9e',
                                            color: '#fff',
                                          },
                                          '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                          },
                                          fontSize: '20px',
                                        }}
                                      >
                                        ？
                                      </ToggleButton>
                                      <ToggleButton
                                        value={0}
                                        aria-label="×"
                                        sx={{
                                          backgroundColor: 'white',
                                          color: '#f44336',
                                          '&.Mui-selected': {
                                            backgroundColor: '#f44336',
                                            borderColor: '#f44336',
                                            color: '#fff',
                                          },
                                          '&:hover': {
                                            backgroundColor: '#ffebee',
                                          },
                                          fontSize: '20px',
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
                                          padding: '5px',
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
            onClick={async () => {
              await selectRespondentUser(user!.email);
              setonOff(true);
            }}
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
              width: 'auto',
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

        {/* デバック用削除ボタン */}
        {/* <Typography
          sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}
          onClick={handleDeleteClick}
        >
          削除
        </Typography> */}
      </Box>
    </>
  );
};

export default EventDetail;
