import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { blue } from '@mui/material/colors';

export default function EventCard(props) {

  return (
    <Card sx={{ display: 'flex', width: 700 }}>
      <CardMedia
        component="img"
        sx={{ width: 250 }}
        image={require("../assets/lolla.png")}
        alt="NFT name"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 550, bgcolor: blue[500] }}>
        <CardHeader
          title={props.data.nameVal}
        />
        <CardContent sx={{ width: 400 }}>
        {props.data.event_description}
        </CardContent>
      </Box>
    </Card>
  );
}