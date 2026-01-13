import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Home.module.css'

function Home() {
    const navigate = useNavigate();
    const inputRef = useRef(null); 
   useEffect(() => {
    inputRef.current.focus()
   }, [])
    return (
        <>
        <div className={styles.home_container}>
            <h1>Bem-vindo ao Jogo da Idosa!</h1>
            <p>Para começar a jogar, clique no botão abaixo:</p>
            <input ref={inputRef} type="text" name="username" id="username" className={styles.username}
            onKeyDown={(e) => {
                if (e.key == "Enter") {
                    const username = document.getElementById("username").value;
                    if (username.trim() === "") {
                        alert("Por favor, insira um nome de usuário.");
                        return;
                    }
                    navigate("/game", {state: {username}});
                }
            }}
            />
            
            <button className={styles.button} onClick={() => {
                const username = document.getElementById("username").value;
                if (username.trim() === "") {
                    alert("Por favor, insira um nome de usuário.");
                    return;
                }
                navigate("/game", {state: {username}});
            }}>Iniciar Jogo</button>
        </div>
        </>
    )
}
export default Home;