import { useState } from 'react'
import styles from './Game.module.css'
import { io } from "socket.io-client"
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

let socket;

function Game() {
  const [playerID, setPlayerID] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || {};
  
  const sendChoice = (choice) => () => {
    socket.emit("playerChoice", { username, id: socket.id, choice: choice + 1, jogada: playerID });
  };
  useEffect(() => {
    if (!username) {
      return navigate("/");
    }
    socket = io("http://localhost:5000", {
      auth: {
        username: username || "Anonymous KKKKKK"
      }
    });
    
    // escuta recusa de conexão
    socket.on("connectionRefused", (data) => {
      alert(data.message);
    socket.disconnect()
    return navigate("/");
  });

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
    if (data.message.includes("desconectou")) {
      alert(data.message);
      setBoard(Array(9).fill(null)); // reseta o tabuleiro
      navigate("/");
      return;
    }
    alert(data.message);
    setBoard(Array(9).fill(null)); // reseta o tabuleiro
  });

  // escuta o ID do jogador atribuído pelo servidor
  socket.on("receberId", (data) => {
    if (playerID !== null) return; // já temos um ID de jogador
    setPlayerID(data.playerID); // 1 ou 2
  })
  return () => {
    socket.disconnect();
  };
}, []);


  return (
    <>
      <div className={styles.jogo_container}>
        <div className={styles.info_status}>
        <h1>Jogo da Idosa</h1>
        <div className={styles.info}>
        <p>Nome de usuário: {username}</p>
        {playerID ? <p>Você é o Jogador {playerID} ({playerID === 1 ? "X" : "O"})</p> : <p>Aguardando atribuição de jogador...</p>}
        {}
        </div>
        </div>
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

export default Game;
