'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { EventRow } from '@/types/EventRow';
import { useRouter } from 'next/navigation';

const EventsPage = () => {
  const router = useRouter();
  const goTo = (path: string) => router.push(path);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'date',
      headerName: '作成日',
      flex: 1,
      editable: true,
    },
    {
      field: 'eventName',
      headerName: 'イベント名',
      flex: 2,
      editable: true,
    },
    {
      field: 'note',
      headerName: '内容',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 2.5,
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <button
          onClick={() => handleButtonClick(params.row)}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          詳細
        </button>
      ),
    },
  ];
  const rows = [
    { id: 1, date: '2024/10/01', eventName: 'TeastEvent1', note: 'aaa' },
    { id: 2, date: '2024/10/02', eventName: 'TeastEvent2', note: 'aaa' },
    { id: 3, date: '2024/10/03', eventName: 'TeastEvent3', note: 'aaa' },
    { id: 4, date: '2024/10/04', eventName: 'TeastEvent4', note: 'aaa' },
    { id: 5, date: '2024/10/05', eventName: 'TeastEvent5', note: null },
    { id: 6, date: '2024/10/06', eventName: 'TeastEvent6', note: 'aaa' },
    { id: 7, date: '2024/10/07', eventName: 'TeastEvent7', note: 'aaa' },
    { id: 8, date: '2024/10/08', eventName: 'TeastEvent8', note: 'aaa' },
    { id: 9, date: '2024/10/09', eventName: 'TeastEvent9', note: 'aaa' },
  ];
  const handleButtonClick = (row: EventRow) => {
    goTo(`/events/${row.id}`);
  };
  return (
    <>
      <Box
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
          イベント一覧
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          // height: '70vh', // 縦方向の中央揃え
          // minWidth: 900,
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '15%', // 左右の余白を画面幅の3%に設定
          backgroundColor: 'white',
        }}
      >
        <br></br>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            density="standard"
            pageSizeOptions={[5, 10, 15]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: 'none', // ヘッダー下の線を削除
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none', // 列の区切り線を非表示
              },
              boxShadow: 1,
              // minWidth: 900,
              overflowX: 'auto',
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 15,
                },
              },
            }}
            disableRowSelectionOnClick
            disableColumnSelector
            getRowId={(row) => row.id}
          />
        </div>
      </Box>
    </>
  );
};

export default EventsPage;
