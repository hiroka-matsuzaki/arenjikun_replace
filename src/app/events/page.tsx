'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Event, EventList } from '@/types/event';
import { useRouter } from 'next/navigation';

const EventsPage = () => {
  const router = useRouter();
  const goTo = (path: string) => router.push(path);

  const [events, setEvents] = useState<EventList>([]); //

  // イベントを取得する関数
  const fetchEvents = async () => {
    try {
      // const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL;

      const response = await fetch(
        'https://azure-api-opf.azurewebsites.net/api/events?email=s.sunagawa@hiroka.biz'
      );
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data: EventList = await response.json();
      // created_atの日付をフォーマットしてからセット
      const formattedData = data.map((event) => ({
        ...event,
        created_at: formatDate(event.created_at), // created_atを変換
      }));

      setEvents(formattedData); // フォーマットしたデータをセット
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  // 初回レンダリング時のみ実行
  useEffect(() => {
    fetchEvents();
  }, []); // 空の依存配列
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };
  const columns: GridColDef<(typeof events)[number]>[] = [
    {
      field: 'created_at',
      headerName: '作成日',
      flex: 1,
      editable: true,
    },
    {
      field: 'subject',
      headerName: 'イベント名',
      flex: 2,
      editable: true,
    },
    {
      field: 'description',
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
  const handleButtonClick = (event: Event) => {
    goTo(`/events/${event.url}`);
  };
  return (
    <>
      <Box
        sx={{
          justifyContent: 'left',
          height: '80px', // 縦方向の中央揃え
          border: '1px solid #ccc', // 四角の枠線
          padding: '20px', // 内側の余白
          mx: '10%', // 左右の余白を画面幅の設定
          mt: '2%', // 上部にマージンを追加
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
          mx: '10%', // 左右の余白を画面幅の3%に設定
          backgroundColor: 'white',
        }}
      >
        <br></br>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={events}
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
            getRowId={(events) => events.id}
          />
        </div>
      </Box>
    </>
  );
};

export default EventsPage;
