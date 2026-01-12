// client/src/App.jsx
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { FaGear, FaXmark } from "react-icons/fa6"; 
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import MiniBoard from './components/MiniBoard';
import GameOverModal from './components/GameOverModal';
import validWordsRaw from './valid_words.txt?raw';

// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://vixinh-wordle.onrender.com");

// Xử lý từ điển
const validWordsSet = new Set(
  validWordsRaw
    .split('\n')
    .map((w) => w.replace(/\[.*?\]/g, "").trim().toLowerCase())
    .filter((w) => w.length === 5)
);

function App() {
  // --- STATE QUẢN LÝ MÀN HÌNH ---
  const [view, setView] = useState("MENU"); // MENU | LOBBY | WAITING | GAME
  const [gameMode, setGameMode] = useState("SINGLE"); // SINGLE | VERSUS
  const [room, setRoom] = useState("");

  // --- STATE CÀI ĐẶT PHÒNG ---
  const [showSettings, setShowSettings] = useState(false);
  const [maxRounds, setMaxRounds] = useState(3); // Mặc định 3 vòng

  // --- STATE ĐIỂM SỐ & VÒNG ĐẤU ---
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  // --- STATE GAMEPLAY ---
  const [solution, setSolution] = useState("");
  const [wordPoints, setWordPoints] = useState(0);
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(5).fill("")));
  const [colors, setColors] = useState(Array(6).fill(null).map(() => Array(5).fill(null)));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentTile, setCurrentTile] = useState(0);

  // --- STATE ĐỐI THỦ ---
  const [opponentColors, setOpponentColors] = useState(Array(6).fill(null).map(() => Array(5).fill(null)));
  const [opponentRow, setOpponentRow] = useState(0);

  // --- STATE TRẠNG THÁI & UI ---
  const [gameOver, setGameOver] = useState(false);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [waitingNext, setWaitingNext] = useState(false); // Chờ vòng tiếp theo
  const [waitingRematch, setWaitingRematch] = useState(false); // Chờ chơi lại (Single)
  const [showInvalidToast, setShowInvalidToast] = useState(false);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    // 1. Chờ đối thủ
    socket.on("waiting_for_opponent", () => setView("WAITING"));

    // 2. Bắt đầu game (Ván 1)
    socket.on("game_start", (data) => handleNewGameData(data));

    // 3. Bắt đầu vòng mới (Ván 2, 3...)
    socket.on("start_new_round", (data) => handleNewGameData(data));

    // 4. Nhận nước đi đối thủ
    socket.on("receive_opponent_move", (data) => {
      setOpponentColors((prev) => {
        const newColors = [...prev];
        newColors[data.currentRow] = data.rowColors;
        return newColors;
      });
      setOpponentRow(data.currentRow + 1);
    });

    // 5. Kết thúc 1 vòng (Round Over)
    socket.on("round_over", (data) => {
      updateScores(data.scores);
      setGameOver(true);
      setIsMatchOver(false);
      setIsWin(data.winnerId === socket.id);
    });

    // 6. Kết thúc giải đấu (Match Over)
    socket.on("match_over", (data) => {
      updateScores(data.scores);
      setGameOver(true);
      setIsMatchOver(true);
      
      // Tính thắng thua chung cuộc
      const myFinalScore = data.scores[socket.id] || 0;
      const opId = Object.keys(data.scores).find(id => id !== socket.id);
      const opFinalScore = (opId && data.scores[opId]) || 0;
      setIsWin(myFinalScore > opFinalScore);
    });

    // 7. Reset Game (Dùng cho Single Player)
    socket.on("reset_game", (data) => handleNewGameData(data));

    // 8. Lỗi phòng đầy
    socket.on("room_full", () => {
      alert("Phòng đã đầy!");
      setView("MENU");
    });

  }, []);

  // --- HELPER FUNCTIONS ---
  const handleNewGameData = (data) => {
    setSolution(data.solution);
    setWordPoints(data.points);
    if(data.mode) setGameMode(data.mode);
    
    // Cập nhật thông tin vòng đấu (nếu có)
    if(data.currentRound) setCurrentRound(data.currentRound);
    if(data.maxRounds) setTotalRounds(data.maxRounds);
    if(data.scores) updateScores(data.scores);

    resetLocalState();
    setView("GAME");
  };

  const updateScores = (scoresObj) => {
    if(!scoresObj) return;
    setMyScore(scoresObj[socket.id] || 0);
    const opId = Object.keys(scoresObj).find(id => id !== socket.id);
    if(opId) setOpponentScore(scoresObj[opId]);
  };

  const resetLocalState = () => {
    setBoard(Array(6).fill(null).map(() => Array(5).fill("")));
    setColors(Array(6).fill(null).map(() => Array(5).fill(null)));
    setCurrentRow(0);
    setCurrentTile(0);
    setOpponentColors(Array(6).fill(null).map(() => Array(5).fill(null)));
    setOpponentRow(0);
    setGameOver(false);
    setWaitingNext(false);
    setWaitingRematch(false);
    setShowInvalidToast(false);
  };

  // --- USER ACTIONS ---
  
  const startSinglePlayer = () => {
    setGameMode("SINGLE");
    socket.emit("create_single_game");
  };

  const joinVersusRoom = () => {
    if (room !== "") {
      socket.emit("join_room", { 
        room: room, 
        settings: { maxRounds: maxRounds } 
      });
    }
  };

  const handleNextRound = () => {
    setWaitingNext(true);
    socket.emit("request_next_round", room);
  };

  const handleSingleRematch = () => {
    setWaitingRematch(true);
    socket.emit("create_single_game");
  };

  const exitToMenu = () => {
    setView("MENU");
    setRoom("");
    setMyScore(0);
    setOpponentScore(0);
    resetLocalState();
  };

  // --- CORE GAME LOGIC ---

  const handleEnter = useCallback(() => {
    if (gameOver || currentTile !== 5) return;
    const guessWord = board[currentRow].join("");

    // Check từ điển
    if (!validWordsSet.has(guessWord.toLowerCase())) {
      setShowInvalidToast(true);
      setTimeout(() => setShowInvalidToast(false), 500);
      return; 
    }

    // Logic tô màu
    const rowColors = Array(5).fill("absent");
    const solutionChars = solution.split("");
    const guessChars = guessWord.split("");

    // Bước 1: Check Correct (Xanh)
    guessChars.forEach((char, index) => {
      if (char === solutionChars[index]) {
        rowColors[index] = "correct";
        solutionChars[index] = null;
        guessChars[index] = null;
      }
    });

    // Bước 2: Check Present (Vàng/Xanh nhạt)
    guessChars.forEach((char, index) => {
      if (char && solutionChars.includes(char)) {
        rowColors[index] = "present";
        solutionChars[solutionChars.indexOf(char)] = null;
      }
    });

    setColors((prev) => {
      const newColors = [...prev];
      newColors[currentRow] = rowColors;
      return newColors;
    });

    // Gửi nước đi cho đối thủ (chỉ Versus)
    if (gameMode === "VERSUS") {
        socket.emit("send_move", {
            rowColors: rowColors,
            currentRow: currentRow,
            room: room,
        });
    }

    // Check Thắng/Thua
    if (guessWord === solution) {
      if (gameMode === "VERSUS") {
        socket.emit("player_won", { room, winnerId: socket.id });
      } else {
        // Single Player thắng
        setIsWin(true);
        setGameOver(true);
      }
    } else if (currentRow === 5) {
      // Hết lượt
      if (gameMode === "SINGLE") {
         setIsWin(false);
         setGameOver(true);
      }
      // Versus: Không làm gì, chờ đối thủ hoặc hết giờ (nếu có timer)
    }

    // Xuống dòng
    if (currentRow < 5 && guessWord !== solution) {
      setCurrentRow((prev) => prev + 1);
      setCurrentTile(0);
    }
  }, [currentTile, currentRow, board, room, solution, gameOver, gameMode]);

  const handleKeyPress = useCallback((key) => {
    if (gameOver || currentTile > 4) return;
    setBoard((prev) => {
      const newBoard = [...prev];
      const newRow = [...newBoard[currentRow]];
      newRow[currentTile] = key;
      newBoard[currentRow] = newRow;
      return newBoard;
    });
    setCurrentTile((prev) => prev + 1);
  }, [currentTile, currentRow, gameOver]);

  const handleDelete = useCallback(() => {
    if (gameOver || currentTile === 0) return;
    setBoard((prev) => {
      const newBoard = [...prev];
      const newRow = [...newBoard[currentRow]];
      newRow[currentTile - 1] = "";
      newBoard[currentRow] = newRow;
      return newBoard;
    });
    setCurrentTile((prev) => prev - 1);
  }, [currentTile, currentRow, gameOver]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (view !== "GAME" || gameOver) return;
      const key = event.key.toUpperCase();
      if (key === 'ENTER') handleEnter();
      else if (key === 'BACKSPACE') handleDelete();
      else if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnter, handleDelete, handleKeyPress, view, gameOver]);

  const getKeyStyles = () => {
     const styles = {};
     board.forEach((row, rowIndex) => {
       if (rowIndex >= currentRow && !colors[rowIndex][0]) return;
       row.forEach((char, charIndex) => {
         if (!char) return;
         const color = colors[rowIndex][charIndex];
         if (!color) return;
         const currentStyle = styles[char];
         if (currentStyle === 'correct') return;
         if (color === 'correct') { styles[char] = 'correct'; return; }
         if (currentStyle === 'present') return;
         if (color === 'present') { styles[char] = 'present'; return; }
         if (!currentStyle && color === 'absent') styles[char] = 'absent';
       });
     });
     return styles;
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden relative">
      
      {/* TOAST THÔNG BÁO LỖI */}
      {showInvalidToast && (
        <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 z-50">
           <div className="bg-white text-gray-900 font-bold px-4 py-2 rounded-md shadow-lg text-sm animate-bounce">
              Không có trong từ điển
           </div>
        </div>
      )}

      {/* MODAL KẾT THÚC */}
      {gameOver && (
        <GameOverModal 
          isWin={isWin} 
          solution={solution} 
          
          // Logic nút bấm: 
          // Single -> Chơi lại. 
          // Versus (Chưa hết giải) -> Vòng tiếp.
          // Versus (Hết giải) -> Không làm gì (nút bị ẩn trong component Modal).
          onRematch={gameMode === "SINGLE" ? handleSingleRematch : handleNextRound}
          
          isWaiting={waitingNext || waitingRematch}
          onExit={exitToMenu} 
          
          // Props hiển thị
          isMatchOver={isMatchOver}
          gameMode={gameMode}
          currentRound={currentRound}
          totalRounds={totalRounds}
          myScore={myScore}
          opponentScore={opponentScore}
        />
      )}

      {/* MODAL CÀI ĐẶT (SETTINGS) */}
      {showSettings && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-6 rounded-xl w-80 border border-gray-600">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#ffd1dc]">ROOM SETTINGS</h3>
                  <button onClick={() => setShowSettings(false)}><FaXmark className="text-xl text-gray-400"/></button>
               </div>
               <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-bold">Number of rounds (1-10):</label>
                  <div className="flex items-center gap-4">
                     <input 
                        type="range" min="1" max="10" 
                        value={maxRounds} 
                        onChange={(e) => setMaxRounds(e.target.value)}
                        className="w-full accent-[#ffd1dc]"
                     />
                     <span className="text-2xl font-bold text-[#ffd1dc]">{maxRounds}</span>
                  </div>
               </div>
               <button onClick={() => setShowSettings(false)} className="w-full bg-[#ffd1dc] text-gray-900 font-bold py-2 rounded-lg">
                  SAVE SETTINGS
               </button>
            </div>
         </div>
      )}

      {/* === VIEW 1: MAIN MENU === */}
      {view === "MENU" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 space-y-6">
           <h1 className="text-5xl font-extrabold mb-4 text-[#ffd1dc] drop-shadow-lg">WORDLE BATTLE</h1>
           
           <button onClick={startSinglePlayer} className="w-full max-w-xs py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-xl transition transform active:scale-95 shadow-lg">
             👤 1 PLAYER
           </button>
           
           <button onClick={() => { setGameMode("VERSUS"); setView("LOBBY"); }} className="w-full max-w-xs py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-xl transition transform active:scale-95 shadow-lg">
             ⚔️ 2 PLAYERS VERSUS
           </button>

           <button disabled className="w-full max-w-xs py-4 bg-gray-700 text-gray-400 rounded-xl font-bold text-xl cursor-not-allowed border border-gray-600">
             🤝 2 PLAYERS CO-OP (Soon)
           </button>
        </div>
      )}

      {/* === VIEW 2: LOBBY (VERSUS) === */}
      {view === "LOBBY" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 relative">
          <button onClick={() => setView("MENU")} className="absolute top-4 left-4 text-gray-400 hover:text-white">← Back</button>
          
          <h1 className="text-4xl font-extrabold mb-8 text-[#C1D5F0]">VERSUS LOBBY</h1>
          
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm relative">
             {/* Nút Bánh Răng */}
             <button 
                onClick={() => setShowSettings(true)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#ffd1dc] transition p-2"
                title="Cài đặt số vòng"
             >
                <FaGear className="text-xl" />
             </button>

             <input 
                className="w-full p-4 mb-6 text-xl text-center text-black font-bold rounded-lg focus:outline-none focus:ring-4 focus:ring-[#C1D5F0]" 
                placeholder="Enter Room ID..." 
                onChange={(e) => setRoom(e.target.value)} 
             />
             <button onClick={joinVersusRoom} className="w-full bg-[#C1D5F0] hover:bg-[#a0bce0] text-gray-900 text-xl font-bold py-4 rounded-lg">
               JOIN ROOM ({maxRounds} Rounds)
             </button>
          </div>
        </div>
      )}

      {/* === VIEW 3: WAITING === */}
      {view === "WAITING" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 bg-gray-900">
           <div className="animate-spin text-6xl mb-6">⏳</div>
           <h2 className="text-2xl font-bold text-[#ffd1dc] mb-2">WAITING FOR OPPONENT...</h2>
           <p className="text-gray-400 mb-8">Room ID: <span className="text-white font-bold">{room}</span></p>
           <button onClick={exitToMenu} className="mt-12 px-6 py-2 border border-red-500 text-red-400 rounded hover:bg-red-500/10">
              Cancel
           </button>
        </div>
      )}

      {/* === VIEW 4: GAME === */}
      {view === "GAME" && (
        <>
          <header className="h-14 border-b border-gray-700 flex justify-between items-center px-4 bg-gray-800 shrink-0">
            <button onClick={exitToMenu} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
            
            {/* SCOREBOARD */}
            {gameMode === "VERSUS" ? (
               <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                     Round {currentRound}/{totalRounds}
                  </div>
                  <div className="flex gap-4 items-center">
                     <span className={`font-black text-xl ${myScore > opponentScore ? "text-[#ffd1dc]" : "text-white"}`}>YOU: {myScore}</span>
                     <span className="text-gray-600">|</span>
                     <span className={`font-black text-xl ${opponentScore > myScore ? "text-[#ffd1dc]" : "text-white"}`}>OPP: {opponentScore}</span>
                  </div>
               </div>
            ) : (
                <h1 className="text-xl font-extrabold text-[#ffd1dc]">SINGLE PLAYER</h1>
            )}

            <div className="text-xs font-bold text-yellow-400 w-[20px]">
               {gameMode === "SINGLE" && `${wordPoints}pt`}
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center min-h-0 p-2 relative">
             <div className="w-full max-w-[350px]">
               <Board board={board} colors={colors} currentRow={currentRow} currentTile={currentTile} />
             </div>
          </div>

          {/* ENEMY BAR */}
          {gameMode === "VERSUS" ? (
             <div className="h-20 bg-gray-800 border-y border-gray-700 px-4 flex items-center justify-center shrink-0">
               <div className="w-full max-w-[600px] flex items-center justify-between px-2">
                   <div className="flex flex-col items-start mr-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Opponent</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-bold text-[#ffd1dc] leading-none">{opponentRow}</span>
                         <span className="text-sm text-gray-500 font-bold">/6</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Wins: <span className="text-white font-bold">{opponentScore}</span></div>
                   </div>
                   <div><MiniBoard colors={opponentColors} /></div>
               </div>
             </div>
          ) : ( <div className="h-4 shrink-0"></div> )}

          <div className="w-full shrink-0 pb-safe pt-2 bg-gray-900 flex justify-center">
             <Keyboard onKeyPress={handleKeyPress} onDelete={handleDelete} onEnter={handleEnter} keyStyles={getKeyStyles()} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;