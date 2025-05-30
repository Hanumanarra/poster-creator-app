/**export default function Header() {
    return(
        <header>
            <h1>Hii For EveryBody In Here</h1>
        </header>
    )
}
 import joke from "/joke"

export default function App(){
    return(
      <main>
        <joke
        setup="I got a frigde for my daughter brithday gift"
        punchline="i cant see her face without light"
        />
        <joke
        setup="How did hacker escape from police"
        punchline="he ran somewhere"
        />

        
      </main>
    )
}
joke.render(
    <App />
)*/

/**import { noBoolOperatorAliases } from "sequelize/lib/utils/deprecations"

export default function App() {
    const ninjaturtles=[
        <h2>Donate hlo</h2>,
        <h2>Rafeal</h2>

    ]

return(
    <main>
        {ninjaturtles}
    </main>
)
}*/

/**export default function App(){
    return(
        <main>
            <form className="add-ingerdiants"> 
                <input 
                type="text"
                placeholder="e.g orange"
                aria-label="Ingerdiants"
                />
                <button>Add Ingerdiants</button>
            </form>
        </main>
    )
}*/
/**import React from "react"
export default function App(){
    const result=React.useState("heck")
    console.log(result)
    return(
        <main>
            <h1>Is it important to know</h1>
            <button>{result}</button>
        </main>
    )
}*/

/**import React from "react";
export default function App(){
    const [count,setCount]=React.useState(10)
    function sub(){
        setCount(count-1)
    }

    function add(){
        setCount(count+1)
    }

    return(
        <main>
            <h1>how many times my Self say "state" in the section</h1>
            <div>
                <button className="minus" onClick={sub}aria-label="Decrease count">-</button>
                <h2>{count}</h2>
                <button className="plus" onClick={add} aria-label="Increase count">+</button>
            </div>
        </main>
    )
}*/

/**export default function App(){
    const toNight=true
    

   
    return(
        <main>
        <h2>Would like to go out tonight?</h2>
        <button>{toNight?"yes":"No"}</button>
        </main>
    )
}
*/

/**import React from "react";
export default function App(){
    const[isGoingOut,notGoingOut]=React.useState(false)

    return(
        <main>
            <h1>is Going out to night</h1>
            <button onClick={()=>{notGoingOut(!isGoingOut)}}>{isGoingOut?"yes":"no"}</button>
        </main>
    )*/

/**import React from "react";
export default function App(){
    const [unreadMessages,setUnreadMessages] =React.useState(["a","b"])
    return (
        <div>
            {
                unreadMessages.length>0&&
                <h1>you have{unreadMessages.length}unread messages!</h1>
            }
        </div>
    )
}import { console } from "inspector"
*/
/**import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { nanoid } from "nanoid"
import { useState } from "react"
import Die from "/Die"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use";

async function saveGameResult(score) {
    try {
      await addDoc(collection(db, "gameResults"), {
        timestamp: new Date(),
        score: score
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

export default function App(){
    const { width, height } = useWindowSize();
    
    const[dice,setDice]=useState(generateAllNewDice())

    const gameWon = dice.length > 0 &&
    dice.every(die => die.isHeld) &&
    dice.every(die => die.value === dice[0].value);



    function generateAllNewDice(){
       return new Array(10)
        .fill(0)
        .map(()=>({
             value:Math.ceil(Math.random()*6),
             isHeld:false,
             id:nanoid()
        }))
    
    }
   function rollDice(){
    if(!gameWon){
    setDice(oldDice=>oldDice.map(die=>
        die.isHeld?
          die:
        {...die,value:Math.ceil(Math.random()*6)}

    ))
}else{
    setDice(generateAllNewDice())
}
   }
   function hold(id){
     setDice(oldDice=>{
        return oldDice.map(die=>{
            return die.id==id?
            {...die,isHeld:!die.isHeld}:
            die
        })
     })
   }
    const diceElements=dice.map(dieObj=> (
    <Die  key={dieObj.id}
     value={dieObj.value} 
     isHeld={dieObj.isHeld}
     hold={()=>hold(dieObj.id)}
     id={dieObj.id}
      />))
    return(
        <main>
             {gameWon && <Confetti width={width} height={height} />}
            <h1 className="title">Tenzies</h1>
            <p className="instruction">Roll until are dice are same.Click each dice to freeze it at its current value between rolls</p>
            <div className="dice-container">
           {diceElements}
                </div>
            <button className="dice-roll" onClick={rollDice}>{gameWon? "NewGame":"RollUp"}</button>
        </main>
    )
}*/

