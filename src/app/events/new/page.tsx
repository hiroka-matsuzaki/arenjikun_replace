'use client';

import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import {
  AddSharp,
  RemoveCircleOutlineSharp,
  CalendarMonthSharp,
  NoteAltSharp,
  Event,
  MeetingRoom,
  Notes,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

type FormData = {
  eventName: string;
  venue: string;
  dateOptions: { id: number; date: string; start: string; end: string }[];
};

const NewEventPage: React.FC = () => {
  const { control, handleSubmit, register, watch, setValue } = useForm<FormData>({
    defaultValues: {
      eventName: '',
      venue: '',
      dateOptions: [{ id: 1, date: '', start: '', end: '' }],
    },
  });

  const dateOptions = watch('dateOptions'); // 日時候補のリアルタイム監視

  const handleRowAdd = () => {
    const newRow = { id: dateOptions.length + 1, date: '', start: '', end: '' };
    setValue('dateOptions', [...dateOptions, newRow]);
  };

  const handleRowRemove = (id: number) => {
    setValue(
      'dateOptions',
      dateOptions.filter((row) => row.id !== id)
    );
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log('送信データ:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        <Typography variant="h4" gutterBottom>
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
        <FormControl fullWidth>
          <Box sx={{ display: 'flex' }} gap={1}>
            <Event />
            <FormLabel>イベント名</FormLabel>
          </Box>
          <OutlinedInput
            placeholder="イベント名を入力"
            {...register('eventName', { required: true })}
          />
        </FormControl>

        {/* 会場・備考 */}
        <FormControl fullWidth>
          <Box sx={{ display: 'flex' }} gap={1}>
            <Notes />
            <FormLabel>会議室・会場・備考等</FormLabel>
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
              <Typography>候補日時</Typography>
            </Box>
          </FormLabel>
          <Table sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ fontWeight: 'bold', height: '10px' }}>
                <TableCell align="center" sx={{ fontWeight: 'bold', padding: '10px' }}>
                  日付
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', padding: '10px' }}>
                  開始
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', padding: '10px' }}>
                  終了
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', padding: '10px' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dateOptions.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell align="center" sx={{ padding: '0px' }}>
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.date`}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...rest}
                            value={value ? dayjs(value) : null}
                            onChange={(newValue) =>
                              onChange(newValue ? newValue.toISOString() : '')
                            }
                            format="YYYY/MM/DD"
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '0px' }}>
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.start`}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            {...rest}
                            value={value ? dayjs(value) : null}
                            onChange={(newValue) =>
                              onChange(newValue ? newValue.toISOString() : '')
                            }
                            ampm={false}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Controller
                      control={control}
                      name={`dateOptions.${index}.end`}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            {...rest}
                            value={value ? dayjs(value) : null}
                            onChange={(newValue) =>
                              onChange(newValue ? newValue.toISOString() : '')
                            }
                            ampm={false}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '0px' }}>
                    <IconButton color="secondary" onClick={() => handleRowRemove(row.id)}>
                      <RemoveCircleOutlineSharp />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* 空白行（入力エリア非表示） */}
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={handleRowAdd}>
                    <AddSharp />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </FormControl>

        <Button variant="contained" color="primary" type="submit">
          登録
        </Button>
      </Box>
    </form>
  );
};

export default NewEventPage;
