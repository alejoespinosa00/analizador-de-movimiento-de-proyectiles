import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className={
          isHome
            ? 'relative w-full flex-1 overflow-hidden px-5 py-6 md:px-12'
            : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
