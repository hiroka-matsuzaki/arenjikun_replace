/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  OutlinedInput,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  Button,
  CircularProgress,
  TableHead,
  Table,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  CalendarMonthSharp,
  Event,
  Notes,
  AccessTime,
  AddCircleOutline,
  RemoveCircleOutline,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useUser } from '@/app/context/UserContext';
import { EventResponse } from '@/types/event';
import { useParams, useRouter } from 'next/navigation';
import { Users } from '@/types/user';
// import { EventResponse } from '@/types/event';

type FormData = {
  eventName: string;
  venue: string;
  dateOptions: { u: number; id: number | null; date: string; start: string; end: string }[];
};

const NewEventPage: React.FC = () => {
  const { user } = useUser(); // UserContextからユーザー情報を取得
  const [users, setUsers] = useState<Users>();
  // const [respondents, setRespondent] = useState<Users>();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [eventDetail, setEventDetail] = useState<EventResponse>();
  const [selectedUsers, setSelectedUsers] = useState<Users>([]);
  const [selectedDefaultUsers, setSelectedDefaultUsers] = useState<Users>([]);

  const params = useParams();
  const router = useRouter();
  const goTo = (path: string) => router.push(path);
  const id = params?.id as string | undefined;
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      eventName: eventDetail?.events.subject,
      venue: eventDetail?.events.description,
      dateOptions: [],
    },
  });

  function getUniqueUsers(usersA: Users, usersB: Users): Users {
    return usersA.filter(
      (userA) => !usersB.some((userB) => userA.user_code === userB.user_code) // 比較条件: user_codeが一致するか
    );
  }

  async function postNewUsers(newUsers: Users) {
    const sendData = newUsers.map((user) => user.user_code);
    const dataToSend = {
      new_users: sendData,
    };
    console.log('送信データ:', sendData);
    try {
      const updateResponse = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/events/${id}/update_join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`更新エラー: ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.text();
      console.log('更新結果:', updateResult);
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラー:', error.message);
        alert('エラーが発生しました: ' + error.message);
      } else {
        console.error('未知のエラー:', error);
        alert('未知のエラーが発生しました。');
      }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchEventDetail = async () => {
    try {
      const response = await fetch(`https://azure-api-opf.azurewebsites.net/api/events/${id}`);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      console.log('response:', response);
      const data: EventResponse = await response.json();
      console.log('データ:', data);
      if (!data.event_dates) {
        console.error('responseが異常です');
        return;
      }
      defaultRowAdd(data);
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

      const usersResponse = await fetch(`https://azure-api-opf.azurewebsites.net/api/users`);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${usersResponse.status}`);
      }
      const usersData: Users = await usersResponse.json();
      console.log('Users:', usersData);

      const initialSelectedUsers = usersData?.filter((user) =>
        users?.some((resUser) => resUser.email === user.email)
      );
      setSelectedUsers(initialSelectedUsers);
      setSelectedDefaultUsers(initialSelectedUsers);
      setEventDetail(data);
      // setRespondent(users);
      setUsers(usersData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };
  useEffect(() => {
    console.log('Effect triggered');
    fetchEventDetail();
  }, []); // 空の依存配列

  const handleRowAdd = () => {
    const latestDateOption = dateOptions.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
    const newRow = {
      u: dateOptions.length + 1,
      id: null,
      date: latestDateOption.date
        ? dayjs(latestDateOption.date).add(1, 'day').toISOString() // 次の日を設定
        : dayjs().startOf('day').add(1, 'day').toISOString(),
      start: dayjs().startOf('day').hour(9).toISOString(),
      end: dayjs().startOf('day').hour(11).toISOString(),
    };
    console.log('addRow:', newRow);

    setValue('dateOptions', [...dateOptions, newRow]);

    console.log('addedDateOptions:', dateOptions);
  };

  const handleRowRemove = (u: number) => {
    console.log('Remove:', dateOptions);

    const updatedDateOptions = dateOptions.filter((row) => row.u !== u);

    setValue('dateOptions', updatedDateOptions);

    console.log('Removed:', updatedDateOptions);
  };
  // const initialSelectedUsers = users?.filter((user) =>
  //   respondents?.some((resUser) => resUser.email === user.email)
  // );

  // const [selectedUsers, setSelectedUsers] = useState<Users>(initialSelectedUsers || []);

  const formatDateTime = (date: string, time: string) => {
    return `${dayjs(date).format('YYYY-MM-DD')} ${dayjs(time).format('HH:mm:ss')}`;
  };

  const defaultRowAdd = (data: EventResponse) => {
    const defaultRow =
      [...(data?.event_dates || [])]
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
        .map((event_date, index) => ({
          u: index + 1,
          id: event_date.id,
          date: dayjs(event_date.dated_on).startOf('day').toISOString(),
          start: dayjs(event_date.dated_on)
            .startOf('day')
            .add(event_date.start_time, 'minute')
            .toISOString(),
          end: dayjs(event_date.dated_on)
            .startOf('day')
            .add(event_date.end_time, 'minute')
            .toISOString(),
        })) || [];

    console.log('defaultRow:', defaultRow);

    if (defaultRow.length > 0) {
      setValue('dateOptions', defaultRow);
    }
    setValue('eventName', data?.events.subject);
    setValue('venue', data?.events.description);
  };

  const dateOptions = watch('dateOptions');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const uniqueToSelectedUsers = getUniqueUsers(selectedUsers, selectedDefaultUsers);

    if (uniqueToSelectedUsers.length > 0) {
      console.log('uniqueToSelected:', uniqueToSelectedUsers);
      await postNewUsers(uniqueToSelectedUsers);
    } else {
      console.log('No unique users found in A.');
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      subject: data.eventName,
      description: data.venue,
      date_from: data.dateOptions.map((opt) => formatDateTime(opt.date, opt.start)),
      date_to: data.dateOptions.map((opt) => formatDateTime(opt.date, opt.end)),
      event_dates_id: data.dateOptions.map((opt) => opt.id),
    };
    console.log('payload:', await payload);

    try {
      const response = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/events/${id}?email=${user?.email}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTPエラー! status: ${response.status}`);
      }

      console.log('APIからのレスポンス:', await response);

      // 登録成功時の処理
      reset();
      goTo(`/events/${id}?message=イベントの編集に成功しました！`);
    } catch (error) {
      console.error('エラーが発生しました:', error);
      setErrorMessage('登録中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        display="flex"
        alignItems="center" // 垂直方向を中央揃え
        sx={{
          justifyContent: 'space-between', // アイコンとテキストの間隔調整用
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
          イベント編集
        </Typography>
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
        {/* イベント名入力 */}
        <FormControl fullWidth error={!!errors.eventName}>
          {' '}
          {/* エラーの有無を判断 */}
          <Box sx={{ display: 'flex' }} gap={1}>
            <Event />
            <FormLabel>イベント名</FormLabel>
          </Box>
          <OutlinedInput
            placeholder="イベント名を入力"
            {...register('eventName', {
              required: 'イベント名は必須です',
              maxLength: { value: 50, message: 'イベント名は50文字以内で入力してください' },
            })}
            sx={{
              '& fieldset': {
                borderColor: errors.eventName ? 'error.main' : 'grey.400',
              },
              '&:hover fieldset': {
                borderColor: errors.eventName ? 'error.main' : 'grey.600',
              },
              '&.Mui-focused fieldset': {
                borderColor: errors.eventName ? 'error.main' : 'primary.main',
              },
            }}
          />
          {errors.eventName && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.eventName.message}
            </Typography>
          )}
        </FormControl>

        {/* 会場・備考 */}
        <FormControl fullWidth>
          <Box sx={{ display: 'flex' }} gap={1}>
            <Notes />
            <FormLabel sx={{ fontSize: '1.2rem' }}>会議室・会場・備考等</FormLabel>
          </Box>

          <TextField
            placeholder="イベントの詳細を入力してください"
            multiline
            rows={2}
            {...register('venue')}
          />
        </FormControl>

        {/* 日時候補 */}
        <FormControl fullWidth>
          <FormLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarMonthSharp />
              <Typography sx={{ fontSize: '1.2rem' }}>候補日時</Typography>
            </Box>
          </FormLabel>
          <Table sx={{ border: '1px solid lightgray ' }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={1}>
                  <Box display="flex" alignItems="center" justifyContent="flex-start">
                    <Event />
                    <Typography sx={{ ml: 1 }}>日付</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" colSpan={1}>
                  <Box display="flex" alignItems="center" justifyContent="flex-start">
                    <AccessTime />
                    <Typography sx={{ ml: 1 }}>開始</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" colSpan={1}>
                  <Box display="flex" alignItems="center" justifyContent="flex-start">
                    <AccessTime />
                    <Typography sx={{ ml: 1 }}>日付</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dateOptions.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.date`}
                      rules={{
                        required: '日付は必須です',
                        validate: (value) => {
                          if (!value || !dayjs(value).isValid()) {
                            return '有効な日付を入力してください';
                          }
                          if (dayjs(value).isBefore(dayjs(), 'day')) {
                            return 'イベント候補日は過去日付を設定できません';
                          }
                          return true;
                        },
                      }}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={value ? dayjs(value) : null}
                              onChange={(newValue) =>
                                onChange(newValue ? newValue.toISOString() : '')
                              }
                              format="YYYY/MM/DD"
                            />
                          </LocalizationProvider>
                          {error && (
                            <Typography variant="body2" color="error">
                              {error.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.start`}
                      rules={{
                        required: '開始時刻は必須です',
                      }}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              value={value ? dayjs(value) : null}
                              onChange={(newValue) =>
                                onChange(newValue ? newValue.toISOString() : '')
                              }
                              ampm={false}
                            />
                          </LocalizationProvider>
                          {error && (
                            <Typography variant="body2" color="error">
                              {error.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.end`}
                      rules={{
                        required: '終了時刻は必須です',
                        validate: (value) => {
                          const startValue = watch(`dateOptions.${index}.start`);
                          if (!value || !dayjs(value).isValid()) {
                            return '有効な時刻を入力してください';
                          }
                          if (startValue && dayjs(value).isBefore(dayjs(startValue))) {
                            return '終了時刻は開始時刻以降で設定してください';
                          }
                          return true;
                        },
                      }}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              value={value ? dayjs(value) : null}
                              onChange={(newValue) =>
                                onChange(newValue ? newValue.toISOString() : '')
                              }
                              ampm={false}
                            />
                          </LocalizationProvider>
                          {error && (
                            <Typography variant="body2" color="error">
                              {error.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {index !== 0 && (
                      <IconButton color="secondary" onClick={() => handleRowRemove(row.u)}>
                        <RemoveCircleOutline
                          sx={{
                            color: '#F44336',
                            fontSize: '2rem',
                          }}
                        />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={3}></TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={handleRowAdd}>
                    <AddCircleOutline
                      sx={{
                        color: '#4CAF50',
                        fontSize: '2rem',
                      }}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </FormControl>
        <Box sx={{ display: 'flex' }} gap={1}>
          <Event />
          <FormLabel>参加者</FormLabel>
        </Box>
        <Autocomplete
          multiple
          options={users || []}
          getOptionLabel={(option) => option.email}
          filterSelectedOptions
          value={selectedUsers}
          onChange={(event, newValue) => setSelectedUsers(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select Users"
              placeholder="Search by email"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.user_name} {...getTagProps({ index })} key={option.user_code} />
            ))
          }
          renderOption={(props, option) => (
            <li {...props} key={option.user_code}>
              {option.email} ({option.user_name})
            </li>
          )}
        />
        <Button variant="contained" color="primary" type="submit" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : '登録'}
        </Button>

        {successMessage && (
          <Typography variant="body1" color="success" sx={{ mt: 2 }}>
            {successMessage}
          </Typography>
        )}

        {errorMessage && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    </form>
  );
};

export default NewEventPage;
