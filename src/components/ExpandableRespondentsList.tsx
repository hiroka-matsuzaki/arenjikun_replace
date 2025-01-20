import React, { useState } from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { User } from '@/types/user';
import { EventDate, EventResponse } from '@/types/event';

interface ExpandableRespondentsListProps {
  respondents: User[];
  eventDetail: EventResponse;
  event_date: EventDate;
}

const ExpandableRespondentsList: React.FC<ExpandableRespondentsListProps> = ({
  respondents,
  eventDetail,
  event_date,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Box>
      {/* ボタンで開閉を切り替える */}
      <Button
        onClick={toggleExpanded}
        variant="text" // 塗りつぶしをなくす
        size="small"
        sx={{
          color: 'gray', // 文字色を控えめに
          fontSize: '0.875rem', // 少し小さめの文字サイズ
          padding: '4px 8px', // 内側の余白を少なく
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)', // ホバー時の色を控えめに
          },
        }}
      >
        {expanded ? '閉じる' : `参加者の回答を表示 (${respondents.length}人)`}
      </Button>

      {/* 折りたたみ部分 */}
      <Collapse in={expanded}>
        {respondents.map((respondent) => {
          const userPossibility = eventDetail?.user_possibilities.find(
            (item) => item.event_date_id === event_date.id && item.email === respondent.email
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
                <span
                  onClick={() => handleUserClick(respondent)}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline', // クリック可能感を出すために下線
                  }}
                >
                  {respondent.user_name}
                </span>
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
  );
};

export default ExpandableRespondentsList;
