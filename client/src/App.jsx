import { useState, useEffect } from 'react'
import {socket} from './socket';
import './App.css'

function App() {
  const [myUsernames, setMyUsernames] = useState([]);
  const [totalUsers, setTotalUsers] = useState(1);
  const [allUsernames, setAllUsernames] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [isNamed, setIsNamed] = useState(false)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [error, setError] = useState("")

  
  useEffect(()=>{
    socket.on("connect", ()=>{
      setIsConnected(true);
      sessionStorage.getItem("socketChatUsername") != undefined && newNameFunc(JSON.parse(sessionStorage.socketChatUsername))
      console.log(socket.id)
    })
    socket.on("disconnect", ()=>{
      setIsConnected(false);
      socket.emit("erase names", [...myUsernames])
    })
    socket.on("update", (msgs, num)=>{
      setChatLog(msgs);
      setTotalUsers(num);
      document.getElementById('chatLog').scrollTop = document.getElementById('chatLog').scrollHeight
    })
    socket.on("update usernames", (updatedNames) => {
      setAllUsernames(updatedNames)
    })
  }, [])

  function sendMsg(e) {
    e.preventDefault();
    let newMSG = e.target.newMSG.value
    if (newMSG.length < 1) {
      return;
    }
    socket.emit("msg", newMSG);
    e.target.reset()
  }

  function handleName(e, callback) {
    e.preventDefault()
    let newName = e.target.userName.value;
    if (allUsernames.includes(newName) && !myUsernames.includes(newName)) {
      setError("User already exists")
      e.target.userName.style.backgroundColor = "red";
      setTimeout(()=>{
        e.target.userName.style.backgroundColor = "rgba(0,0,0,0.4)";
        setError("")
      }, 2000)
    } else if (newName.length < 2) {
      setError("Username must be at least 2 characters long")
      e.target.userName.style.backgroundColor = "red";
      setTimeout(()=>{
        e.target.userName.style.backgroundColor = "rgba(0,0,0,0.4)";
        setError("")
      }, 2000)
    } else {
      callback(newName)
    }
    e.target.reset()
  }

  function newNameFunc(newName) {
      socket.emit("join lobby", newName)
      setMyUsernames([newName]);
      sessionStorage.setItem("socketChatUsername", JSON.stringify(newName))
      setIsNamed(true)
  }

  function changeNameFunc(newName) {
      socket.emit("change username", newName);
      sessionStorage.setItem("socketChatUsername", JSON.stringify(newName))
      setMyUsernames([newName, ...myUsernames]);
  }
  
  return (
    <>
      {!isNamed
        ? <>
            <div id='spinSocket'></div>
            
            <header className='pageHead'>
              <div id='welcomeBox'>
                <h1 id='welcomeTitle'>Choose a name to start Chatting!</h1>
                <p className='errorMsg'>{error}</p>
              </div>
              <form id='nameHandler' onSubmit={(e) => {handleName(e, newNameFunc)}}> 
                <input id='userName' name='userName' placeholder='Choose username...' />
                <button type='submit'>Enter Chat</button>
              </form>
              
              
            </header>
          </>
        : <>
            <header className='pageHead'>
              <div id='welcomeBox'>
                <h1 id='welcomeTitle'>{isConnected ? `Chatting as ${myUsernames[0]}` : "Disconnected"}</h1>
                <small id='welcomeMsg'>Welcome to our Socket Space!</small><br></br>
                <small id='userCount'>{totalUsers} {totalUsers > 1 ? "users" : "user"} chatting</small>
              </div>
              <form id='nameHandler' onSubmit={(e)=> {handleName(e, changeNameFunc)}}> 
                <input id='userName' name='userName' placeholder='Change username...' />
                <button type='submit'>Change</button>
              </form>
              <p className='errorMsg'>{error}</p>
            </header>
            <section id='chatLog'>{
              chatLog.map((x, idx) => (
                  myUsernames.includes(x.user)
                    ? <p key={idx} className="myMsg">{x.msg}</p>
                    : x.user === ''
                      ? <p key={idx} className='hostMsg'>{x.msg}</p>
                      : <p key={idx}>{x.user}:&nbsp;{x.msg}</p>
              ))}
            </section>
            <form id='newMsgHandler' onSubmit={sendMsg}>
              <textarea id='newMSG' type='submit' onKeyUp={(e)=>{
                if (e.key === 'Enter') {
                  sendMsg({
                    preventDefault: ()=>{null}, 
                    target: document.forms['newMsgHandler']
                  })
                }
              }}/>
              <button type='submit'>Send</button>
            </form>
          </>}
    </>
  )
}

export default App
