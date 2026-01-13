// client/src/components/GameOverModal.jsx
import React, { useEffect } from "react"; // Nhớ import useEffect
import sakuraSvg from "../assets/sakura.svg";
import catLaughSvg from "../assets/CatLaugh-4x.svg";

function GameOverModal({ 
    isWin, solution, onRematch, isWaiting, onExit, 
    isMatchOver, gameMode, currentRound, totalRounds, myScore, opponentScore 
}) {

  let title = "";
  let buttonText = "";
  let buttonAction = ""; 

  // Logic xác định hành động chính (như cũ)
  if (gameMode === "SPECIAL") {
      if (isWin) {
          if (currentRound >= totalRounds) {
              title = "✨ COMPLETED! ✨";
              buttonText = "SEE SPECIAL THING 🎁";
              buttonAction = "SPECIAL_THING";
          } else {
              title = "CORRECT!";
              buttonText = "NEXT ROUND ➝";
              buttonAction = "NEXT";
          }
      } else {
          title = "TRY AGAIN!";
          buttonText = "AGAIN ↻";
          buttonAction = "RETRY";
      }
  } 
  else if (gameMode === "SINGLE") {
      title = isWin ? "YOU WON!" : "YOU LOST!";
      buttonText = "NEW GAME ↻";
  } 
  else { // VERSUS
      if (isMatchOver) {
          title = isWin ? "🏆 CHAMPION! 🏆" : "DEFEAT...";
          buttonText = "FINISH & NEW ROOM 🏠";
      } else {
          title = isWin ? "ROUND WON!" : "ROUND LOST!";
          buttonText = "NEXT ROUND ➝";
      }
  }

  // --- MỚI: BẮT SỰ KIỆN ENTER ĐỂ CHƠI TIẾP ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isWaiting) {
            // Nếu là Versus Match Over thì Enter có thể là Exit hoặc không làm gì
            // Nhưng logic ở đây ưu tiên nút chính (onRematch)
            // Trừ khi Match Over -> Nút chính bị ẩn ở dưới -> ta gọi onExit
            
            if (isMatchOver && gameMode === "VERSUS") {
                onExit();
            } else {
                // Các trường hợp khác: Next Round, Retry, New Game...
                if (gameMode === "SPECIAL") onRematch(buttonAction);
                else onRematch();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWaiting, isMatchOver, gameMode, buttonAction, onRematch, onExit]);


  const showExitButton = !(gameMode === "SPECIAL" && isWin);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-600 shadow-2xl text-center max-w-sm w-full transform transition-all scale-100 animate-[scaleIn_0.3s_ease-out]">
        
        {/* Hình ảnh */}
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

        {/* Score Versus */}
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
          The word was: <span className="text-white font-bold text-xl ml-2 tracking-widest">{solution}</span>
        </p>

        <div className="flex flex-col gap-3">
            
            {/* Nút chính (Special) */}
            {gameMode === "SPECIAL" && (
               <button
                  onClick={() => onRematch(buttonAction)} 
                  disabled={isWaiting}
                  className={`
                    w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95
                    ${isWin && currentRound >= totalRounds 
                        ? "bg-purple-500 text-white hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.5)]" 
                        : "bg-[#ffd1dc] text-gray-900 hover:bg-[#ffb7c5]"}
                  `}
               >
                  {isWaiting ? "Processing..." : `${buttonText}`}
               </button>
            )}

            {/* Nút chính (Single/Versus) */}
            {gameMode !== "SPECIAL" && (!isMatchOver || gameMode === "SINGLE") && (
                <button
                  onClick={() => onRematch()}
                  disabled={isWaiting}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95 bg-[#ffd1dc] text-gray-900 hover:bg-[#ffb7c5]`}
                >
                  {isWaiting ? "Waiting..." : `${buttonText}`}
                </button>
            )}

            {/* Nút thoát */}
            {showExitButton && (
                <button
                onClick={onExit}
                className={`
                    w-full py-3 rounded-xl font-bold text-lg border active:scale-95
                    ${(isMatchOver && gameMode === "VERSUS") 
                    ? "bg-[#ffd1dc] text-gray-900 hover:bg-[#ffb7c5] border-transparent" 
                    : "bg-gray-700 text-white hover:bg-gray-600 border-gray-500"}
                `}
                >
                {(isMatchOver && gameMode === "VERSUS") ? "FINISH & NEW ROOM" : "BACK TO MENU 🏠"}
                </button>
            )}
        </div>

      </div>
    </div>
  );
}

export default GameOverModal;