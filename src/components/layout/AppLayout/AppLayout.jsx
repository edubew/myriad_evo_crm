import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import './AppLayout.scss';

function AppLayout({ children }) {
  return (
    <div className='app-layout'>
      <Sidebar />
      <div className="app-layout__body">
        <Header />
        <main className='app=layout__content'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
