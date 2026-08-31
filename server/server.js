import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const rooms=new Map();
const PORT=process.env.PORT||10000;
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
const send=(ws,type,data={})=>ws.readyState===WebSocket.OPEN&&ws.send(JSON.stringify({type,...data}));
function snapshot(r){return{code:r.code,hostId:r.hostId,players:[...r.players.values()].map(p=>({id:p.id,name:p.name})),state:r.state||null}}
function broadcast(r,type,data={}){for(const p of r.players.values())send(p.ws,type,data)}
function roomState(r){broadcast(r,'room',snapshot(r))}
function leave(ws){const r=rooms.get(ws.room);if(!r)return;r.players.delete(ws.pid);if(!r.players.size){rooms.delete(r.code);return}if(r.hostId===ws.pid)r.hostId=[...r.players.keys()][0];roomState(r)}
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'application/json','access-control-allow-origin':'*'});res.end(JSON.stringify({ok:true,service:'queer-icons-multiplayer',rooms:rooms.size}))});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{ws.pid=crypto.randomUUID();send(ws,'hello',{id:ws.pid});ws.on('message',buf=>{let m;try{m=JSON.parse(buf)}catch{return}if(m.type==='create'){let c;do c=code();while(rooms.has(c));const r={code:c,hostId:ws.pid,players:new Map(),state:null};r.players.set(ws.pid,{id:ws.pid,name:String(m.name||'Joueur').slice(0,24),ws});rooms.set(c,r);ws.room=c;roomState(r);return}if(m.type==='join'){const c=String(m.code||'').trim().toUpperCase(),r=rooms.get(c);if(!r)return send(ws,'error',{message:'Partie introuvable'});if(r.players.size>=6)return send(ws,'error',{message:'Partie complète'});r.players.set(ws.pid,{id:ws.pid,name:String(m.name||'Joueur').slice(0,24),ws});ws.room=c;roomState(r);return}const r=rooms.get(ws.room);if(!r)return;if(m.type==='state'&&r.hostId===ws.pid){r.state=m.state;broadcast(r,'state',{state:r.state})}else if(m.type==='action'){const player=r.players.get(ws.pid);if(player)broadcast(r,'action',{playerId:ws.pid,name:player.name,action:m.action,payload:m.payload})}else if(m.type==='ping')send(ws,'pong')});ws.on('close',()=>leave(ws));ws.on('error',()=>leave(ws))});
server.listen(PORT,'0.0.0.0',()=>console.log(`Queer Icons multiplayer on ${PORT}`));
