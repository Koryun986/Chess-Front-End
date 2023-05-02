import {Routes, Link, Route, useNavigate } from 'react-router-dom';
import "./styles/App.css";
import { useState } from 'react';
import io from "socket.io-client";
import {GAME_STARTED ,SERVER_URL, SOCKET_CREATE_GAME, SOCKET_ENTRY_GAME } from './config';
import {Alert, AlertTitle, Typography} from "@mui/material"

export const socket = io.connect(SERVER_URL);


function App() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isWarning, setIsWarning] = useState(false);

  const handleInputChange = ({target: {value}}) => {
    setInputText(value);
  };

  const handleClick = (e) => {
    if(inputText == null || inputText.length == 0){
      e.preventDefault();
    }else {
      const game = +inputText;
      socket.emit(SOCKET_ENTRY_GAME, game);
      socket.on(SOCKET_ENTRY_GAME, ({ifExist, color}) => {
        if(ifExist) {
          navigate("/game?id=" + game +"&color="+color);
        }else{
          setIsWarning(true);
          setTimeout(() => {
            setIsWarning(false);
          }, 3000)
        }
      })
    }
  };

  const createNewGame = () => {
    socket.emit(SOCKET_CREATE_GAME);
    socket.on(SOCKET_CREATE_GAME, ({game, color}) => {
      navigate("/game?id="+game +"&color="+color);
    })
  }

  return (
    <>
    {isWarning && 
    <Alert variant="filled" severity="error">   
      <Typography variant="h3">
        <strong>Oops!</strong>
      </Typography>
      <Typography variant="h4">
        <strong>This Game Is Not Exist!</strong>
      </Typography>
    </Alert>}
    <div className="App">
      <Link className="links">
        <button type='submit' 
        className='submit_btn'
        onClick={createNewGame}
        >Create Game</button>
      </Link>    
      
      <form >
        <label>Game Id</label> <br/>
        <input type="number"
          value={inputText}
          onChange={handleInputChange}
          required
         />
        <br/>
        <Link className='links'>
          <button className='submit_btn'
          onClick={handleClick}
          >Enter Game</button>
        </Link>  
      </form>

       
    </div>
    
    </>
    
  );
}

export default App;
