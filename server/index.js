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

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

io.on("connection", (socket) => {
  const getRandomWord = () => wordList[Math.floor(Math.random() * wordList.length)];

  // 1. SINGLE PLAYER
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

  // 2. VERSUS: JOIN ROOM
  socket.on("join_room", (data) => {
    const roomName = data.room;
    const settings = data.settings || { maxRounds: 1 }; 

    socket.join(roomName);
    
    // Nếu phòng chưa có -> Tạo mới
    if (!rooms[roomName]) {
      rooms[roomName] = {
        solution: null,
        points: 0,
        players: [],
        mode: "VERSUS",
        config: { maxRounds: parseInt(settings.maxRounds) },
        currentRound: 1,
        scores: {} 
      };
    }

    // Reset nếu phòng cũ lỗi
    if (rooms[roomName].mode === "SINGLE") {
       rooms[roomName].mode = "VERSUS";
       rooms[roomName].players = [];
       rooms[roomName].scores = {};
    }

    if (!rooms[roomName].players.includes(socket.id)) {
      rooms[roomName].players.push(socket.id);
      if (!rooms[roomName].scores[socket.id]) {
        rooms[roomName].scores[socket.id] = 0;
      }
    }

    const playerCount = rooms[roomName].players.length;

    if (playerCount === 1) {
      socket.emit("waiting_for_opponent");
    } 
    else if (playerCount === 2) {
      const picked = getRandomWord();
      rooms[roomName].solution = picked.word.toUpperCase();
      rooms[roomName].points = picked.points;
      
      io.in(roomName).emit("game_start", { 
        solution: rooms[roomName].solution,
        points: rooms[roomName].points,
        mode: "VERSUS",
        currentRound: rooms[roomName].currentRound,
        maxRounds: rooms[roomName].config.maxRounds,
        scores: rooms[roomName].scores
      });
    } 
    else {
      socket.emit("room_full");
    }
  });

  socket.on("send_move", (data) => {
    if (rooms[data.room] && rooms[data.room].mode !== "SINGLE") {
        socket.to(data.room).emit("receive_opponent_move", data);
    }
  });

  // --- SỬA LOGIC MATCH OVER TẠI ĐÂY ---
  socket.on("player_won", (data) => {
    const room = rooms[data.room];
    if (room && room.mode === "VERSUS") {
        
        room.scores[socket.id] += 1;

        if (room.currentRound < room.config.maxRounds) {
            // --- HẾT VÒNG: TIẾP TỤC ---
            io.in(data.room).emit("round_over", {
                winnerId: socket.id,
                word: room.solution,
                scores: room.scores,
                currentRound: room.currentRound,
                maxRounds: room.config.maxRounds
            });
        } else {
            // --- HẾT GIẢI: XÓA PHÒNG ---
            io.in(data.room).emit("match_over", {
                winnerId: socket.id,
                word: room.solution,
                scores: room.scores,
            });
            
            // QUAN TRỌNG: Xóa dữ liệu phòng ngay lập tức
            console.log(`Match finished in Room ${data.room}. Deleting room.`);
            delete rooms[data.room];
            
            // Socket.io room vẫn còn active connection, nhưng data trên server đã mất
            // Client sẽ tự rời phòng khi bấm nút "Về Menu"
        }
    } 
  });

  socket.on("request_next_round", (roomName) => {
      const room = rooms[roomName];
      if (!room) return;

      const picked = getRandomWord();
      room.solution = picked.word.toUpperCase();
      room.points = picked.points;
      room.currentRound += 1;

      io.in(roomName).emit("start_new_round", {
          solution: room.solution,
          points: room.points,
          currentRound: room.currentRound,
          maxRounds: room.config.maxRounds
      });
  });
  
  // ĐÃ XÓA: socket.on("request_full_rematch") vì không dùng nữa
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});