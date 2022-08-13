import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Main } from '../app/main/Main';
import { Blog } from '../app/blog/Blog';
import { Contact } from '../app/contact/Contact';

export const MainRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<Blog />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
};
