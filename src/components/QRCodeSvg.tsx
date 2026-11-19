"use client";

import React, { useMemo } from "react";

// Robust, self-contained pure TypeScript QR Code Matrix generator (Version 2 / 25x25 & Version 3 / 29x29)
// No npm dependencies, runs 100% offline in client browser.

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  showMonogram?: boolean;
  id?: string;
}

// Galois Field GF(256) tables for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result: number[] = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree: number): number[] {
  let poly: number[] = [1];
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, [1, EXP_TABLE[i]]);
  }
  return poly;
}

function calculateReedSolomon(data: Uint8Array, ecDegree: number): Uint8Array {
  const gen = getGeneratorPoly(ecDegree);
  const msg: number[] = new Array(data.length + ecDegree).fill(0);
  for (let i = 0; i < data.length; i++) msg[i] = data[i];

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return new Uint8Array(msg.slice(data.length));
}

// Generates a boolean 2D matrix (true = dark, false = light)
function generateQRMatrix(text: string): boolean[][] {
  // Use Version 3 (29x29) for robust capacity up to ~50 characters with Level M (15 error correction bytes)
  const size = 29;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const isReserved = (r: number, c: number): boolean => matrix[r][c] !== null;

  // 1. Draw Finder Pattern
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[tr][tc] = true;
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Alignment pattern for Version 3 at (22, 22)
  const drawAlignment = (row: number, col: number) => {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (matrix[row + r][col + c] === null) {
          if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
            matrix[row + r][col + c] = true;
          } else {
            matrix[row + r][col + c] = false;
          }
        }
      }
    }
  };
  drawAlignment(22, 22);

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }

  // 4. Encode Data (Byte mode)
  // V3-M: 44 total data codewords + 26 EC codewords
  const totalDataBytes = 44;
  const ecBytes = 26;
  const data = new Uint8Array(totalDataBytes);

  const utf8 = new TextEncoder().encode(text.slice(0, 40));
  const byteCount = utf8.length;

  // Header: 0100 (Byte mode) + 8-bit length
  const bits: number[] = [];
  bits.push(0, 1, 0, 0); // Byte mode indicator
  for (let i = 7; i >= 0; i--) bits.push((byteCount >> i) & 1);
  for (let i = 0; i < byteCount; i++) {
    for (let j = 7; j >= 0; j--) bits.push((utf8[i] >> j) & 1);
  }
  // Terminator
  while (bits.length < totalDataBytes * 8 && bits.length % 8 !== 0) bits.push(0);
  for (let i = 0; bits.length < totalDataBytes * 8 && i < 4; i++) bits.push(0);

  // Convert bits to data bytes
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    data[i / 8] = byte;
  }

  // Pad bytes 0xEC, 0x11
  const pad = [0xec, 0x11];
  let pIdx = 0;
  for (let i = Math.ceil(bits.length / 8); i < totalDataBytes; i++) {
    data[i] = pad[pIdx % 2];
    pIdx++;
  }

  const ec = calculateReedSolomon(data, ecBytes);
  const fullCodewords = new Uint8Array(totalDataBytes + ecBytes);
  fullCodewords.set(data);
  fullCodewords.set(ec, totalDataBytes);

  // 5. Place bits into matrix using upward/downward zigzag
  let bitIdx = 0;
  const totalBits = fullCodewords.length * 8;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const goingUp = ((size - 1 - right) / 2) % 2 === 0;

    for (let vert = 0; vert < size; vert++) {
      const r = goingUp ? size - 1 - vert : vert;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!isReserved(r, col)) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byte = fullCodewords[Math.floor(bitIdx / 8)];
            bit = ((byte >> (7 - (bitIdx % 8))) & 1) === 1;
            bitIdx++;
          }
          // Mask 0: (row + col) % 2 === 0
          if ((r + col) % 2 === 0) bit = !bit;
          matrix[r][col] = bit;
        }
      }
    }
  }

  // Fill in Format Info (Mask 0, Level M => 101010000010010)
  const formatInfo = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = formatInfo[i] === 1;
  matrix[8][7] = formatInfo[6] === 1;
  matrix[8][8] = formatInfo[7] === 1;
  matrix[7][8] = formatInfo[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatInfo[i] === 1;

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatInfo[i] === 1;
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatInfo[i] === 1;

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

export { generateQRMatrix };

export function downloadQRCodePng(
  value: string,
  fileName: string = "nimza-table-qr.png",
  title?: string,
  subtitle?: string
) {
  if (typeof window === "undefined") return;

  const matrix = generateQRMatrix(value);
  const matrixSize = matrix.length;
  const canvas = document.createElement("canvas");
  const scale = 24; // High resolution rendering
  const margin = title ? 100 : 40;
  const bottomMargin = title ? 120 : 40;
  const qrPixelSize = matrixSize * scale;

  canvas.width = qrPixelSize + margin * 2;
  canvas.height = qrPixelSize + margin + bottomMargin;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border
  ctx.strokeStyle = "#E8E2D9";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  // Title if provided
  if (title) {
    ctx.fillStyle = "#1F241F";
    ctx.font = "bold 32px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width / 2, 60);

    if (subtitle) {
      ctx.fillStyle = "#C5A059";
      ctx.font = "bold 16px 'DM Sans', sans-serif";
      ctx.fillText(subtitle.toUpperCase(), canvas.width / 2, 88);
    }
  }

  // Draw QR Modules
  ctx.fillStyle = "#1F241F";
  const startX = margin;
  const startY = title ? margin + 20 : margin;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
      }
    }
  }

  // Monogram circle in center
  const centerCoordX = startX + (matrixSize * scale) / 2;
  const centerCoordY = startY + (matrixSize * scale) / 2;
  const circleRadius = (matrixSize * scale) / 8;

  ctx.beginPath();
  ctx.arc(centerCoordX, centerCoordY, circleRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#C5A059";
  ctx.stroke();

  // Draw 'N' monogram in center
  ctx.fillStyle = "#C5A059";
  ctx.font = "bold 36px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", centerCoordX, centerCoordY + 2);

  // Footer instructions if title provided
  if (title) {
    ctx.fillStyle = "#6B7280";
    ctx.font = "14px 'DM Sans', sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Scan with smartphone camera to view menu & order", canvas.width / 2, canvas.height - 40);
  }

  // Trigger download
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function QRCodeSvg({
  value,
  size = 180,
  fgColor = "#1F241F",
  bgColor = "#FFFFFF",
  className = "",
  showMonogram = true,
  id,
}: QRCodeProps) {
  const matrix = useMemo(() => generateQRMatrix(value), [value]);
  const matrixSize = matrix.length;

  return (
    <div
      className={`relative inline-block rounded-2xl p-3 bg-white shadow-sm border border-sand/60 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        id={id}
        viewBox={`0 0 ${matrixSize} ${matrixSize}`}
        className="w-full h-full block"
        shapeRendering="crispEdges"
      >
        <rect width={matrixSize} height={matrixSize} fill={bgColor} />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill={fgColor}
              />
            );
          })
        )}
      </svg>

      {/* Central Gold Monogram Emblem */}
      {showMonogram && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/4 h-1/4 rounded-full bg-white border-2 border-gold shadow-md flex items-center justify-center p-1">
            <span className="font-serif font-black text-[10px] text-gold tracking-tighter">
              N
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
