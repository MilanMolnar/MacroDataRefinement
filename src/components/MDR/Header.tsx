import React from 'react';

interface HeaderProps {
  headerText: string;
  percentage: number;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ headerText, percentage, logoUrl }) => (
  <div
    style={{
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      flexShrink: 0
    }}
  >
    <div style={{ flex: 1 }}>{headerText}</div>
    <div style={{ marginRight: '10px' }}>{percentage}% Complete</div>
    {logoUrl && <img src={logoUrl} alt="Logo" style={{ height: '24px' }} />}
  </div>
);

export default Header;
