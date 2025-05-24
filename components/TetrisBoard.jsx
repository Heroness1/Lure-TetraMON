"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ROWS,
  COLS,
  VISIBLE_ROWS,
  emptyGrid,
  checkCollision,
  placeTetromino,
  clearRows,
} from "./gridUtils";
import { runExplosions } from "./explosionUtils";
import "./explode.css";

// TETROMINOS shapes dan warna
const TETROMINOS = {
  I: {
    shape: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
    ],
    color: "cyan",
  },
  O: { shape: [[[1, 1], [1, 1]]], color: "yellow" },
  T: {
    shape: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    color: "purple",
  },
  S: {
    shape: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
    ],
    color: "green",
  },
  Z: {
    shape: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
    color: "red",
  },
  J: {
    shape: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
    color: "orange",
  },
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOS[rand], name: rand };
};

// --- Farcaster embed component ---
const FarcasterEmbed = ({ url }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.frame && containerRef.current) {
      window.frame.sdk.actions.embed(url, containerRef.current);
    }
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 500,
        marginTop: 20,
        border: "2px solid #0ff",
        borderRadius: 8,
      }}
    />
  );
};

export default function TetrisBoard() {
  const [grid, setGrid] = useState(emptyGrid());
  const [current, setCurrent] = useState({
    tetromino: randomTetromino(),
    rotation: 0,
    position: { x: 3, y: 0 },
  });
  const [score, setScore] = useState(0);
  const scoreRef = useRef(score);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("tetris-high-score", score.toString());
    }
  }, [score, highScore]);

  const tick = () => {
    if (gameOver) return;
    const { x, y } = current.position;

    if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);
      const { newGrid: clearedGrid, cleared } = clearRows(newGrid);

      if (cleared > 0) {
        const points = cleared * 100;
        setScore((prev) => {
          scoreRef.current = prev + points;
          return prev + points;
        });
      }

      let finalGrid = clearedGrid;
      if (cleared > 0) {
        const result = runExplosions(clearedGrid);
        finalGrid = result.finalGrid;
        if (result.totalScore > 0) {
          setScore((prev) => {
            scoreRef.current = prev + result.totalScore;
            return prev + result.totalScore;
          });
        }
      }
      setGrid(finalGrid);

      const next = randomTetromino();
      const startPos = {
        x: Math.floor(COLS / 2) - 2,
        y: ROWS - VISIBLE_ROWS - 2,
      };

      if (checkCollision(newGrid, next, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: startPos });
      }
    }
  };

  useEffect(() => {
    if (gameOver) return;
    intervalRef.current = setInterval(tick, 700);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver, grid]);

  const handleControl = (direction) => {
    if (gameOver) return;

    const { x, y } = current.position;
    let rotation = current.rotation;

    switch (direction) {
      case "left":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x - 1, y })) {
          setCurrent((c) => ({ ...c, position: { x: x - 1, y } }));
        }
        break;
      case "right":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x + 1, y })) {
          setCurrent((c) => ({ ...c, position: { x: x + 1, y } }));
        }
        break;
      case "down":
        if (!checkCollision(grid, current.tetromino, rotation, { x, y: y + 1 })) {
          setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
        }
        break;
      case "rotate":
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(grid, current.tetromino, nextRotation, { x, y })) {
          setCurrent((c) => ({ ...c, rotation: nextRotation }));
        }
        break;
      default:
        break;
    }
  };

  const restart = () => {
    setGrid(emptyGrid());
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setCurrent({ tetromino: randomTetromino(), rotation: 0, position: { x: 3, y: 0 } });
  };

  const btnStyle = {
    backgroundColor: "#333",
    border: "2px solid #0ff",
    borderRadius: 6,
    padding: "8px 12px",
    color: "white",
    fontWeight: "bold",
    fontFamily: "monospace",
    cursor: "pointer",
    minWidth: 60,
  };

  const renderGrid = () => {
    const visibleGrid = grid.slice(ROWS - VISIBLE_ROWS);
    const display = visibleGrid.map((row) => [...row]);
    const { x, y } = current.position;
    const visibleY = y - (ROWS - VISIBLE_ROWS);

    current.tetromino.shape[current.rotation].forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = visibleY + dy;
          const newX = x + dx;
          if (newY >= 0 && newY < VISIBLE_ROWS && newX >= 0 && newX < COLS) {
            display[newY][newX] = { color: current.tetromino.color };
          }
        }
      });
    });

    return display.map((row, yIdx) => (
  <div key={yIdx} style={{ display: "flex" }}>
    {row.map((cell, xIdx) => (
      <div
        key={xIdx}
        style={{
          width: 25,
          height: 25,
          border: "1px solid #222",
          backgroundColor: cell
            ? typeof cell === "object"
              ? cell.color
              : "#555"
            : "#111",
        }}
      />
    ))}
  </div>
));

  return (
    <div style={{ color: "white", fontFamily: "monospace", padding: 20, background: "#000", minHeight: "100vh" }}>
      <h2>Tetris with Farcaster Embed</h2>
      <div>{renderGrid()}</div>
      <div style={{ marginTop: 10 }}>
        <button style={btnStyle} onClick={() => handleControl("left")}>Left</button>
        <button style={btnStyle} onClick={() => handleControl("right")}>Right</button>
        <button style={btnStyle} onClick={() => handleControl("down")}>Down</button>
        <button style={btnStyle} onClick={() => handleControl("rotate")}>Rotate</button>
      </div>
      <div style={{ marginTop: 10 }}>
        <button style={btnStyle} onClick={restart}>Restart</button>
      </div>
      <div style={{ marginTop: 15 }}>
        <strong>Score:</strong> {score} &nbsp; <strong>High Score:</strong> {highScore}
      </div>
      {gameOver && (
        <div style={{ marginTop: 20, color: "red", fontWeight: "bold" }}>
          Game Over! Restart to play again.
        </div>
      )}

      {/* Farcaster embed */}
      <FarcasterEmbed url="https://warpcast.com/embed/farcaster" />
    </div>
  );
}