/**import { nanoid } from "nanoid";
import { useState, useEffect } from "react";
import Die from "/Die";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function App() {
    const { width, height } = useWindowSize();
    const [dice, setDice] = useState(generateAllNewDice());
    const [gameWon, setGameWon] = useState(false);
    const [resultSaved, setResultSaved] = useState(false); 
    const [rollCount, setRollCount] = useState(0);
    const winningValue=dice[0]?.value;


    // Generate a new set of 10 dice
    function generateAllNewDice() {
        return Array.from({ length: 10 }, () => ({
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }));
    }

    // Roll dice or reset game
    function rollDice() {
        if (gameWon) {
            setDice(generateAllNewDice());
            setGameWon(false);
            setResultSaved(false); 
            setRollCount(0);
        } else {
            setDice(oldDice =>
                oldDice.map(die =>
                    die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
                )
            );
            setRollCount(prev=>prev+1);
        }
    }

    // Toggle hold state for a die
    function hold(id) {
        setDice(oldDice =>
            oldDice.map(die =>
                die.id === id ? { ...die, isHeld: !die.isHeld } : die
            )
        );
    }

    // Check if game is won
    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld);
        const allSame = dice.length > 0 && dice.every(die => die.value === dice[0].value);
        if (allHeld && allSame && !gameWon) {
            setGameWon(true);
        }
    }, [dice]);

    // Save game result to Firebase once when game is won
    useEffect(() => {
        if (gameWon && !resultSaved) {
            saveGameResult();
        }
    }, [gameWon]);

    // Firebase write function
    async function saveGameResult() {
        try {
            await addDoc(collection(db, "gameResults"), {
                timestamp: new Date(),
                diceCount: dice.length,
                rollCount:rollCount,
                winningValue:winningValue,
            });
            console.log("Game result saved!");
            setResultSaved(true);
        } catch (error) {
            console.error(" Failed to save game result:", error);
        }
    }

    // Render each die
    const diceElements = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            hold={() => hold(die.id)}
        />
    ));

    return (
        <main>
            {gameWon && <Confetti width={width} height={height} />}
            <h1 className="title">Tenzies</h1>
            <p className="instruction">
                Roll until all dice are the same. Click a die to freeze its value between rolls.
            </p>
            <div className="dice-container">{diceElements}</div>
            <button className="dice-roll" onClick={rollDice}>
                {gameWon ? "New Game" : "Roll"}
            </button>
        </main>
    );
}*/

