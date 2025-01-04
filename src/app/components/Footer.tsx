import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ backgroundColor: '#002b36', color: 'white', py: 3, textAlign: 'center', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Image src="/onsemi_logo_reverse_footer.svg" alt="Logo" width={100} height={80} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        © {currentYear} onsemi. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

