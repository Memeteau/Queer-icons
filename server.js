const path=require("path");
const fs=require("fs");
const http=require("http");
const express=require("express");
const {Server}=require("socket.io");
const crypto=require("crypto");
const {createGame,chooseCategory,nextRound,publicState}=require("./game-engine");

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
const cards=JSON.parse(fs.readFileSync(path.join(__dirname,"public","cards.json"),"utf8"));
const rooms=new Map();

app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(_req,res)=>res.json({ok:true,rooms:rooms.size}));

function roomCode(){
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s="";
  for(let i=0;i<5;i++) s+=alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}
function token(){return crypto.randomBytes(16).toString("hex")}
function getRoom(socket){return socket.data.roomCode?rooms.get(socket.data.roomCode):null}
function emitLobby(room){
  io.to(room.code).emit("lobby",{code:room.code,hostId:room.hostId,mode:room.mode,players:room.players.map(p=>({id:p.id,name:p.name}))});
}
function emitGame(room){
  if(!room.game)return;
  for(const p of room.players) io.to(`player:${p.id}`).emit("state",publicState(room.game,room.players,p.id));
}

io.on("connection",socket=>{
  socket.on("create-room",({name,mode},reply=()=>{})=>{
    let code; do code=roomCode(); while(rooms.has(code));
    const player={id:token(),name:String(name||"Joueur 1").slice(0,24),socketId:socket.id};
    const room={code,hostId:player.id,mode:mode==="blind"?"blind":"classic",players:[player],game:null};
    rooms.set(code,room);
    socket.data.roomCode=code; socket.data.playerId=player.id;
    socket.join(code); socket.join(`player:${player.id}`);
    emitLobby(room); reply({ok:true,code,playerId:player.id});
  });

  socket.on("join-room",({code:raw,name},reply=()=>{})=>{
    const code=String(raw||"").trim().toUpperCase();
    const room=rooms.get(code);
    if(!room)return reply({ok:false,error:"Partie introuvable."});
    if(room.game)return reply({ok:false,error:"La partie a déjà commencé."});
    if(room.players.length>=6)return reply({ok:false,error:"Partie complète."});
    const player={id:token(),name:String(name||`Joueur ${room.players.length+1}`).slice(0,24),socketId:socket.id};
    room.players.push(player);
    socket.data.roomCode=code; socket.data.playerId=player.id;
    socket.join(code); socket.join(`player:${player.id}`);
    emitLobby(room); reply({ok:true,code,playerId:player.id});
  });

  socket.on("resume-room",({code:raw,playerId},reply=()=>{})=>{
    const code=String(raw||"").trim().toUpperCase();
    const room=rooms.get(code);
    const player=room?.players.find(p=>p.id===playerId);
    if(!room||!player)return reply({ok:false});
    player.socketId=socket.id;
    socket.data.roomCode=code; socket.data.playerId=player.id;
    socket.join(code); socket.join(`player:${player.id}`);
    room.game?emitGame(room):emitLobby(room);
    reply({ok:true});
  });

  socket.on("set-mode",({mode})=>{
    const room=getRoom(socket);
    if(!room||room.game||socket.data.playerId!==room.hostId)return;
    room.mode=mode==="blind"?"blind":"classic";
    emitLobby(room);
  });

  socket.on("start-game",(_,reply=()=>{})=>{
    const room=getRoom(socket);
    if(!room)return reply({ok:false,error:"Partie introuvable."});
    if(socket.data.playerId!==room.hostId)return reply({ok:false,error:"Seul l’hôte peut commencer."});
    if(room.players.length<2)return reply({ok:false,error:"Il faut au moins 2 joueurs."});
    room.game=createGame(cards,room.players,room.mode);
    emitGame(room); reply({ok:true});
  });

  socket.on("choose-category",({category},reply=()=>{})=>{
    const room=getRoom(socket);
    if(!room?.game)return reply({ok:false,error:"Partie absente."});
    if(room.game.phase!=="choose")return reply({ok:false,error:"Le pli est déjà joué."});
    if(room.game.leaderId!==socket.data.playerId)return reply({ok:false,error:"Ce n’est pas ton tour."});
    try{chooseCategory(room.game,category);emitGame(room);reply({ok:true})}
    catch(e){reply({ok:false,error:e.message})}
  });

  socket.on("next-round",(_,reply=()=>{})=>{
    const room=getRoom(socket);
    if(!room?.game)return reply({ok:false,error:"Partie absente."});
    if(room.game.leaderId!==socket.data.playerId)return reply({ok:false,error:"Seul le leader relance."});
    try{nextRound(room.game);emitGame(room);reply({ok:true})}
    catch(e){reply({ok:false,error:e.message})}
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Queer Icons listening on ${PORT}`));
