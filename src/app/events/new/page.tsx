'use client';

import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, FormControl, FormLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  AddSharp,
  CalendarMonthSharp,
  NoteAltSharp,
  RemoveCircleOutlineSharp,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const NewEventPage: React.FC = () => {
  const { control, handleSubmit } = useForm({});
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'date',
      headerName: '日付',
      flex: 3,

      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          dateFormats={{ year: 'YYYY年' }} // カレンダー内の年一覧のフォーマット
        >
          <DatePicker
            format="YYYY/MM/DD" // テキストエリア内のフォーマット
            slotProps={{ calendarHeader: { format: 'YYYY年MM月' } }} // カレンダーヘッダーのフォーマット
            defaultValue={dayjs(new Date())}
            sx={{ width: '100%', height: '80%' }}
          />
        </LocalizationProvider>
      ),
    },
    {
      field: 'eventName',
      headerName: '開始',
      flex: 1,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker label="時刻を選択" />
        </LocalizationProvider>
      ),
    },
    {
      field: 'note',
      headerName: '終了',
      sortable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker label="時刻を選択" />
        </LocalizationProvider>
      ),
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => <RemoveCircleOutlineSharp />,
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rows = [
    { id: 1, date: '2024/10/01', eventName: 'TeastEvent1', note: 'aaa' },
    { id: 2, date: '2024/10/02', eventName: 'TeastEvent2', note: 'aaa' },
    { id: 3, date: '2024/10/03', eventName: 'TeastEvent3', note: 'aaa' },
    { id: 4, date: '2024/10/04', eventName: 'TeastEvent4', note: 'aaa' },
    { id: 5, date: '2024/10/05', eventName: 'TeastEvent5', note: null },
  ];
  return (
    <>
      <Box
        display="flex"
        sx={{
          justifyContent: 'left',
          height: '80px', // 縦方向の中央揃え
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '15%', // 左右の余白を画面幅の3%に設定
          mt: '2%', // 上部に20pxのマージンを追加
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
          // height: '70vh', // ボックス全体の高さ
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '15%', // 左右の余白を画面幅の3%に設定
          backgroundColor: 'white',
          gap: 4,
        }}
      >
        <FormControl fullWidth>
          <FormLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <AddSharp />
              <Typography>イベント名</Typography>
            </Box>
          </FormLabel>
          <OutlinedInput placeholder="イベント名を入力してください" />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <NoteAltSharp />
              <Typography>会議室・会場・備考等</Typography>
            </Box>
          </FormLabel>
          <TextField
            placeholder="イベントの詳細を入力してください"
            variant="outlined"
            multiline
            rows={2} // 表示する行数
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarMonthSharp />
              <Typography>候補日時</Typography>
            </Box>
          </FormLabel>
          <DataGrid
            rows={rows}
            columns={columns}
            density="standard"
            pageSizeOptions={[5, 10, 15]} // ページネーションを無効にする
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: 'none', // ヘッダー下の線を削除
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none', // 列の区切り線を非表示
              },
              boxShadow: 1,
              overflowX: 'auto',
            }}
            disableRowSelectionOnClick
            disableColumnSelector
            getRowId={(row) => row.id}
          />
        </FormControl>
      </Box>
    </>
  );
};

export default NewEventPage;
