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
  Collapse,
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
import {
  CheckCircle,
  EmojiPeople,
  ExpandLess,
  ExpandMore,
  MarkChatUnreadOutlined,
  Share,
} from '@mui/icons-material';
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
  const [expandedState, setExpandedState] = useState<{ [key: number]: boolean }>({});

  const handleToggleExpanded = (eventDateId: number) => {
    setExpandedState((prevState) => ({
      ...prevState,
      [eventDateId]: !prevState[eventDateId],
    }));
  };
  const [myPossibilities, setMyPossibilities] = useState<UserPossibility[]>();
  const isSmallScreen = useMediaQuery('(max-width:600px)'); // 画面幅600px以下で切り替え
  const params = useParams();
  const id = params?.id as string | undefined;
  const searchParams = useSearchParams();
  const message = searchParams?.get('message');
  const router = useRouter();
  const goTo = (path: string) => router.push(path);
  const handleEditClick = async () => {
    goTo(`/events/${id}/edit`);
  };
  const [onOff, setonOff] = React.useState(false);
  const { handleSubmit, control, setValue } = useForm<FormData>();
  const tooltipTitle = '共有'; // ツールチップのタイトル

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
        ).filter((user) => user.email !== null); // email が null のものを削除

        console.log('users:', users);

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
  }, []);

  useEffect(() => {
    if (myPossibilities) {
      myPossibilities.forEach((item, index) => {
        setValue(`possibility_${index}`, item.possibility); // 特定のフィールドに値を設定
      });
      setonOff(true);
    }
  }, [myPossibilities, setValue]);

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
        `https://azure-api-opf.azurewebsites.net/api/events/${id}/update_join?user_code=${respondentUser?.user_code}&email=${respondentUser?.email}`,
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
      {message && (
        <Box
          display="flex"
          alignItems="center"
          sx={{
            justifyContent: 'flex-start',
            height: '80px',
            border: '1px solid #ccc',
            padding: '20px',
            mx: { xs: '2%', sm: '10%' },
            mt: '2%',
            borderRadius: '8px', // 角を丸く
            boxShadow: 3, // 影を付けて浮き上がらせる
          }}
        >
          <CheckCircle sx={{ color: '#00796b', marginRight: '10px' }} />
          <Typography
            variant="h5"
            sx={{
              color: '#00796b',
              fontWeight: 'bold',
              fontSize: {
                xs: '0.8rem', // 小さい画面ではフォントサイズを小さく
                sm: '1rem', // 中くらいの画面では少し大きく
                md: '1.25rem', // 大きい画面ではさらに大きく
                lg: '1.5rem', // より大きい画面ではもっと大きく
              },
            }}
          >
            {message}
          </Typography>
        </Box>
      )}
      <Box
        display="flex"
        sx={{
          justifyContent: 'left',
          alignItems: 'center', // 中央揃えを追加
          height: '80px',
          border: '1px solid #ccc',
          padding: '20px',
          mx: { xs: '2%', sm: '10%' },
          mt: '2%',
        }}
      >
        <Typography gutterBottom sx={{ ...typographyStyles.header, marginRight: '16px', mt: '1%' }}>
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
          padding: { xs: '5px', sm: '20px' },
          mx: { xs: '2%', sm: '10%' },
          backgroundColor: 'white',
          gap: { xs: 1, sm: 3 },
        }}
      >
        <Box
          sx={{
            borderLeft: '5px solid grey',
            boxShadow: 3,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
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
            borderLeft: '5px solid grey',
            boxShadow: 3,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
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
                      <Box
                        sx={{
                          display: 'flex', // 横並びにする
                          alignItems: 'center', // 縦方向の位置を中央揃え
                          gap: 2, // 子要素間の間隔を調整（必要に応じて変更可能）
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'green',
                          }}
                        >
                          〇:{' '}
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) =>
                                possibility.possibility === 1 &&
                                possibility.event_date_id === event_date.id
                            ).length
                          }
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'grey',
                          }}
                        >
                          ？:{' '}
                          {
                            eventDetail?.user_possibilities.filter(
                              (possibility) =>
                                possibility.possibility === 5 &&
                                possibility.event_date_id === event_date.id
                            ).length
                          }
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'red',
                          }}
                        >
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
                        {eventDetail && respondents && respondents.length > 0 && (
                          <Box>
                            {/* ボタンで開閉を切り替える */}
                            <Button
                              onClick={() => handleToggleExpanded(event_date.id)} // 各カードのidで開閉を切り替える
                              variant="text"
                              size="small"
                              sx={{
                                color: 'gray',
                                fontSize: '0.875rem',
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1, // アイコンとテキストの間隔を調整
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                              }}
                            >
                              {/* アイコンとテキストの切り替え */}
                              {expandedState[event_date.id] ? (
                                <>
                                  <ExpandLess sx={{ fontSize: 18 }} /> {/* 上向き矢印 */}
                                  閉じる
                                </>
                              ) : (
                                <>
                                  <ExpandMore sx={{ fontSize: 18 }} /> {/* 下向き矢印 */}
                                  参加者の回答を表示 ({respondents.length}人)
                                </>
                              )}
                            </Button>

                            {/* 折りたたみ部分 */}
                            <Collapse in={expandedState[event_date.id]}>
                              {respondents.map((respondent) => {
                                const userPossibility = eventDetail?.user_possibilities.find(
                                  (item) =>
                                    item.event_date_id === event_date.id &&
                                    item.email === respondent.email
                                );

                                return (
                                  <Box key={respondent.user_code}>
                                    <Typography
                                      sx={{
                                        color:
                                          userPossibility?.possibility === 1
                                            ? 'green'
                                            : userPossibility?.possibility === 5
                                              ? 'gray'
                                              : 'red',
                                      }}
                                    >
                                      <Typography
                                        component="span"
                                        onClick={async () => {
                                          await selectRespondentUser(respondent.email);
                                        }}
                                        sx={{
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                        }}
                                      >
                                        {respondent.user_name}
                                      </Typography>
                                      :{' '}
                                      {userPossibility?.possibility === 1
                                        ? '〇'
                                        : userPossibility?.possibility === 5
                                          ? '？'
                                          : '×'}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Collapse>
                          </Box>
                        )}
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
                    <TableCell
                      sx={{
                        minWidth: 170,
                        fontWeight: 'bold',
                        textAlign: 'left',
                        padding: '8px',
                      }}
                    >
                      イベント候補日
                    </TableCell>
                    <TableCell
                      sx={{
                        minWidth: 50,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '8px',
                      }}
                    >
                      <Typography color="success" sx={{ fontWeight: 'bold' }}>
                        〇
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        minWidth: 50,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '8px',
                      }}
                    >
                      <Typography color="action" sx={{ fontWeight: 'bold' }}>
                        ？
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        minWidth: 50,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '8px',
                      }}
                    >
                      <Typography color="error" sx={{ fontWeight: 'bold' }}>
                        ×
                      </Typography>
                    </TableCell>
                    {respondents && respondents.length > 0 ? (
                      respondents.map(
                        (respondent, index) =>
                          respondent.user_name ? (
                            <TableCell
                              key={index}
                              onClick={async () => {
                                await selectRespondentUser(respondent.email);
                              }}
                              sx={{
                                minWidth: 150,
                                color: 'blue',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 'bold',
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
                        {respondents?.map((respondent) =>
                          eventDetail?.user_possibilities
                            .filter(
                              (item) =>
                                item.event_date_id === event_date.id &&
                                item.email === respondent.email
                            )
                            .map((data, index) => (
                              <TableCell key={index} sx={{ minWidth: 150, textAlign: 'center' }}>
                                <Tooltip title={data.comment || ''} arrow>
                                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                    {/* 〇や×の文字にも Tooltip を適用 */}
                                    <Typography
                                      sx={{
                                        color:
                                          data.possibility === 1
                                            ? 'green'
                                            : data.possibility === 5
                                              ? 'gray'
                                              : 'red',
                                        fontSize: 25,
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {data.possibility === 1
                                        ? '〇'
                                        : data.possibility === 5
                                          ? '？'
                                          : '×'}
                                    </Typography>

                                    {/* MarkUnreadChatAlt アイコンを data.comment がある場合にのみ表示 */}
                                    {data.comment && ( // data.comment が存在する場合に表示
                                      <MarkChatUnreadOutlined
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 25,
                                          fontSize: 15, // アイコンのサイズ
                                          color: 'grey', // アイコンの色
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Tooltip>
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
            borderLeft: '5px solid grey',
            boxShadow: 3,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
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
                p: { xs: 1, sm: 2 }, // 小さな画面ではパディングを1に、大きな画面では2に
                borderRadius: 2,
                boxShadow: 24,
                zIndex: (theme) => theme.zIndex.modal,
                width: '90%', // 画面が小さいときは90%に
                maxWidth: '800px', // 最大幅は800pxに制限
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
                                  defaultValue={
                                    myPossibilities?.find(
                                      (item) => item.event_date_id === event_date.id
                                    )?.comment
                                  }
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
            }}
            variant="contained"
            color="primary"
            sx={{
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
                  xs: '50px',
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
