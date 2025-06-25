import { useState } from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <h1 className="header-title">LOREM IPSUM</h1>
      <div className="user-bubble-wrapper">
        <div className="user-bubble">
          <div className="user-info">
            <div className="user-name">Nanda Pratama</div>
            <div className="user-role">Officer 3 Sales Operation</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;