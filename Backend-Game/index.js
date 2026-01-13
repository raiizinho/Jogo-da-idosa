import express from "express";
import colors from "colors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors"
import { Server } from "socket.io";
import http from "node:http"

const PORT = process.env.PORT || 5000;

// recria __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// diretório público absoluto
const dirPublic = path.join(__dirname, "public");


const app = express();
const server = http.createServer(app);


// inicializa o Socket.IO
const io = new Server(server, {
    cors: {
        origin: ['http://localhost', 'http://127.0.0.1:5500', "http://localhost:5173"],
        methods: ["GET", "POST"]
    }
})
const jogadores = []
const historicoDeJogadas = []

io.on("connection", async (socket) => {
    jogadores.push(socket.id);
    if (jogadores.length > 2) {
        socket.emit("connectionRefused", { message: "Servidor cheio" });
        socket.disconnect();
        jogadores.pop();
        return;
    }
    console.log(colors.cyan("Jogadores conectados: ", jogadores.length+"\nData: ", jogadores));
    socket.emit("receberId", { playerID: jogadores.length }); // atribui 1 ou 2 com base na ordem de conexão
    socket.on("disconnect", () => {
        console.log("jogador desconectado: ", socket.id);
        jogadores.splice(jogadores.indexOf(socket.id), 1);
        io.emit("gameOver", { message: "O outro jogador desconectou. Fim de jogo." });
    });
    console.log("novo jogador conectado: ", socket.id);
    // lógica de jogo aqui
    socket.on("playerChoice", (data) => {
        if (jogadores.length < 2) {
            return socket.emit("choiceError", { message: "Aguardando o outro jogador..." });
        }
        function verificarVitoria (){
            // lógica de verificação de vitória aqui
            if (historicoDeJogadas.length < 5) return false; // não pode haver vitória antes de 5 jogadas
            // combinações vencedoras
            const winningCombinations = [
                [1,2,3], [4,5,6], [7,8,9], // linhas
                [1,4,7], [2,5,8], [3,6,9], // colunas
                [1,5,9], [3,5,7]           // diagonais
            ];
            for (let combination of winningCombinations) {
                const [a, b, c] = combination;
                const jogadaA = historicoDeJogadas.find(jogada => jogada.choice === a)?.jogada;
                const jogadaB = historicoDeJogadas.find(jogada => jogada.choice === b)?.jogada;
                const jogadaC = historicoDeJogadas.find(jogada => jogada.choice === c)?.jogada;
                if (jogadaA && jogadaA === jogadaB && jogadaA === jogadaC) {
                    return true;
                }
        }
    }
    
    
        if (historicoDeJogadas[historicoDeJogadas.length - 1]?.playerId === data.id) {
            return socket.emit("choiceError", { message: "Não é a sua vez de jogar." });
        }
        if (!data.choice || !data.jogada || !data.id) {
            console.log("Dados inválidos recebidos:", data);
            return;
        }
        var choice = data.choice; // 1 a 9
        var jogada = data.jogada == 1 ? "X" : data.jogada == 2 ? "O" : null; // X ou O
        var playerId = data.id; // id do jogador

        var verificarEscolha = historicoDeJogadas.find(jogada => jogada.choice === choice);
        if (verificarEscolha) {
            return socket.emit("choiceError", { message: "Escolha já feita. Tente outra." });
        }

        historicoDeJogadas.push({
            choice: choice,
            jogada: jogada,
            playerId: playerId
        });
        console.log(historicoDeJogadas);
        io.emit("choiceReceived", {playerId, choice: choice - 1, jogada});
        var venceu = verificarVitoria();
        if (venceu) {
            console.log("Jogador " + data.jogada + " venceu!");
            io.emit("gameOver", { message: `Jogador ${data.username} venceu!` });
            historicoDeJogadas.length = 0; // reseta o histórico de jogadas
            return;
    }
    });
})


// configurar CORS
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1:5500', "http://localhost:5173"],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
// arquivos estáticos
app.use("/static", express.static(dirPublic));

// rota principal
app.get("/", (req, res) => {
    res.sendFile(path.join(dirPublic, "index.html"));
});
// rota de status da API
app.get("/api/status", (req, res) => {
    res.json({ status: "online" });
});

// iniciar o servidor
server.listen(PORT, () => {
    console.log(colors.green(`Servidor rodando em http://localhost:${PORT}`));
});
