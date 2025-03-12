import React, { useEffect } from "react";
import FooterBox from "./FooterBox";
import { ShapeType } from "../Grid/shapeDefinitions";

interface FooterBarProps {
  progress: Record<ShapeType, number>;
  openBox: number | null;
  setOpenBox: React.Dispatch<React.SetStateAction<number | null>>;
  footerBoxRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const keyMap: Record<string, number> = {
  a: 1,
  s: 2,
  d: 3,
  f: 4,
  g: 5,
};

const FooterBar: React.FC<FooterBarProps> = ({
  progress,
  openBox,
  setOpenBox,
  footerBoxRefs,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        const boxNumber = keyMap[key];
        setOpenBox((prev) => (prev === boxNumber ? null : boxNumber));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpenBox]);

  return (
    <div
      style={{
        position: "relative",
        paddingTop: 10,
        zIndex: 11000, // High z-index so that footer boxes appear above flying numbers
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0",
          zIndex: 11000,
        }}>
        {([1, 2, 3, 4, 5] as number[]).map((num) => {
          const types: ShapeType[] = ["plus", "L", "T", "rectangle", "hline"];
          return (
            <FooterBox
              key={num}
              label={num}
              percentage={`${progress[types[num - 1]]}%`}
              open={openBox === num}
              ref={(el: any) => {
                footerBoxRefs.current[num - 1] = el;
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FooterBar;
