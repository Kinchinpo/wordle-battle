// client/src/components/MiniBoard.jsx
import React from "react";

function MiniBoard({ colors }) {
  const getColorClass = (status) => {
    if (status === "correct") return "bg-[#ffd1dc]"; // Hồng
    if (status === "present") return "bg-[#C1D5F0]"; // Xanh
    if (status === "absent") return "bg-gray-600";
    return "bg-gray-700/50"; // Màu nền mặc định cho ô chưa nhập (nhạt hơn chút)
  };

  // Hàm render ra một nhóm 3 hàng (Cột)
  const renderColumn = (rows) => (
    <div className="grid grid-rows-3 gap-1">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-1">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[1px] ${getColorClass(color)}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    // Flex row để xếp 2 cột nằm cạnh nhau
    <div className="flex gap-2 p-1 bg-gray-900/50 rounded border border-gray-700">
      {/* Cột 1: Hàng 0, 1, 2 */}
      {renderColumn(colors.slice(0, 3))}
      
      {/* Đường kẻ mờ ngăn cách 2 cột (Option) */}
      <div className="w-[1px] bg-gray-600 opacity-50"></div>

      {/* Cột 2: Hàng 3, 4, 5 */}
      {renderColumn(colors.slice(3, 6))}
    </div>
  );
}

export default MiniBoard;