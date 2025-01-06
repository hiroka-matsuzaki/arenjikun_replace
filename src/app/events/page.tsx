'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
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
        const response = await fetch(
          `https://azure-api-opf.azurewebsites.net/api/events?email=${email}` //テスト用ベタ打ち
        );
        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data: EventList = await response.json();
        const formattedData = data.map((event) => ({
          ...event,
          created_at: formatDate(event.created_at),
        }));

        setEvents(formattedData);
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
        <Button
          onClick={() => handleButtonClick(params.row)}
          sx={{
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'white', // 文字の色を白に設定
            backgroundColor: 'primary.main', // ボタンの背景色（例: テーマのメインカラー）
            '&:hover': {
              backgroundColor: 'primary.dark', // ホバー時の背景色（例: テーマのダークカラー）
            },

            pointerEvents: 'auto',
          }}
        >
          詳細
        </Button>
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
          height: '80px',
          border: '1px solid #ccc',
          padding: '20px',
          mx: '10%',
          mt: '2%',
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
          border: '1px solid #ccc',
          padding: '20px',
          mx: '10%',
          backgroundColor: 'white',
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
          <DataGrid
            rows={events}
            columns={columns.map((column) => ({
              ...column,
              flex: column.flex || 1,
              minWidth: column.minWidth || 150,
              editable: column.editable ?? false,
            }))}
            density="standard"
            pageSizeOptions={[5, 10, 15]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: 'none',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'inherit', // ホバー時の背景色を無効化
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none', // セルのフォーカス時の枠線を削除
              },
              '& .MuiDataGrid-row:focus': {
                outline: 'none', // 行のフォーカス時の枠線を削除
              },
              '& .MuiDataGrid-selected': {
                backgroundColor: 'inherit', // 選択状態の背景色を変更なしにする
                border: 'none', // 選択状態での枠線を削除
              },
              boxShadow: 1,
              width: '100%',
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 15,
                },
              },
            }}
            disableRowSelectionOnClick // 行選択を無効化
            disableColumnSelector // 列選択機能を無効化
            disableColumnMenu // 列メニューの無効化
            getRowId={(event) => event.id}
          />
        </Box>
      </Box>
    </>
  );
};

export default EventsPage;
