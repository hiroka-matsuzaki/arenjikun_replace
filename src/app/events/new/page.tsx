'use client';

import React, { useState } from 'react';
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
  TableContainer,
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
import typographyStyles from '@/styles/typographyStyles';
import { useRouter } from 'next/navigation';

type FormData = {
  eventName: string;
  venue: string;
  dateOptions: { id: number; date: string; start: string; end: string }[];
};
const NewEventPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      eventName: '',
      venue: '',
      dateOptions: [
        {
          id: 1,
          date: dayjs().startOf('day').toISOString(),
          start: dayjs().startOf('day').hour(9).toISOString(),
          end: dayjs().startOf('day').hour(11).toISOString(),
        },
      ],
    },
  });
  const { user } = useUser(); // UserContextからユーザー情報を取得

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dateOptions = watch('dateOptions'); // 日時候補のリアルタイム監視
  const router = useRouter();
  const goTo = (path: string) => router.push(path);

  const handleRowAdd = () => {
    const latestDateOption = dateOptions.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
    console.log('latestDateOption:', latestDateOption);

    const newRow = {
      id: dateOptions.length + 1,
      date: latestDateOption.date
        ? dayjs(latestDateOption.date).add(1, 'day').toISOString() // 次の日を設定
        : dayjs().startOf('day').add(1, 'day').toISOString(),
      start: dayjs().startOf('day').hour(9).toISOString(),
      end: dayjs().startOf('day').hour(11).toISOString(),
    };
    setValue('dateOptions', [...dateOptions, newRow]);
  };

  const handleRowRemove = (id: number) => {
    setValue(
      'dateOptions',
      dateOptions.filter((row) => row.id !== id)
    );
  };

  const formatDateTime = (date: string, time: string) => {
    return `${dayjs(date).format('YYYY-MM-DD')} ${dayjs(time).format('HH:mm:ss')}`;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      subject: data.eventName,
      description: data.venue,
      date_from: data.dateOptions.map((opt) => formatDateTime(opt.date, opt.start)),
      date_to: data.dateOptions.map((opt) => formatDateTime(opt.date, opt.end)),
    };

    try {
      const response = await fetch(
        `https://azure-api-opf.azurewebsites.net/api/events?email=${user?.email}`,
        {
          method: 'POST',
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
      const textResponse = await response.text();
      console.log(textResponse);
      goTo(`/events/${textResponse}?message=イベントが正常に登録されました！`);
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
        sx={{
          display: 'flex',
          justifyContent: 'left',
          height: '80px', // 縦方向の中央揃え
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '10%', // 左右の余白を画面幅の設定
          mt: '2%', // 上部にマージンを追加
        }}
      >
        <Typography variant="h4" gutterBottom sx={typographyStyles.header}>
          新規イベント
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
            <FormLabel sx={{ fontSize: '1.2rem' }}>イベント名</FormLabel>
          </Box>
          <OutlinedInput
            placeholder="イベント名を入力"
            {...register('eventName', {
              required: 'イベント名は必須です',
              maxLength: { value: 50, message: 'イベント名は50文字以内で入力してください' },
            })}
            sx={{
              '& fieldset': {
                // デフォルト
                borderColor: errors.eventName ? 'error.main' : 'grey.400',
              },
              '&:hover fieldset': {
                // ホバー時
                borderColor: errors.eventName ? 'error.main' : 'grey.600',
              },
              '&.Mui-focused fieldset': {
                // フォーカス時
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
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 150 }} align="center">
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <Event sx={{ fontSize: { xs: 24, sm: 24 } }} />
                      <Typography sx={{ ml: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        日付
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: 100 }} align="center">
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <AccessTime sx={{ fontSize: { xs: 24, sm: 24 } }} />
                      <Typography sx={{ ml: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        開始
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: 100 }} align="center">
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <AccessTime sx={{ fontSize: { xs: 24, sm: 24 } }} />
                      <Typography sx={{ ml: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        終了
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: 100 }} align="center">
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <Typography
                        sx={{ ml: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      ></Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dateOptions.map((row, index) => (
                  <TableRow key={row.id}>
                    {/* 日付 */}
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

                    {/* 開始 */}
                    <TableCell align="center">
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

                    {/* 終了 */}
                    <TableCell align="center">
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

                    {/* 削除ボタン */}
                    <TableCell align="center">
                      {index !== 0 && (
                        <IconButton color="secondary" onClick={() => handleRowRemove(row.id)}>
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
                {/* 行追加ボタン */}
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
          </TableContainer>
        </FormControl>

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
