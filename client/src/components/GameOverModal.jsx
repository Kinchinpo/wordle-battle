// client/src/components/GameOverModal.jsx
import React from "react";
import sakuraSvg from "../assets/sakura.svg";
import catLaughSvg from "../assets/CatLaugh-4x.svg";

function GameOverModal({ 
    isWin, solution, onRematch, isWaiting, onExit, 
    isMatchOver, gameMode, currentRound, totalRounds, myScore, opponentScore 
}) {

  let title = "";
  if (gameMode === "SINGLE") {
      title = isWin ? "YOU WON!" : "YOU LOST!";
  } else {
      if (isMatchOver) {
          title = isWin ? "🏆 CHAMPION! 🏆" : "DEFEAT...";
      } else {
          title = isWin ? "ROUND WON!" : "ROUND LOST!";
      }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-600 shadow-2xl text-center max-w-sm w-full transform transition-all scale-100 animate-[scaleIn_0.3s_ease-out]">
        
        <div className="mb-4 flex justify-center select-none">
           {isWin ? (
             <img src={sakuraSvg} alt="Victory" className="w-24 h-24 animate-bounce filter drop-shadow-[0_0_10px_rgba(255,209,220,0.8)]" />
           ) : (
             <img src={catLaughSvg} alt="Defeat" className="w-24 h-24 filter opacity-90" />
           )}
        </div>
        
        <h2 className={`text-3xl font-black mb-2 uppercase tracking-wider ${isWin ? "text-[#ffd1dc]" : "text-gray-400"}`}>
          {title}
        </h2>

        {gameMode === "VERSUS" && (
            <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-gray-700">
                <div className="text-gray-400 text-xs font-bold uppercase mb-1">
                    {isMatchOver ? "FINAL SCORE" : `SCORE AFTER ROUND ${currentRound}`}
                </div>
                <div className="flex justify-center items-center gap-4 text-2xl font-black text-white">
                    <span className={isWin ? "text-[#ffd1dc]" : ""}>{myScore}</span>
                    <span className="text-gray-600">-</span>
                    <span className={!isWin ? "text-[#ffd1dc]" : ""}>{opponentScore}</span>
                </div>
            </div>
        )}
        
        <p className="text-gray-400 text-sm mb-6">
          Answer: <span className="text-white font-bold text-xl ml-2 tracking-widest">{solution}</span>
        </p>

        <div className="flex flex-col gap-3">
            {/* LOGIC NÚT BẤM MỚI */}
            
            {/* 1. Nếu chưa hết giải (Round Over) hoặc chơi đơn -> Hiện nút Chơi tiếp */}
            {(!isMatchOver || gameMode === "SINGLE") && (
                <button
                  onClick={onRematch}
                  disabled={isWaiting}
                  className={`
                    w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2
                    ${isWaiting 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                      : "bg-[#ffd1dc] text-gray-900 hover:bg-[#ffb7c5] shadow-[0_0_20px_rgba(255,209,220,0.3)]"}
                  `}
                >
                  {isWaiting 
                    ? "Waiting for opponent..." 
                    : (gameMode === "SINGLE" ? "RESTART GAME ↻" : "CONTINUE ➝")
                  }
                </button>
            )}

            {/* 2. Nếu HẾT GIẢI (Match Over) -> Chỉ hiện nút Về Menu */}
            <button
              onClick={onExit}
              className={`
                w-full py-3 rounded-xl font-bold text-lg border active:scale-95
                ${isMatchOver && gameMode === "VERSUS" 
                   ? "bg-[#ffd1dc] text-gray-900 hover:bg-[#ffb7c5] border-transparent shadow-[0_0_15px_rgba(255,209,220,0.5)]" // Nổi bật nếu là nút duy nhất
                   : "bg-gray-700 text-white hover:bg-gray-600 border-gray-500"} // Bình thường
              `}
            >
              {isMatchOver && gameMode === "VERSUS" ? "END MATCH 🤍" : "BACK TO MENU 🏠"}
            </button>
        </div>

      </div>
    </div>
  );
}

export default GameOverModal;