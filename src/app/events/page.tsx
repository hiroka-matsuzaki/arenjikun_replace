'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Pagination,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Event, EventList } from '@/types/event';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import typographyStyles from '@/styles/typographyStyles';
import { Add, ArrowForward } from '@mui/icons-material';

const EventsPage = () => {
  const router = useRouter();
  const goTo = (path: string) => router.push(path);
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const { user } = useUser();

  const [events, setEvents] = useState<EventList>([]);
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
  }, [user?.email]);
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
            color: 'white',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
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
  const goToNewEvent = () => router.push('/events/new');
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage: React.SetStateAction<number>) => {
    setCurrentPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const normalizeDate = (dateStr: string) => {
    return dateStr.replace(/年|月/g, '-').replace(/日/g, '');
  };

  const sortedEvents = events.slice().sort((a, b) => {
    const dateA = new Date(normalizeDate(a.created_at)).getTime();
    const dateB = new Date(normalizeDate(b.created_at)).getTime();
    return dateB - dateA;
  });

  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px',
          border: '1px solid #ccc',
          padding: '20px',
          mx: { xs: '5%', sm: '10%' },
          mt: '2%',
        }}
      >
        <Typography variant="h4" gutterBottom sx={typographyStyles.header}>
          イベント一覧
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={goToNewEvent}
          sx={{
            backgroundColor: 'white', // 背景は白
            color: 'primary.main',
            border: '1px solid', // ボーダー幅は控えめ
            borderColor: 'primary.main',
            textTransform: 'none',
            padding: { xs: '4px 12px', sm: '6px 16px' }, // 横幅を小さくするパディング
            minWidth: 'auto', // 幅を固定せず、コンテンツに合わせる
            height: 'auto', // 高さはパディングに基づく
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            boxShadow: 'none', // 影を削除してシンプルに
            '&:hover': {
              backgroundColor: 'primary.light', // ホバー時の背景色を淡く
              color: 'white',
              borderColor: 'primary.light',
            },
          }}
        >
          <Add
            sx={{
              display: { xs: 'none', sm: 'flex' }, // モバイルでは非表示
              mr: 0.5, // アイコンとの間隔を調整
              color: 'primary.main',
            }}
          />
          新規イベント
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          border: '1px solid #ccc',
          padding: '20px',
          mx: { xs: '5%', sm: '10%' },
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
          {isSmallScreen ? (
            // モバイルビュー: カード形式で表示
            <Box>
              {paginatedEvents?.map((event) => (
                <Card key={event.id} sx={{ marginBottom: 2, boxShadow: 1 }}>
                  <CardContent>
                    {/* 作成日 */}
                    <Typography variant="body2" sx={{ color: 'grey', marginBottom: 1 }}>
                      作成日: {event.created_at}
                    </Typography>

                    {/* イベント名 */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      {event.subject}
                    </Typography>

                    {/* イベントの内容 */}
                    <Typography variant="body2" sx={{ marginBottom: 2 }}>
                      {event.description.length > 20
                        ? `${event.description.substring(0, 20)}...`
                        : event.description}
                    </Typography>

                    {/* 詳細ボタン */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Button
                        onClick={() => handleButtonClick(event)}
                        variant="contained"
                        color="primary"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                      >
                        詳細 <ArrowForward />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* ページネーション */}
              <Pagination
                count={Math.ceil(events.length / ITEMS_PER_PAGE)}
                page={currentPage}
                onChange={(e, page) => handlePageChange(page)}
                sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
              />
            </Box>
          ) : (
            // デスクトップビュー: DataGrid形式で表示
            <DataGrid
              rows={[...events].sort((a, b) => b.id - a.id)}
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
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'left',
          border: '1px solid #ccc',
          mx: { xs: '5%', sm: '10%' }, // 小さい画面ではより狭く、大きい画面では広く
          mt: '2%', // マージン追加（必要に応じて調整）
        }}
      ></Box>
    </>
  );
};

export default EventsPage;
