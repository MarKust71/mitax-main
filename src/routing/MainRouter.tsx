import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Main } from '../app/main/Main';
import { Blog } from '../app/blog/Blog';
import { Contact } from '../app/contact/Contact';
import { RedirectTimeSlots } from '../app/redirectTimeSlots/RedirectTimeSlots';

import { Error404 } from './Error404';

export const MainRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<Blog />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/terminy" element={<RedirectTimeSlots />} />
        <Route path="/" element={<Main />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
};
