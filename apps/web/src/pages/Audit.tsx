import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { api } from '../api/client';

interface AuditItem {
  id: string;
  akcja: string;
  notatka?: string;
  timestamp: string;
}

export const Audit: React.FC = () => {
  const [items, setItems] = useState<AuditItem[]>([]);

  useEffect(() => {
    api.get('/audit').then((res) => setItems(res.data));
  }, []);

  return (
    <Box>
      <Typography variant="h2" mb={2}>
        Audyt
      </Typography>
      <Stack spacing={1}>
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent>
              <Typography variant="body1">{a.akcja}</Typography>
              <Typography variant="body2" color="text.secondary">
                {(a.notatka ?? 'brak') + ' | ' + a.timestamp?.slice(0, 19).replace('T', ' ')}
              </Typography>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak wpisów audytu.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};



