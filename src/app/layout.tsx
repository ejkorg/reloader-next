// src/app/layout.tsx
"use client";

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import Header from './components/Header';
import Footer from './components/Footer';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Reloader</title>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header />
          <main style={{ padding: '20px 0' }}>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}


// "use client";

// import React from 'react';
// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import theme from '../styles/theme';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import '../styles/globals.css';

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <title>Reloader</title>
//       </head>
//       <body>
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Header />
//           <main style={{ padding: '20px 0' }}>{children}</main>
//           <Footer />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