/**import React, { useState } from "react";
import clsx from "clsx";
import { languages } from "./languages";
import getFarewellText,{  getRandomWord}  from "./utils";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function AssemblyEndgame(){
    const { width, height } = useWindowSize();
     
     const[currentWord,setCurrentWord]=useState(()=>getRandomWord())
     const [guessedLetters,setGuessedLetters]=useState([])

    const wrongGuessCount=
    guessedLetters.filter(letter => !currentWord.includes(letter)).length
    const isGamewon=
    currentWord.split("").every(letter=>guessedLetters.includes(letter))
    const isGameLost=
    wrongGuessCount>=languages.length-1
    const isGameOver=isGamewon || isGameLost
    const alphabet="abcdefghijklmnopqrstuvwxyz"
     const lastGuessedLetter=guessedLetters[guessedLetters.length-1]
           const isLastGuessedIncorrect=lastGuessedLetter&&!currentWord.includes(lastGuessedLetter)
    
    console.log(guessedLetters)
    function addGuessedLetter(letter){
        setGuessedLetters(prevLetters=>
            prevLetters.includes(letter)?
            prevLetters:

            [...prevLetters,letter])
    }
    function startNewGame(){
      setCurrentWord(getRandomWord())
      setGuessedLetters([])
       
   }

    const languageElement=languages.map((lang,index)=>{
        const isLanguageLost=index<wrongGuessCount
    const styles={
        backgroundColor:lang.backgroundColor,
        color:lang.color
    }
    const className=clsx("chip",isLanguageLost&&"lost")
                 return(
        <span 
        className={className}
         style={styles}>
          {lang.name}</span>
        )
    })
    const letterWord=currentWord.split("").map((letter,index)=>{
        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName= clsx(
            isGameLost && !guessedLetters.includes(letter)&&"missed-letter"
        )
        return(

      <span key={index}className={letterClassName}>
        {shouldRevealLetter?letter.toUpperCase():""}</span>
          )
          
    })
    const keyboardElement=alphabet.split("").map(letter=> {
           const isGuessed=guessedLetters.includes(letter)
           const iscorrect=isGuessed && currentWord.includes(letter)
           const iswrong=isGuessed && !currentWord.includes(letter)
          
           
           const className=clsx({
             correct:iscorrect,
             wrong:iswrong
        })
        console.log(className)

        return(
        <button
        className={className} 
        key={letter}
        disabled={isGameOver} 
        aria-disabled={isGameOver}
        onClick={()=>addGuessedLetter(letter)}>
            {letter.toUpperCase()}
            </button>
    )
})
const gameStatusClass=clsx("game-status",{
    won:isGamewon ,
    lost:isGameLost,
     farewell: !isGameOver && isLastGuessedIncorrect
   
})
 
    
  
function renderGameStatus(){
    if(!isGameOver && isLastGuessedIncorrect ){
        return (
            <>
        <p className="farewell-message">
            {getFarewellText(languages[wrongGuessCount-1]?.name)}</p>
            </>
   ) }
  if(isGamewon  ){
        return(
               <>
              <Confetti width={width} height={height} />
               <h2>you Win!</h2>
               <p>Well Done</p>
                </>

        )
    }
    if(isGameLost){
        return(
           <>
              <h2>Game Over!</h2>
                <p>You Lose!Better Start Learning Assembly</p>
              </>
        )
    }

  
}
    return(
        <main>
               <header>
                <h1>Assembly : Endgame</h1>
                <p>Guess the word within 8 attempts to keep programming world safe from Assembly!</p>
                </header>
                <section 
                aria-live="polite"
                role="status"
                className={gameStatusClass}>
                    {renderGameStatus()}
                     </section>
           
                <section className="language-chips">
                    {languageElement}
                    </section> 
                    <section className="word">
                        {letterWord}
                        </section> 

                    
                    <section className="keyboard">
                        {keyboardElement}
                        </section>

                       {isGameOver && 
                       <button className="newgame" onClick={startNewGame}>
                            New Game</button>  }      
        </main>
    )
}*/
/**
   

import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import posterImg from "/src/poster.png";

export default function App() {
  // Check URL for shared poster data
  const urlParams = new URLSearchParams(window.location.search);
  const sharedText = urlParams.get('text');
  const sharedX = parseFloat(urlParams.get('x'));
  const sharedY = parseFloat(urlParams.get('y'));

  const [text, setText] = useState(sharedText || "Double-click to edit");
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({ 
    x: !isNaN(sharedX) ? sharedX : 100, 
    y: !isNaN(sharedY) ? sharedY : 100 
  });
  const stageRef = useRef();
  const [image] = useImage(posterImg);
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 40, 800),
    height: Math.min(window.innerHeight - 120, 600),
  });

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 40, 800),
        height: Math.min(window.innerHeight - 120, 600),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate shareable link
  const generateShareLink = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('text', text);
    currentUrl.searchParams.set('x', position.x);
    currentUrl.searchParams.set('y', position.y);
    return currentUrl.toString();
  };

  // Download handler
  const downloadPoster = async () => {
    try {
      const dataUrl = await new Promise(resolve => {
        stageRef.current.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
          callback: resolve
        });
      });

      const link = document.createElement('a');
      link.download = 'my-poster.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Couldn't download image. Please try again.");
    }
  };

  // Share handler
  const sharePoster = async () => {
    try {
      const shareLink = generateShareLink();
      
      if (navigator.canShare?.({ url: shareLink })) {
        await navigator.share({
          title: "Edit my poster!",
          text: "Check out and edit this poster!",
          url: shareLink
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard! Send this to others to let them edit your poster.");
      }
    } catch (error) {
      console.error("Share error:", error);
      // Final fallback to download
      downloadPoster();
    }
  };

  const scale = Math.min(
    dimensions.width / 800,
    dimensions.height / 600
  );

  return (
    <div className="app-container">
      <div className="top-right-buttons">
        <button onClick={sharePoster} className="action-button">
          Share Editable Poster
        </button>
        <button onClick={downloadPoster} className="action-button">
          Download PNG
        </button>
      </div>

      {sharedText && (
        <div className="shared-notice">
          You're viewing a shared poster! Edit the text and share it again.
        </div>
      )}

      <div className="canvas-wrapper" style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}>
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Image image={image} width={800} height={600} />
            <KonvaText
              text={text}
              x={position.x}
              y={position.y}
              fontSize={24}
              fill="#333"
              draggable
              onDblClick={() => setIsEditing(true)}
              onDragEnd={(e) => setPosition({ 
                x: e.target.x(), 
                y: e.target.y() 
              })}
            />
          </Layer>
        </Stage>

        {isEditing && (
          <input
            className="text-edit-input"
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            style={{
              top: `${position.y * scale}px`,
              left: `${position.x * scale}px`,
              transform: `scale(${1/scale})`,
              transformOrigin: 'top left'
            }}
          />
        )}
      </div>
    </div>
  );
}

*/
/**import React from "react";
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import posterImg from "/src/poster.png";
import {db,timestamp} from "./firebase"
import {doc,setDoc,getDoc} from "firebase/firestore"

export default function App() {
  // Check URL for shared poster data
  const urlParams = new URLSearchParams(window.location.search);
  const sharedText = urlParams.get('text');
  const sharedX = parseFloat(urlParams.get('x'));
  const sharedY = parseFloat(urlParams.get('y'));

  // State management
  const [text, setText] = useState(sharedText || "Double-click to edit");
  
  const [position, setPosition] = useState({ 
    x: !isNaN(sharedX) ? sharedX : 100, 
    y: !isNaN(sharedY) ? sharedY : 100 
  });
  const [isEditing, setIsEditing] = useState(false);
  const stageRef = useRef();
  const textRef = useRef();
  const [image] = useImage(posterImg);
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 40, 800),
    height: Math.min(window.innerHeight - 40, 1000),
  });

  
  const posterWidth = 800;
  const posterHeight = 600;

  const savePosterData=async()=>{
    try{
      await setDoc(doc(db,"posterHistory", Date.now().toString()),{
        text:text,
        position:position,
        updatedAt:timestamp
      },{merge:true});
      console.log("saved in firebase data");
    }catch(error){
      console.log("Error Saving:",error)
    }
  };

const loadPosterData=async()=>{
  const docRef = doc(db,"poster","current");
  const docSnap= await getDoc(docRef);

  if(docSnap.exists()){
    setText(docSnap.data().text || "Double Click to edit");
    setPosition(docSnap.data().position ||{x:100,y:100});
  }
};
useEffect(()=>{
  loadPosterData();
},[])

useEffect(()=>{
  savePosterData();
},[text,position]);
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 40, 800),
        height:  Math.min(window.innerHeight - 40,1000),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate shareable link
  const generateShareLink = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('text', text);
    currentUrl.searchParams.set('x', position.x);
    currentUrl.searchParams.set('y', position.y);
    return currentUrl.toString();
  };

  
  const handleDragEnd = (e) => {
    const textNode = e.target;
    const textWidth = textNode.width() * textNode.scaleX();
    const textHeight = textNode.height() * textNode.scaleY();
    
    let newX = Math.max(0, Math.min(posterWidth - textWidth, textNode.x()));
    let newY = Math.max(0, Math.min(posterHeight - textHeight, textNode.y()));
    
    setPosition({ x: newX, y: newY });
    textNode.position({ x: newX, y: newY });
  };

  // Real-time boundary checking during drag
  const dragBoundFunc = (pos) => {
    const textNode = textRef.current;
    if (!textNode) return pos;
    
    const textWidth = textNode.width() * textNode.scaleX();
    const textHeight = textNode.height() * textNode.scaleY();
    
    return {
      x: Math.max(0, Math.min(posterWidth - textWidth, pos.x)),
      y: Math.max(0, Math.min(posterHeight - textHeight, pos.y))
    };
  };

  // Download handler
  const downloadPoster = async () => {
    try {
      const dataUrl = await new Promise(resolve => {
        stageRef.current.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
          callback: resolve
        });
      });

      const link = document.createElement('a');
      link.download = 'my-poster.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Couldn't download image. Please try again.");
    }
  };

  // Share handler
  const sharePoster = async () => {
    try {
      const shareLink = generateShareLink();
      
      if (navigator.canShare?.({ url: shareLink })) {
        await navigator.share({
          title: "Edit my poster!",
          text: "Check out and edit this poster!",
          url: shareLink
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard! Send this to let others edit your poster.");
      }
    } catch (error) {
      console.error("Share error:", error);
      downloadPoster();
    }
  };

  const scale = Math.min(
    dimensions.width / posterWidth,
    dimensions.height / posterHeight
  );

  return (
    <div className="app-container">
      <div className="top-right-buttons">
        <button onClick={sharePoster} className="action-button">
          Share Editable Poster
        </button>
        <button onClick={downloadPoster} className="action-button">
          Download Poster
        </button>
      </div>

     

      <div className="canvas-wrapper" style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}>
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Image 
              image={image} 
              width={posterWidth} 
              height={posterHeight} 
            />
            <KonvaText
              ref={textRef}
              text={text}
              x={position.x}
              y={position.y}
              fontSize={24}
              fill="#333"
              draggable
              onDblClick={() => setIsEditing(true)}
              onTap={()=> setIsEditing(true)}
              onDragEnd={handleDragEnd}
              dragBoundFunc={dragBoundFunc}
            />
          </Layer>
        </Stage>

        {isEditing && (
          <input
            className="text-edit-input"
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            style={{
              top: `${position.y * scale}px`,
              left: `${position.x * scale}px`,
              transform: `scale(${1/scale})`,
              transformOrigin: 'top left'
            }}
          />
        )}
      </div>
    </div>
  );
}*/
/**import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import posterImg from "/src/poster.png";
import { db, timestamp } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Custom hook for device detection
const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return { isMobile };
};

export default function App() {
  const { isMobile } = useDeviceDetect();
  
  // Rest of your existing state and functions...
  const [textElements, setTextElements] = useState([
    {
      id: Date.now(),
      text: "Double-click to edit",
      position: { x: 100, y: 100 },
      isEditing: false,
    }
  ]);
  const [nextId, setNextId] = useState(2);
  const stageRef = useRef();
  const textRefs = useRef({});
  const [image] = useImage(posterImg);
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 40, 800),
    height: Math.min(window.innerHeight - 50, 1000),
  });

  const posterWidth = dimensions.width;
  const posterHeight = dimensions.height;

  const savePosterData = async () => {
    try {
      await setDoc(doc(db, "posterHistory", Date.now().toString()), {
        textElements: textElements,
        updatedAt: timestamp
      }, { merge: true });
    } catch (error) {
      console.log("Error Saving:", error);
    }
  };

  const loadPosterData = async () => {
    const docRef = doc(db, "poster", "current");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().textElements) {
      setTextElements(docSnap.data().textElements);
      setNextId(docSnap.data().textElements.length + 1);
    } else {
      setTextElements([{
        id: 1,
        text: "Double-click to edit",
        position: { x: 100, y: 100 },
        isEditing: false
      }]);
      setNextId(2);
    }
  };

  useEffect(() => {
    loadPosterData();
  }, []);

  useEffect(() => {
    savePosterData();
  }, [textElements]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 40, 800),
        height: Math.min(window.innerHeight - 50, 1000),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const generateShareLink = () => {
    if (textElements.length === 0) return window.location.href;
    const firstText = textElements[0];
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('text', firstText.text);
    currentUrl.searchParams.set('x', firstText.position.x);
    currentUrl.searchParams.set('y', firstText.position.y);
    return currentUrl.toString();
  };

  const addNewText = () => {
    const newTextElement = {
      id: nextId,
      text: "Double-click to edit",
      position: { x: 100, y: 100 + (nextId * 30) },
      isEditing: false
    };
    setTextElements([...textElements, newTextElement]);
    setNextId(nextId + 1);
  };

  const handleTextChange = (id, newText) => {
    setTextElements(textElements.map(el =>
      el.id === id ? { ...el, text: newText } : el
    ));
  };

  const handlePositionChange = (id, newPosition) => {
    setTextElements(textElements.map(el =>
      el.id === id ? { ...el, position: newPosition } : el
    ));
  };

  const toggleEditing = (id, isEditing) => {
    setTextElements(textElements.map(el =>
      el.id === id ? { ...el, isEditing } : el
    ));
  };

  const handleDragEnd = (e, id) => {
    const textNode = e.target;
    const textWidth = textNode.width() * textNode.scaleX();
    const textHeight = textNode.height() * textNode.scaleY();
    
    let newX = Math.max(0, Math.min(posterWidth - textWidth, textNode.x()));
    let newY = Math.max(0, Math.min(posterHeight - textHeight, textNode.y()));
    
    handlePositionChange(id, { x: newX, y: newY });
    textNode.position({ x: newX, y: newY });
  };

  const dragBoundFunc = (pos, id) => {
    const textNode = textRefs.current[id];
    if (!textNode) return pos;
    
    const textWidth = textNode.width() * textNode.scaleX();
    const textHeight = textNode.height() * textNode.scaleY();
    
    return {
      x: Math.max(0, Math.min(posterWidth - textWidth, pos.x)),
      y: Math.max(0, Math.min(posterHeight - textHeight, pos.y))
    };
  };

  const downloadPoster = async () => {
    try {
      const dataUrl = await new Promise(resolve => {
        stageRef.current.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
          callback: resolve
        });
      });

      const link = document.createElement('a');
      link.download = 'my-poster.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Couldn't download image. Please try again.");
    }
  };

  const sharePoster = async () => {
    try {
      const shareLink = generateShareLink();
      if (navigator.canShare?.({ url: shareLink })) {
        await navigator.share({
          title: "Edit my poster!",
          text: "Check out and edit this poster!",
          url: shareLink
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      downloadPoster();
    }
  };

  const scale = Math.min(
    dimensions.width / posterWidth,
    dimensions.height / posterHeight
  );

  return (
    <div className="app-container">
      
      {!isMobile && (
        <div className="desktop-buttons">
          <button onClick={addNewText} className="action-button add-button">
            AddText
          </button>
          <button onClick={sharePoster} className="action-button">
            Share
          </button>
          <button onClick={downloadPoster} className="action-button download-button">
            Download
          </button>
        </div>
      )}

      <div className="canvas-wrapper" style={{
        margin: isMobile ? '0' : '60px auto 20px'
      }}>
      <div className="poster-container"
      style={{
       
        overflow:'auto',
        touchAction:'pan-y'
      }}>
        <Stage 
          width={isMobile ? window.innerWidth : dimensions.width} 
          height={isMobile ? window.innerHeight - 80 : dimensions.height} 
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Image 
              image={image} 
              width={posterWidth} 
              height={posterHeight} 
            />
            {textElements.map((element) => (
              <React.Fragment key={element.id}>
                <KonvaText
                  ref={ref => textRefs.current[element.id] = ref}
                  text={element.text}
                  x={element.position.x}
                  y={element.position.y}
                  fontSize={24}
                  fill="#333"
                  draggable
                  onDblClick={() => toggleEditing(element.id, true)}
                  onTap={() => toggleEditing(element.id, true)}
                  onDragEnd={(e) => handleDragEnd(e, element.id)}
                  dragBoundFunc={(pos) => dragBoundFunc(pos, element.id)}
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
        </div>

        {textElements.map((element) => (
          element.isEditing && (
            <input
              key={`input-${element.id}`}
              className="text-edit-input"
              type="text"
              value={element.text}
              autoFocus
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onBlur={() => toggleEditing(element.id, false)}
              onKeyDown={(e) => e.key === 'Enter' && toggleEditing(element.id, false)}
              style={{
                top: `${element.position.y * scale}px`,
                left: `${element.position.x * scale}px`,
                transform: `scale(${1/scale})`,
                transformOrigin: 'top left'
              }}
            />
          )
        ))}
      </div>

      
      {isMobile && (
        <div className="mobile-buttons">
          <button onClick={addNewText} className="action-button add-button">
            Add Text
          </button>
          <button onClick={sharePoster} className="action-button">
            Share
          </button>
          <button onClick={downloadPoster} className="action-button download-button">
            Download
          </button>
        </div>
      )}
    </div>
  );
}
  [
  {
    "origin": ["http://localhost:5173"], 
    "method": ["GET", "POST", "PUT", "OPTIONS"],
 "responseHeader": [
   "Content-Type",
     "Authorization",
      "X-Goog-Resumable",
    "X-Upload-Content-Type",
    "X-Goog-Algorithm",
      "X-Goog-Credential",
   "X-Goog-Date",
    "X-Goog-Expires",
     "X-Goog-SignedHeaders",
      "X-Goog-Signature"
    ],
    "maxAgeSeconds": 3600
  }
]
  */

