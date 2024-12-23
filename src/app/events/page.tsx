'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Event, EventList } from '@/types/event';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import typographyStyles from '@/styles/typographyStyles';

const EventsPage = () => {
  const router = useRouter();
  const goTo = (path: string) => router.push(path);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  const [events, setEvents] = useState<EventList>([]); //
  useEffect(() => {
    const fetchEvents = async (email: string | undefined) => {
      try {
        // const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL;

        const response = await fetch(
          `https://azure-api-opf.azurewebsites.net/api/events?email=${email}` //テスト用ベタ打ち
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
    fetchEvents(user?.email);
  }, [user?.email]); // 空の依存配列
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
        <Box style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
          <DataGrid
            rows={events}
            columns={columns.map((column) => ({
              ...column,
              flex: column.flex || 1, // flexプロパティを使用して列幅を動的に設定
              minWidth: column.minWidth || 150, // 最小幅を設定、指定がない場合は150pxをデフォルトに
            }))}
            density="standard"
            pageSizeOptions={[5, 10, 15]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: 'none', // ヘッダー下の線を削除
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none', // 列の区切り線を非表示
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'inherit', // ホバー時の背景色を変更しない
              },
              boxShadow: 1,
              width: '100%', // 親コンテナの幅に合わせる
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
            getRowId={(event) => event.id}
          />
        </Box>
      </Box>
    </>
  );
};

export default EventsPage;
