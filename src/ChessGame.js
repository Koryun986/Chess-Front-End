import { useEffect, useState } from 'react';
import {Routes, Link, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles/ChessGame.css';
import { capitalizeFirstLetter } from './utils';
import io from "socket.io-client";
import { DISCONNECT_FROM_GAME, GAME_CHANGES, GAME_MOVE, GAME_STARTED, SERVER_URL, WAIT_OPONENT } from './config';
import {Chess} from 'chess.js';
import { Chessboard } from "react-chessboard";
import {socket} from "./App";
import {Alert, AlertTitle, Typography} from "@mui/material"

function ChessGame() {
  const navigate = useNavigate();
  const {search} = useLocation();
  const [gameId, setGameId] = useState(null);
  const [color, setColor] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(null);
  const [turn, setTurn] = useState(null);
  const [fen, setFen] = useState(null);
  const [isMate, setIsMate] = useState(false);


  const onDrop = (sourceSquare, targetSquare) => {
    if(!isYourTurn()) return false;

    socket.emit(GAME_MOVE, gameId, sourceSquare, targetSquare);

    return true;
  }

  const isYourTurn = () => turn == color.toLowerCase()[0];

  const changeGame = (game) => {
    if(game.isCheckmate()) setIsMate(true);
    setGame(game);
    setFen(game.fen())
    setTurn(game.turn())
  }


  useEffect(() => {
    const {id, color} = Object.fromEntries(new URLSearchParams(search));
    setGameId(id);
    setColor(capitalizeFirstLetter(color));
  }, []);

  useEffect(() => {
    socket.on(GAME_STARTED, (chessGame, newGameFen) => {
      const chess = new Chess(newGameFen);
      changeGame(chess);
      setFen(newGameFen);
      setGameStarted(true);
    });

    socket.on(WAIT_OPONENT, () => {
      setGameStarted(false);
      setGame(null);
    });

    socket.on(GAME_CHANGES, (fen) => {
      changeGame(new Chess(fen));
    });

    if(isMate) {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  
    return () => {
      socket.emit(DISCONNECT_FROM_GAME, gameId);
    }
  });

  const toHome = () => {
    socket.emit(WAIT_OPONENT, gameId, color.toLowerCase());
  }

  return (
    <>
    {isMate && <Alert variant="filled" severity="info">   
      <Typography variant="h3">
        <strong>{isYourTurn() ? "Oponent Win" : "You Win Congratulations"}</strong>
      </Typography>
      <Typography variant="h4">
        <strong>Thank you for game!</strong>
      </Typography>
    </Alert>}
    <div className="Chess">
      <div className="Chess_header">
        <div className="Chess_game_id">
          Game Id: {gameId}
        </div>
        <div className="Chess_game_started">
          {gameStarted ? <div>Game Started</div> : <div> Please Wait To Oponent</div>}
        </div>
        <div className="Chess_gamer_color">
          Your Color Are <b>{color}</b>
        </div>
      </div>
      {turn && 
        <div className="Chess_game_turn">
          {isYourTurn() ? "Your Turn" : "Oponents Turn"}
        </div>}
      
      <div className="Chess_container">
        {game &&
        <Chessboard boardWidth="550"
         id="BasicBoard"
         boardOrientation={color && color.toLowerCase()}
          position={fen}
          onPieceDrop ={onDrop}
            />}
      </div>
      <Link className="links" to="/">
          <button type='submit' 
          className='submit_btn'
          onClick={toHome}
          >Go Home</button>
        </Link> 
    </div>

    </>
    
  );
}

export default ChessGame;