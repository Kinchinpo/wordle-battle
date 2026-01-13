// client/src/components/SpecialMessage.jsx
import React, { useEffect, useState } from 'react';
import './SpecialMessage.css';

const WORDS = [
  ['V', 'I', 'T', 'A', 'L'], 
  ['A', 'F', 'F', 'I', 'X'], 
  ['M', 'I', 'N', 'E', 'S'], 
  ['W', 'H', 'A', 'L', 'E']  
];

// Thứ tự tô màu: V -> I -> X -> I -> N -> H
const TARGET_SEQ = [
  "0-0", "0-1", "1-4", "2-1", "2-2", "3-1"
];

const SpecialMessage = ({ onFinish }) => {
  const [step, setStep] = useState(0); 
  // 0: Init, 1: Highlight, 2: Fade, 3: Merge, 4: Button
  const [highlightCount, setHighlightCount] = useState(0);

  useEffect(() => {
    // 1. Tô màu từng chữ
    let timers = [];
    TARGET_SEQ.forEach((_, index) => {
        const t = setTimeout(() => {
            setHighlightCount(prev => prev + 1);
            if (index === 0) setStep(1);
        }, 500 + (index * 400));
        timers.push(t);
    });

    // 2. Ẩn chữ thừa
    const tFade = setTimeout(() => setStep(2), 3200);
    // 3. Bay về giữa
    const tMerge = setTimeout(() => setStep(3), 4200);
    // 4. Hiện nút
    const tButton = setTimeout(() => setStep(4), 5600);

    return () => {
        timers.forEach(clearTimeout);
        clearTimeout(tFade); clearTimeout(tMerge); clearTimeout(tButton);
    };
  }, []);

  // Bắt sự kiện Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && step === 4) onFinish();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onFinish]);

  // --- HÀM TÍNH TOÁN VỊ TRÍ (RESPONSIVE TUYỆT ĐỐI) ---
  const getPosition = (rowIndex, colIndex, key) => {
      // 1. VỊ TRÍ BAN ĐẦU (GRID)
      // Grid 5 cột (mỗi cột 20%), 4 dòng (mỗi dòng 25%)
      // Center nhẹ bằng cách cộng margin
      const startLeft = colIndex * 20 + 2; // +2% margin
      const startTop = rowIndex * 25 + 2;  // +2% margin

      if (step < 3) {
          return { top: `${startTop}%`, left: `${startLeft}%` };
      }

      // 2. VỊ TRÍ SAU KHI GHÉP (VIXINH)
      // Chúng ta muốn xếp 6 chữ thành hàng ngang ở giữa (Top 40%)
      // Tổng độ rộng 6 chữ: 6 * 16% (width của box) + 5 * 0.5% (gap nhỏ) = ~98%
      // Căn giữa màn hình.
      
      const targetIndex = TARGET_SEQ.indexOf(key);
      if (targetIndex === -1) return { top: `${startTop}%`, left: `${startLeft}%` }; // Chữ thừa (đã ẩn) thì giữ nguyên

      // Tính left cho từng chữ V, I, X, I, N, H
      // Box width = 16%. Gap = 0.5% (hoặc 1% cho thoáng).
      // Start X = (100% - TotalWidth) / 2
      // TotalWidth = 6*16 + 5*1 = 96 + 5 = 101% (Hơi to, giảm gap hoặc width box css) -> CSS Box width 16% là OK.
      // Set Gap = 0.8%.
      // Left = StartX + Index * (Width + Gap)
      
      const boxW = 16; 
      const gap = 0.8;
      const totalW = (6 * boxW) + (5 * gap); // 96 + 4 = 100%
      const startX = (100 - totalW) / 2; // Căn giữa

      const finalLeft = startX + targetIndex * (boxW + gap);
      
      return {
          top: '40%', // Căn giữa theo chiều dọc
          left: `${finalLeft}%`
      };
  };

  return (
    <div className="message-container">
      <div className="words-container">
        {WORDS.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((char, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const targetIndex = TARGET_SEQ.indexOf(key);
              const isTarget = targetIndex !== -1;
              
              let className = "char-box";
              if (isTarget && highlightCount > targetIndex) className += " highlight";
              if (!isTarget && step >= 2) className += " faded";

              // Lấy vị trí (Style inline để động)
              const posStyle = getPosition(rowIndex, colIndex, key);

              return (
                <div 
                  key={key} 
                  className={className}
                  style={posStyle} // Style quyết định vị trí
                >
                  {char}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {step === 4 && (
        <button className="continue-btn" onClick={onFinish}>
          CONTINUE ❤️
        </button>
      )}
    </div>
  );
};

export default SpecialMessage;