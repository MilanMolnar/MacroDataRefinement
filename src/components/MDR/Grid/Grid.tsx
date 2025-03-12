import React, { useEffect, useMemo, useRef, useState } from "react";
import GridCell, { CellData } from "./GridCell";
import { shapeDefinitions, ShapeType } from "./shapeDefinitions";
import hoverSound from "../../../assets/sounds/hover.mp3"; // Replace with your hover sound file's path
import CustomAlert from "../../common/CustomAlert";

export interface Shape {
  id: number;
  type: ShapeType;
  positions: { row: number; col: number }[];
  selected: boolean;
  completed: boolean;
  visited: Set<string>;
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export interface FlyDigit {
  id: string;
  digit: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface GridProps {
  shapePerType: number;
  containerWidth: number;
  containerHeight: number;
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  rowGap: number;
  colGap: number;
  msToHelp: number;
  onShapeCompleted: (shapeType: ShapeType) => void;
  openFooterBox: number | null;
  targetFooterBoxRect: DOMRect | null;
  onAnimationStart: (flyDigits: FlyDigit[], shapeId: number) => void;
  refreshCompletedShapeId: number | null; // ID of shape whose cells should refresh
  onShapeRefreshed: () => void; // Callback after refresh is done
}

const Grid: React.FC<GridProps> = ({
  shapePerType,
  containerWidth,
  containerHeight,
  rows,
  cols,
  cellWidth,
  cellHeight,
  rowGap,
  colGap,
  msToHelp,
  onShapeCompleted,
  openFooterBox,
  targetFooterBoxRect,
  onAnimationStart,
  refreshCompletedShapeId,
  onShapeRefreshed,
}) => {
  // (1) Create grid data once.
  const initialGridData = useMemo(() => {
    const arr: CellData[][] = [];
    for (let r = 0; r < rows; r++) {
      const rowArr: CellData[] = [];
      for (let c = 0; c < cols; c++) {
        rowArr.push({
          digit: Math.floor(Math.random() * 10),
          duration: randomInRange(4, 8),
          delay: randomInRange(0, 3),
          spawnDuration: randomInRange(1, 4),
          spawnDelay: randomInRange(0.5, 3.5),
          shapeId: undefined,
        });
      }
      arr.push(rowArr);
    }
    return arr;
  }, [rows, cols]);

  const [gridData, setGridData] = useState<CellData[][]>(initialGridData);
  const [pulse, setPulse] = useState(false);
  const [showNoShapeAlert, setShowNoShapeAlert] = useState(false);
  const [showWrongContainerAlert, setShowWrongContainerAlert] = useState(false);

  useEffect(() => {
    if (openFooterBox !== null) {
      const intervalId = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 1500); // pulse lasts 1.5 seconds
      }, msToHelp);
      return () => clearInterval(intervalId);
    } else {
      setPulse(false);
    }
  }, [openFooterBox, msToHelp]);

  // Generate shapePerType copies for each shape definition.
  const initialShapes = useMemo<Shape[]>(() => {
    const placedShapes: Shape[] = [];
    let shapeIdCounter = 1;
    shapeDefinitions.forEach((def) => {
      for (let i = 0; i < shapePerType; i++) {
        let placed = false;
        const maxRowOffset = Math.max(...def.offsets.map((o) => o.row));
        const maxColOffset = Math.max(...def.offsets.map((o) => o.col));
        const shapeHeight = maxRowOffset + 2;
        const shapeWidth = maxColOffset + 2;
        // Increase the number of attempts to 500 so more placements are possible
        let attempt;
        for (attempt = 0; attempt < 500 && !placed; attempt++) {
          const startRow = Math.floor(randomInRange(0, rows - shapeHeight + 1));
          const startCol = Math.floor(randomInRange(0, cols - shapeWidth + 1));
          const positions = def.offsets.map((o) => ({
            row: startRow + o.row,
            col: startCol + o.col,
          }));
          const withinBounds = positions.every(
            (pos) =>
              pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols
          );
          const overlapping = positions.some(
            (pos) => initialGridData[pos.row][pos.col].shapeId !== undefined
          );
          if (withinBounds && !overlapping) {
            positions.forEach((pos) => {
              initialGridData[pos.row][pos.col].shapeId = shapeIdCounter;
            });
            placedShapes.push({
              id: shapeIdCounter,
              type: def.type,
              positions,
              selected: false,
              completed: false,
              visited: new Set<string>(),
            });
            shapeIdCounter++;
            placed = true;
          }
        }
        if (!placed) {
          console.warn(
            `Could not place shape type '${def.type}' instance ${
              i + 1
            } after ${attempt} attempts.`
          );
        }
      }
    });
    return placedShapes;
  }, [initialGridData, rows, cols, shapePerType]);

  // **New useEffect** to update shapes state when initialShapes changes:
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  useEffect(() => {
    setShapes(initialShapes);
  }, [initialShapes]);
  const [qKeyLock, setQKeyLock] = useState(false);
  // (2) Pan/Zoom state.
  const gridRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const gridNaturalWidth = cols * cellWidth + (cols - 1) * colGap;
  const gridNaturalHeight = rows * cellHeight + (rows - 1) * rowGap;
  const minScale = Math.max(
    containerWidth / gridNaturalWidth,
    containerHeight / gridNaturalHeight
  );
  const maxScale = 5;

  function clampOffset(x: number, y: number, currentScale: number) {
    const scaledWidth = gridNaturalWidth * currentScale;
    const scaledHeight = gridNaturalHeight * currentScale;
    let clampedX = x;
    let clampedY = y;
    if (scaledWidth >= containerWidth) {
      const minX = containerWidth - scaledWidth;
      const maxX = 0;
      if (clampedX < minX) clampedX = minX;
      if (clampedX > maxX) clampedX = maxX;
    } else {
      clampedX = (containerWidth - scaledWidth) / 2;
    }
    if (scaledHeight >= containerHeight) {
      const minY = containerHeight - scaledHeight;
      const maxY = 0;
      if (clampedY < minY) clampedY = minY;
      if (clampedY > maxY) clampedY = maxY;
    } else {
      clampedY = (containerHeight - scaledHeight) / 2;
    }
    return { x: clampedX, y: clampedY };
  }

  useEffect(() => {
    const { x, y } = clampOffset(offsetX, offsetY, scale);
    if (x !== offsetX || y !== offsetY) {
      setOffsetX(x);
      setOffsetY(y);
    }
  }, [scale, offsetX, offsetY]);

  useEffect(() => {
    gridRef.current?.focus();
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomSpeed = 0.001;
    let newScale = scale - e.deltaY * zoomSpeed;
    newScale = Math.max(minScale, Math.min(newScale, maxScale));
    const oldWorldX = (mouseX - offsetX) / scale;
    const oldWorldY = (mouseY - offsetY) / scale;
    setScale(newScale);
    const newOffsetX = mouseX - oldWorldX * newScale;
    const newOffsetY = mouseY - oldWorldY * newScale;
    const { x: cx, y: cy } = clampOffset(newOffsetX, newOffsetY, newScale);
    setOffsetX(cx);
    setOffsetY(cy);
  };

  // (3) Hover/Selection logic.
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const gridX = (mouseX - offsetX) / scale;
    const gridY = (mouseY - offsetY) / scale;
    const col = Math.floor(gridX / (cellWidth + colGap));
    const row = Math.floor(gridY / (cellHeight + rowGap));
    setHoveredCell([row, col]);
    const cell = gridData[row]?.[col];
    if (cell && cell.shapeId) {
      const targetShapeId = cell.shapeId;
      // Update the shape's visited cells.
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          if (shape.id === targetShapeId) {
            const cellKey = `${row}-${col}`;
            // Play hover sound only if this cell is being visited for the first time.
            if (!shape.visited.has(cellKey)) {
              const audio = new Audio(hoverSound);
              audio.volume = 0.15;
              audio.play().catch(() => {});
            }
            const newVisited = new Set(shape.visited);
            newVisited.add(cellKey);
            return { ...shape, selected: true, visited: newVisited };
          }
          return { ...shape, selected: false, visited: new Set() };
        })
      );
    } else {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => ({
          ...shape,
          selected: false,
          visited: new Set(),
        }))
      );
    }
  };
  const handleGridMouseLeave = () => {
    setHoveredCell(null);
    setShapes((prevShapes) =>
      prevShapes.map((shape) => ({
        ...shape,
        selected: false,
        visited: new Set(),
      }))
    );
  };

  const getScaleClass = (r: number, c: number): string => {
    const cell = gridData[r][c];
    if (cell.shapeId) {
      const shape = shapes.find((s) => s.id === cell.shapeId);
      if (shape && shape.selected) return "cellScaleHover";
    }
    if (hoveredCell) {
      const [hr, hc] = hoveredCell;
      if (r === hr && c === hc) return "cellScaleHover";
      const rowDiff = Math.abs(r - hr);
      const colDiff = Math.abs(c - hc);
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))
        return "cellScaleOrth";
      if (rowDiff === 1 && colDiff === 1) return "cellScaleDiag";
    }
    return "cellScaleNormal";
  };

  const shapeToBoxMap: Record<ShapeType, number> = {
    plus: 1,
    L: 2,
    T: 3,
    rectangle: 4,
    hline: 5,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const panSpeed = 50;
    let dX = 0,
      dY = 0;

    // In your handleKeyDown:
    if (e.key.toLowerCase() === "q") {
      // If the Q key is locked, ignore further presses.
      if (qKeyLock) return;

      // Lock the Q key for 2 seconds.
      setQKeyLock(true);

      if (!hoveredCell) {
        setShowNoShapeAlert(true);
        setTimeout(() => {
          setShowNoShapeAlert(false);
          setQKeyLock(false);
        }, 2000);
        return;
      }
      const [row, col] = hoveredCell;
      const cell = gridData[row]?.[col];
      if (!cell || !cell.shapeId) {
        setShowNoShapeAlert(true);
        setTimeout(() => {
          setShowNoShapeAlert(false);
          setQKeyLock(false);
        }, 2000);
        return;
      }
      const hoveredShape = shapes.find((s) => s.id === cell.shapeId);
      if (!hoveredShape) {
        setShowNoShapeAlert(true);
        setTimeout(() => {
          setShowNoShapeAlert(false);
          setQKeyLock(false);
        }, 2000);
        return;
      }
      const boxToOpen = shapeToBoxMap[hoveredShape.type];
      // Dispatch a custom event so the parent can react and open the correct FooterBox.
      const event = new CustomEvent("openFooterBox", {
        detail: { box: boxToOpen },
      });
      window.dispatchEvent(event);
      // Release the lock after the animation.
      setTimeout(() => setQKeyLock(false), 2000);
      return;
    }
    if (e.key === "ArrowLeft") dX = panSpeed;
    else if (e.key === "ArrowRight") dX = -panSpeed;
    else if (e.key === "ArrowUp") dY = panSpeed;
    else if (e.key === "ArrowDown") dY = -panSpeed;
    else if (e.key === " ") {
      const focusedShape = shapes.find((shape) => shape.selected);
      if (
        focusedShape &&
        focusedShape.visited.size === focusedShape.positions.length
      ) {
        const requiredBox = shapeToBoxMap[focusedShape.type];
        if (openFooterBox !== requiredBox) {
          setShowWrongContainerAlert(true);
          setTimeout(() => setShowWrongContainerAlert(false), 2000);
          return;
        }
        if (!gridRef.current || !targetFooterBoxRect) return;
        const flyDigits: FlyDigit[] = focusedShape.positions.map((pos, idx) => {
          const cellLeft = pos.col * (cellWidth + colGap);
          const cellTop = pos.row * (cellHeight + rowGap);
          const gridRect = gridRef.current!.getBoundingClientRect();
          const startX = gridRect.left + offsetX + cellLeft * scale;
          const startY = gridRect.top + offsetY + cellTop * scale;
          const targetX =
            targetFooterBoxRect.left +
            targetFooterBoxRect.width / 2 -
            cellWidth / 2;
          const targetY =
            targetFooterBoxRect.top +
            targetFooterBoxRect.height / 2 -
            cellHeight / 2;
          return {
            id: `${focusedShape.id}-${idx}`,
            digit: gridData[pos.row][pos.col].digit!,
            startX,
            startY,
            targetX,
            targetY,
          };
        });
        setShapes((prev) =>
          prev.map((shape) =>
            shape.id === focusedShape.id ? { ...shape, completed: true } : shape
          )
        );
        onShapeCompleted(focusedShape.type);
        onAnimationStart(flyDigits, focusedShape.id);
      }
    }
    if (dX || dY) {
      e.preventDefault();
      const newOffsetX = offsetX + dX;
      const newOffsetY = offsetY + dY;
      const { x: cx, y: cy } = clampOffset(newOffsetX, newOffsetY, scale);
      setOffsetX(cx);
      setOffsetY(cy);
    }
  };

  // (4) Refresh only the cells of the completed shape.
  useEffect(() => {
    if (refreshCompletedShapeId !== null) {
      const completedShape = shapes.find(
        (shape) => shape.id === refreshCompletedShapeId
      );
      if (completedShape) {
        setGridData((prevGridData) => {
          const newGridData = [...prevGridData];
          completedShape.positions.forEach(({ row, col }) => {
            newGridData[row] = [...newGridData[row]];
            newGridData[row][col] = {
              ...newGridData[row][col],
              digit: Math.floor(Math.random() * 10),
              spawnDuration: randomInRange(1, 4),
              spawnDelay: randomInRange(0, 1),
              shapeId: undefined, // Remove association with the shape.
            };
          });
          return newGridData;
        });
        setShapes((prevShapes) =>
          prevShapes.filter((shape) => shape.id !== refreshCompletedShapeId)
        );
      }
      onShapeRefreshed();
    }
  }, [refreshCompletedShapeId, shapes, onShapeRefreshed]);

  return (
    <div
      ref={gridRef}
      onWheel={handleWheel}
      onMouseMove={handleGridMouseMove}
      onMouseEnter={() => gridRef.current?.focus()} // Focus grid on hover
      onMouseLeave={handleGridMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "5aspx",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        outline: "none",
      }}>
      <div
        style={{
          position: "absolute",
          userSelect: "none",
          top: 0,
          left: 0,
          transition: "transform 0.2s ease-out",
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: "0 0",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, auto)`,
          gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
          rowGap: `${rowGap}px`,
          columnGap: `${colGap}px`,
        }}>
        {gridData.map((rowData, rIndex) =>
          rowData.map((cell, cIndex) => {
            const shapeForCell =
              cell.shapeId && shapes.find((s) => s.id === cell.shapeId);
            const hideDigit = shapeForCell && shapeForCell.completed;
            const baseScaleClass = getScaleClass(rIndex, cIndex);
            const pulsateClass =
              shapeForCell &&
              openFooterBox === shapeToBoxMap[shapeForCell.type] &&
              pulse
                ? "cellPulsateRed"
                : "";
            const finalScaleClass = `${baseScaleClass} ${pulsateClass}`.trim();
            return (
              <GridCell
                key={`${rIndex}-${cIndex}`}
                cellData={cell}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                scaleClass={finalScaleClass}
                visible={!hideDigit}
                onHover={() => {}}
                isStatic={shapeForCell ? shapeForCell.selected : false}
                isVisited={
                  shapeForCell
                    ? shapeForCell.visited.has(`${rIndex}-${cIndex}`)
                    : false
                }
              />
            );
          })
        )}
      </div>
      {showNoShapeAlert && (
        <CustomAlert message="Please hover the cursor over data that needs to be refined." />
      )}
      {showWrongContainerAlert && (
        <CustomAlert message="Incorrect storage unit is open." />
      )}
    </div>
  );
};

export default Grid;
