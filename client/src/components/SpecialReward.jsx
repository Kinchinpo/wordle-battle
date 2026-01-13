// client/src/components/SpecialReward.jsx
import React, { useEffect, useState, useMemo } from "react";
import "./SpecialReward.css";
import "./Letter.css"; 
import catLetterSvg from "../assets/cat_letter.svg"; // Import file SVG mới

const SpecialReward = ({ onExit }) => {
  const [loaded, setLoaded] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- ENGLISH CONTENT ---
  const letterContent = `
    Dear vixinh,
    7.0 IELTS.
    
    Dạy vui nha.
  `;

  return (
    <div className={`reward-container ${!loaded ? "not-loaded" : ""}`}>
      
      <button 
        onClick={onExit}
        className="fixed top-6 right-6 z-[10000] px-6 py-2 bg-white/20 hover:bg-white/40 text-white font-bold rounded-full backdrop-blur-md transition-all border border-white/30"
      >
        ✕ BACK TO MENU
      </button>

      {/* --- LETTER ENVELOPE (IMAGE) --- */}
      {!isLetterOpen && (
        <div className="letter-wrapper" onClick={() => setIsLetterOpen(true)}>
            {/* Sử dụng ảnh SVG thay vì vẽ bằng CSS */}
            <img src={catLetterSvg} alt="Cat Letter" className="envelope-svg" />
            
            <div className="click-hint">
                Click to open 💌
            </div>
        </div>
      )}

      {/* --- LETTER CONTENT --- */}
      {isLetterOpen && (
        <div className="letter-overlay">
            {/* Floating Hearts Effect */}
            <div className="floating-hearts">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="heart" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `-${Math.random() * 15}s`, 
                            animationDuration: `${5 + Math.random() * 10}s`,
                            fontSize: `${12 + Math.random() * 20}px`,
                            color: '#ffd1dc',
                            
                            // ASCII Art Styles
                            whiteSpace: "pre",       
                            fontFamily: "monospace", 
                            lineHeight: "1.1",
                            textAlign: "left"
                        }}
                    >
                        {[
                            '🌸🌸', '❀', '❀❁✿', '✾⋆.˚', '୨ৎ୨ৎ', '❤︎❤︎',
                            // ASCII Art Cat (Kept exactly as requested)
                            `
｡ﾟﾟ･ ｡ ･ﾟﾟ｡
ﾟ。    🦋
　ﾟ･｡･
                  ╱|、
                (˚ˎ 。7
                 |、˜〵
                じしˍ,)ノ`
                        ][Math.floor(Math.random() * 7)]}
                    </div>
                ))}
            </div>

            <div className="letter-content">
                <div className="letter-text">
                    {letterContent}
                </div>
                <button className="close-letter-btn" onClick={() => setIsLetterOpen(false)}>
                    Close Letter
                </button>
            </div>
        </div>
      )}

      {/* --- FLOWERS SECTION (KEPT ORIGINAL) --- */}
      <div className="night"></div>
      
      <div className="flowers">
        <div className="flower flower--1">
          <div className="flower__leafs flower__leafs--1">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flower__light flower__light--${i + 1}`}></div>
            ))}
          </div>
          <div className="flower__line">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flower__line__leaf flower__line__leaf--${i + 1}`}></div>
            ))}
          </div>
        </div>

        <div className="flower flower--2">
          <div className="flower__leafs flower__leafs--2">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flower__light flower__light--${i + 1}`}></div>
            ))}
          </div>
          <div className="flower__line">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flower__line__leaf flower__line__leaf--${i + 1}`}></div>
            ))}
          </div>
        </div>

        <div className="flower flower--3">
          <div className="flower__leafs flower__leafs--3">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flower__light flower__light--${i + 1}`}></div>
            ))}
          </div>
          <div className="flower__line">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flower__line__leaf flower__line__leaf--${i + 1}`}></div>
            ))}
          </div>
        </div>

        <div className="grow-ans" style={{ "--d": "1.2s" }}>
          <div className="flower__g-long">
            <div className="flower__g-long__top"></div>
            <div className="flower__g-long__bottom"></div>
          </div>
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="growing-grass">
            <div className={`flower__grass flower__grass--${i}`}>
              <div className="flower__grass--top"></div>
              <div className="flower__grass--bottom"></div>
              {[...Array(8)].map((_, j) => (
                <div key={j} className={`flower__grass__leaf flower__grass__leaf--${j + 1}`}></div>
              ))}
              <div className="flower__grass__overlay"></div>
            </div>
          </div>
        ))}

        <div className="grow-ans" style={{ "--d": "2.4s" }}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ "--d": "2.8s" }}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ "--d": "2.8s" }}>
          <div className="flower__g-front">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${i + 1}`}>
                <div className="flower__g-front__leaf"></div>
              </div>
            ))}
            <div className="flower__g-front__line"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ "--d": "3.2s" }}>
          <div className="flower__g-fr">
            <div className="leaf"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flower__g-fr__leaf flower__g-fr__leaf--${i + 1}`}></div>
            ))}
          </div>
        </div>

        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
           <div key={i} className={`long-g long-g--${i}`}>
             {[0, 1, 2, 3].map(j => (
                <div key={j} className="grow-ans" style={{ "--d": `${3 + i*0.2}s` }}>
                   <div className={`leaf leaf--${j}`}></div>
                </div>
             ))}
           </div>
        ))}

      </div>
    </div>
  );
};

export default SpecialReward;