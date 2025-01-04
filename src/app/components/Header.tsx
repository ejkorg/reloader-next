import React from 'react';
import { AppBar, Toolbar, Typography, InputBase, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#002b36', padding: '0 16px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box mx={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/onsemi_logo_reverse.svg" alt="Logo" width={80} height={80} />
          {/* <Typography variant="h6" sx={{ ml: 2 }}>
            onsemi
          </Typography> */}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', marginLeft: 'auto' }}>
          <InputBase
            placeholder="Search for anything..."
            sx={{
              color: 'inherit',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 1,
              paddingLeft: 2,
              paddingRight: 2,
              width: '200px',
            }}
          />
          <IconButton type="submit" sx={{ position: 'absolute', right: 0, padding: '10px' }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