// App.jsx
import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';


import Admin from './Admin.jsx'; // This is for poster CREATION

import PosterEditPage from './PosterEditPage.jsx';
import UserPersonalizePage from './UserPersonalizepage.jsx'; // <--- NEW: For viewing/editing a specific admin poster
// import UserPosterPage from './UserPosterPage.jsx'; // <--- You'll also need this for the userUrl

// Make sure to define NOTFOUND or import it if it's a separate component
function NOTFOUND() { return <h1>404 - Page Not Found</h1>; }

function MainPageLayout() {
  const [activeTab, setActiveTab] = useState("admin");
  const navigate = useNavigate();
  const[userPosterUrl,setUserPosterUrl]=useState('');

  const handleGoToAdmin = () => {
    navigate('/admin'); // This goes to the creation page
  };
   const getPosterIdFromAppUrl = (url) => {
    if (!url) return null;
    try {
      const urlObject = new URL(url); // Parses the full URL
      const pathSegments = urlObject.pathname.split('/').filter(segment => segment);

      // Expects URLs like http://<domain>/admin/<ID> or http://<domain>/view/<ID>
      if ((pathSegments[0] === 'admin' || pathSegments[0] === 'view') && pathSegments[1]) {
        return pathSegments[1];
      }
    } catch (e) {
      console.warn("Invalid URL entered for user view:", url, e);
      return null;
    }
    return null;
  };

  const handleGoToUser = () => {
    if (!userPosterUrl.trim()) {
      alert("Please enter a Poster URL.");
      return;
    }
    const posterId = getPosterIdFromAppUrl(userPosterUrl);
    if (posterId) {
      navigate(`/user/personalize/${posterId}`); // Navigate to the new personalization page
    } else {
      alert("Invalid Poster URL format. Please use a valid link to a poster (e.g., an admin or view link).");
    }
  };

 return (
    <main>
      <h1>Choose The Site</h1>
      <div className="uiContainer">
        <div className="tabs">
          <div
            className={activeTab === "admin" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("admin")}
          >
            Admin View
          </div>
          <div
            className={activeTab === "user" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("user")}
          >
            User View
          </div>
        </div>

        <div className={activeTab === "admin" ? "tab-content-active" : "tab-content"}>
          <h2>As Admin Create Poster</h2>
          <p className="description">In Here Admin Can Create Poster As They Own</p>
          <button onClick={handleGoToAdmin} className="adminBtn">
            Go To Admin Panel
          </button>
        </div>

        <div className={activeTab === "user" ? "tab-content-active" : "tab-content"}>
          <h2>As User View Poster</h2>
          <p className="description">
            Enter the URL of a poster (e.g., an admin or view link) to personalize it.
          </p>
          <div className="form-group-user-url"> {/* For styling */}
            <input
              type="url"
              placeholder="ENTER ANY POSTER URL"
              value={userPosterUrl}
              onChange={(e) => setUserPosterUrl(e.target.value)}
              className="poster-url-input" // Add a class for styling
            />
          </div>
          <button onClick={handleGoToUser} className="UserBtn">
            Personalize This Poster
          </button>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<MainPageLayout />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='admin/:id' element={<PosterEditPage />} />
      <Route path='/user/personalize/:id' element={<UserPersonalizePage />} /> {/* NEW ROUTE */}
      <Route path='*' element={<NOTFOUND />} />
    </Routes>
  );
}