// server/index.js
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");

app.use(cors());

// Load dữ liệu
let wordList = [];
try {
  const data = fs.readFileSync("./wordle_data.json", "utf8");
  wordList = JSON.parse(data);
} catch (err) {
  console.error("Lỗi:", err);
  wordList = [{ word: "APPLE", points: 10 }];
}

// --- TỪ KHÓA CHẾ ĐỘ SPECIAL ---
const SPECIAL_WORDS = ["VITAL", "AFFIX", "WHALE", "MINES"];

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

// Hàm xáo trộn mảng (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

io.on("connection", (socket) => {
  const getRandomWord = () => wordList[Math.floor(Math.random() * wordList.length)];

  // 1. SINGLE PLAYER (Giữ nguyên)
  socket.on("create_single_game", () => {
    const roomID = `single_${socket.id}`;
    socket.join(roomID);
    const picked = getRandomWord();
    rooms[roomID] = {
      solution: picked.word.toUpperCase(),
      points: picked.points,
      mode: "SINGLE",
      players: [socket.id]
    };
    socket.emit("game_start", { 
      solution: rooms[roomID].solution,
      points: rooms[roomID].points,
      mode: "SINGLE"
    });
  });

  // --- 2. SPECIAL MODE (MỚI) ---
  socket.on("create_special_game", () => {
    const roomID = `special_${socket.id}`;
    socket.join(roomID);
    
    // Xáo trộn 4 từ khóa
    const gameWords = shuffleArray(SPECIAL_WORDS);
    
    rooms[roomID] = {
      mode: "SPECIAL",
      players: [socket.id],
      specialWords: gameWords, // Lưu danh sách 4 từ đã xáo
      currentRound: 0, // Bắt đầu từ 0 (index mảng)
      solution: gameWords[0], // Từ đầu tiên
      points: 0 // Chế độ này không cần tính điểm khó
    };

    socket.emit("game_start", {
      solution: rooms[roomID].solution,
      points: 0,
      mode: "SPECIAL",
      currentRound: 1, // Hiển thị cho người dùng là Vòng 1
      maxRounds: 4
    });
  });

  // Sự kiện: Chơi lại màn vừa thua (Special)
  socket.on("retry_special_round", () => {
      const roomID = `special_${socket.id}`;
      const room = rooms[roomID];
      if (!room || room.mode !== "SPECIAL") return;

      // Giữ nguyên solution cũ, chỉ gửi lại lệnh reset
      socket.emit("reset_game", {
          solution: room.solution,
          points: 0
      });
  });

  // Sự kiện: Sang màn tiếp theo (Special)
  socket.on("next_special_round", () => {
      const roomID = `special_${socket.id}`;
      const room = rooms[roomID];
      if (!room || room.mode !== "SPECIAL") return;

      room.currentRound += 1;
      
      // Lấy từ tiếp theo trong mảng
      const nextWord = room.specialWords[room.currentRound]; 
      room.solution = nextWord;

      socket.emit("start_new_round", {
          solution: nextWord,
          points: 0,
          currentRound: room.currentRound + 1, // +1 vì index bắt đầu từ 0
          maxRounds: 4
      });
  });

  // --- 3. VERSUS (Giữ nguyên logic cũ) ---
  socket.on("join_room", (data) => {
    const roomName = data.room;
    const settings = data.settings || { maxRounds: 1 }; 
    socket.join(roomName);
    if (!rooms[roomName]) {
      rooms[roomName] = {
        solution: null, points: 0, players: [], mode: "VERSUS",
        config: { maxRounds: parseInt(settings.maxRounds) },
        currentRound: 1, scores: {} 
      };
    }
    // (Logic fix đè mode cũ)
    if (rooms[roomName].mode !== "VERSUS") {
       rooms[roomName].mode = "VERSUS"; rooms[roomName].players = []; rooms[roomName].scores = {};
    }
    if (!rooms[roomName].players.includes(socket.id)) {
      rooms[roomName].players.push(socket.id);
      if (!rooms[roomName].scores[socket.id]) rooms[roomName].scores[socket.id] = 0;
    }
    const playerCount = rooms[roomName].players.length;
    if (playerCount === 1) socket.emit("waiting_for_opponent");
    else if (playerCount === 2) {
      const picked = getRandomWord();
      rooms[roomName].solution = picked.word.toUpperCase();
      rooms[roomName].points = picked.points;
      io.in(roomName).emit("game_start", { 
        solution: rooms[roomName].solution, points: rooms[roomName].points, mode: "VERSUS",
        currentRound: rooms[roomName].currentRound, maxRounds: rooms[roomName].config.maxRounds, scores: rooms[roomName].scores
      });
    } else socket.emit("room_full");
  });

  socket.on("send_move", (data) => {
    if (rooms[data.room] && rooms[data.room].mode !== "SINGLE" && rooms[data.room].mode !== "SPECIAL") {
        socket.to(data.room).emit("receive_opponent_move", data);
    }
  });

  socket.on("player_won", (data) => {
    const room = rooms[data.room];
    if (room && room.mode === "VERSUS") {
        room.scores[socket.id] += 1;
        if (room.currentRound < room.config.maxRounds) {
            io.in(data.room).emit("round_over", {
                winnerId: socket.id, word: room.solution, scores: room.scores,
                currentRound: room.currentRound, maxRounds: room.config.maxRounds
            });
        } else {
            io.in(data.room).emit("match_over", {
                winnerId: socket.id, word: room.solution, scores: room.scores,
            });
            delete rooms[data.room];
        }
    } 
  });

  socket.on("request_next_round", (roomName) => {
      // Logic cho Versus
      const room = rooms[roomName];
      if (!room) return;
      const picked = getRandomWord();
      room.solution = picked.word.toUpperCase();
      room.points = picked.points;
      room.currentRound += 1;
      io.in(roomName).emit("start_new_round", {
          solution: room.solution, points: room.points,
          currentRound: room.currentRound, maxRounds: room.config.maxRounds
      });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});