import { MainRoutes } from '../../routing/MainRouter.constants';

export const dashboardLinks = [
  { label: 'Strona główna', route: MainRoutes.HOME },
  { label: 'Blog', route: MainRoutes.BLOG },
  { label: 'Kontakt', route: MainRoutes.CONTACT },
  { label: 'Terminy', route: MainRoutes.DATES },
  { label: '10-dniowy program', route: MainRoutes.DMB_10DAYSPROGRAMME },
  { label: 'Wspólnota', route: MainRoutes.HOUSING_COMMUNITY },
  { label: 'Wspólnota - właściciele', route: MainRoutes.HC_MEMBERS },
  { label: 'Wspólnota - lokale', route: MainRoutes.HC_UNITS },
  { label: 'JPK', route: MainRoutes.JPK },
  { label: 'Śledzenie przesyłek', route: MainRoutes.PACKAGE_TRACKER },
  { label: 'Komornik - plan podziału', route: MainRoutes.KOMORNIK_PLAN_PODZIALU },
  { label: 'KuMamyBiznes', route: MainRoutes.KUMAMYBIZNES },
];
