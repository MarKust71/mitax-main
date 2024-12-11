import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Main } from '../app/main/Main';
import { Blog } from '../app/blog/Blog';
import { Contact } from '../app/contact/Contact';
import { RedirectTimeSlots } from '../app/redirectTimeSlots/RedirectTimeSlots';
import { HousingCommunity } from '../app/housingCommunity/HousingCommunity';
import { ListMembers } from '../app/housingCommunity/listMembers/ListMembers';
import { AddMember } from '../app/housingCommunity/addMember/AddMember';
import { ListUnits } from '../app/housingCommunity/listUnits/ListUnits';
import { AddUnit } from '../app/housingCommunity/addUnit/AddUnit';
import { TenDaysProgramme } from '../app/dMb/tenDaysProgramme/TenDaysProgramme';
import { Jpk } from '../app/jpk/Jpk';
// eslint-disable-next-line max-len
import { RedirectKomornikPlanPodzialuWykonanie } from '../app/redirectKomornikPlanPodzialuWykonanie/RedirectKomornikPlanPodzialuWykonanie';

import { Error404 } from './Error404';
import { MainRoutes } from './MainRouter.constants';

export const MainRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={MainRoutes.BLOG} element={<Blog />} />
        <Route path={MainRoutes.CONTACT} element={<Contact />} />
        <Route path={MainRoutes.DATES} element={<RedirectTimeSlots />} />
        <Route path={MainRoutes.DMB_10DAYSPROGRAMME} element={<TenDaysProgramme />} />
        <Route path={MainRoutes.HC_MEMBERS} element={<ListMembers />} />
        <Route path={MainRoutes.HC_MEMBER_NEW} element={<AddMember />} />
        <Route path={MainRoutes.HC_UNITS} element={<ListUnits />} />
        <Route path={MainRoutes.HC_UNIT_NEW} element={<AddUnit />} />
        <Route path={MainRoutes.HOME} element={<Main />} />
        <Route path={MainRoutes.HOUSING_COMMUNITY} element={<HousingCommunity />} />
        <Route path={MainRoutes.JPK} element={<Jpk />} />
        <Route
          path={MainRoutes.KOMORNIK_PLAN_PODZIALU}
          element={<RedirectKomornikPlanPodzialuWykonanie />}
        />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
};
