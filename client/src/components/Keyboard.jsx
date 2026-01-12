// client/src/components/Keyboard.jsx
import React from "react";
import { FaDeleteLeft } from "react-icons/fa6"; 
// Đã xóa import FaRibbon và GiSpermWhale

function Keyboard({ onKeyPress, onDelete, onEnter, keyStyles = {} }) {
  const keys1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  const keys2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  const keys3 = ["Z", "X", "C", "V", "B", "N", "M"];

  const getKeyColor = (status) => {
    if (status === "correct") return "bg-[#ffd1dc] text-black border-[#ffd1dc]";
    if (status === "present") return "bg-[#C1D5F0] text-black border-[#C1D5F0]";
    if (status === "absent") return "bg-gray-800 text-gray-500 border-gray-800";
    return "bg-gray-500 text-white hover:bg-gray-600 border-transparent";
  };

  const KeyButton = ({ val, big = false, onClick, displayVal }) => {
    const status = keyStyles[val];

    return (
      <button
        onClick={onClick}
        className={`
          relative
          h-14 rounded font-bold text-sm sm:text-base transition-all select-none active:scale-95
          ${big ? "flex-[1.5]" : "flex-1"} 
          mx-0.5 border
          ${getKeyColor(status)} 
        `}
      >
        {/* Đã xóa code hiển thị Icon Nơ và Cá voi ở đây */}
        
        {displayVal || val}
      </button>
    );
  };

  return (
    <div className="w-full max-w-[500px] p-2 mb-2">
      <div className="flex w-full mb-2">
        {keys1.map((key) => (
          <KeyButton key={key} val={key} onClick={() => onKeyPress(key)} />
        ))}
      </div>
      <div className="flex w-full mb-2 px-4">
        {keys2.map((key) => (
          <KeyButton key={key} val={key} onClick={() => onKeyPress(key)} />
        ))}
      </div>
      <div className="flex w-full">
        <button 
          onClick={onEnter}
          className="flex-[1.5] h-14 rounded font-bold text-sm sm:text-base mx-0.5 bg-gray-500 text-white hover:bg-gray-600 active:scale-95 transition-all border border-transparent"
        >
          ENTER
        </button>
        {keys3.map((key) => (
          <KeyButton key={key} val={key} onClick={() => onKeyPress(key)} />
        ))}
        <button 
           onClick={onDelete}
           className="flex-[1.5] h-14 rounded font-bold text-xl flex items-center justify-center mx-0.5 bg-gray-500 text-white hover:bg-gray-600 active:scale-95 transition-all border border-transparent"
        >
          <FaDeleteLeft />
        </button>
      </div>
    </div>
  );
}

export default Keyboard;