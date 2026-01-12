// client/src/components/Board.jsx
import React from "react";
// Import ảnh chiếc nơ
import pinkBowSvg from "../assets/pink_bow.svg";

function Board({ board, colors, currentRow, currentTile }) {
  const getColorClass = (status) => {
    if (status === "correct") return "bg-[#ffd1dc] border-[#ffd1dc] text-black";
    if (status === "present") return "bg-[#C1D5F0] border-[#C1D5F0] text-black";
    if (status === "absent") return "bg-gray-700 border-gray-700 text-white";
    return "border-gray-600 text-white";
  };

  return (
    <div className="w-full max-w-[350px] aspect-[5/6] grid grid-rows-6 gap-1.5 sm:gap-2">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {row.map((letter, tileIndex) => {
              const isActive = rowIndex === currentRow && tileIndex === currentTile;
              const colorStatus = colors[rowIndex][tileIndex];
              
              return (
                <div
                  key={tileIndex}
                  className={`
                    relative 
                    border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase select-none transition-all duration-300
                    rounded-sm sm:rounded
                    ${getColorClass(colorStatus)}
                    ${isActive ? "border-gray-400" : ""}
                    ${!letter && !isActive && "bg-transparent"}
                  `}
                >
                  {/* --- LOGIC HIỂN THỊ NƠ --- */}
                  {/* Chỉ hiện khi trạng thái là 'correct' (màu hồng) */}
                  {colorStatus === "correct" && (
                    <img 
                      src={pinkBowSvg} 
                      alt="bow"
                      // Căn chỉnh vị trí nơ: Góc trên cùng bên trái (hoặc phải tùy bạn chỉnh)
                      // -top-1 -left-1: Để nơ hơi chòi ra ngoài một chút cho dễ thương
                      // w-4 h-4: Kích thước nhỏ vừa phải
                      className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 z-10 drop-shadow-sm filter hue-rotate-0" 
                    />
                  )}
                  
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}

export default Board;