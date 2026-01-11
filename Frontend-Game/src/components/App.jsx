import { useState } from 'react'
import styles from './App.module.css'
import { io } from "socket.io-client"
import { useEffect } from 'react'

let socket;

function App() {
  const [playerID, setPlayerID] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));

  const sendChoice = (choice) => () => {
    console.log("Escolha enviada:", choice);
    socket.emit("playerChoice", { id: socket.id, choice: choice + 1, jogada: playerID });
  };
  useEffect(() => {
  socket = io("http://localhost:5000");

  // escuta erros de escolha
  socket.on("choiceError", (data) => {
    alert("Erro: " + data.message);
  });

  
  // escuta confirmação de escolha recebida e atualiza o estado do jogo
  socket.on("choiceReceived", ({ choice, jogada }) => {
    setBoard(prev => {
      const next = [...prev];
      next[choice] = jogada;
      return next;
    });
  });
  
  // escuta fim de jogo
  socket.on("gameOver", (data) => {
    alert(data.message);
    setBoard(Array(9).fill(null)); // reseta o tabuleiro
  });

  // escuta o ID do jogador atribuído pelo servidor
  socket.on("receberId", async (data) => {
    if (playerID !== null) return; // já temos um ID de jogador
    setPlayerID(data.playerID); // 1 ou 2
    console.log("Meu ID de jogador é:", data.playerID);
  })
  return () => {
    socket.disconnect();
  };
}, []);


  return (
    <>
      <div className={styles.jogo_container}>
        <h1>Jogo da Idosa</h1>
        <div className={styles.jogo_content}>
          {/* Conteúdo do jogo vai aqui */}
          <div className={styles.squares}>
            {board.map((value, index) => (
              <div key={index} className={styles.square}><button className={styles.square_click} onClick={sendChoice(index)}>{value}</button></div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
