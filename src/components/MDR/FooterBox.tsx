import React, { forwardRef } from 'react';

interface FooterBoxProps {
  label: number;
  percentage: string;
  open: boolean;
}

const FooterBox = forwardRef<HTMLDivElement, FooterBoxProps>(
  ({ label, percentage, open }, ref) => {
    const doorTransition = 'transform 0.4s ease';
    const leftDoorStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100px',
      height: '3px',
      backgroundColor: 'white',
      transformOrigin: 'left center',
      transition: doorTransition,
      zIndex: 9999,
      transform: open ? 'rotate(-135deg)' : 'rotate(0deg)',
    };
    const rightDoorStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '3px',
      backgroundColor: 'white',
      transformOrigin: 'right center',
      transition: doorTransition,
      zIndex: 9999,
      transform: open ? 'rotate(135deg)' : 'rotate(0deg)',
    };

    return (
      <div
        ref={ref}
        style={{
          width: '16%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid white',
          position: 'relative',
          overflow: 'visible',
          zIndex: 10001,
          margin: '0 5px',
        }}
      >
        <div style={leftDoorStyle} />
        <div style={rightDoorStyle} />
        <div style={{ height: '20px' , zIndex: 10001}} />
        <div style={{ width: '100%', textAlign: 'center', borderBottom: '1px solid white', zIndex: 10001, }}>
          {label}
        </div>
        <div style={{ width: '100%', textAlign: 'left', paddingLeft: '5px', zIndex: 10001, }}>
          {percentage}
        </div>
      </div>
    );
  }
);

export default FooterBox;
