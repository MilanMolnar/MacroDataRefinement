import React from "react";

const AnimationStyles: React.FC = () => (
  <style>{`
    /* Fade-in for the overall application */
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    
    /* Spawn animation: scales from 0 to 1 and fades in */
    @keyframes spawnScale {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    
    /* Wobble animation: translation & rotation */
    @keyframes slowWobble {
      0%   { transform: translate(0px, 0px) rotate(0deg); }
      25%  { transform: translate(2px, -2px) rotate(0.4deg); }
      50%  { transform: translate(-2px, 2px) rotate(-0.4deg); }
      75%  { transform: translate(2px, -2px) rotate(0.4deg); }
      100% { transform: translate(0px, 0px) rotate(0deg); }
    }
    
    /* Simplified fly animation from 0% to 100% along the offset-path */
    @keyframes fly {

    
      from { offset-distance: 0%; }
      to { offset-distance: 100%; }
    }
    @keyframes pulsateRed {
      0% {
        transform: scale(1);
        color: inherit;
      }
      50% {
        transform: scale(1.1);
        color: red;
      }
      100% {
        transform: scale(1);
        color: inherit;
      }
    }

    .cellPulsateRed {
      animation: pulsateRed 1s ease-in-out;
    }
        
    /* Once spawn is complete and if visible, the cell wobbles continuously */
    .cellAnimate {
      animation-name: slowWobble;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      display: inline-block;
    }
    
    /* Outer wrapper for hover scaling */
    .cellScale {
      transition: transform 0.3s ease-out;
      display: inline-block;
    }
    .cellScaleNormal { transform: scale(1); }
    .cellScaleOrth   { transform: scale(1.7); }
    .cellScaleDiag   { transform: scale(1.4); }
    .cellScaleHover  { transform: scale(2.2); }
  `}</style>
);

export default AnimationStyles;
