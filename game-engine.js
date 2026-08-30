function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function createGame(cards, players, mode = "classic") {
  if (!Array.isArray(cards) || cards.length < players.length) throw new Error("Not enough cards");
  if (players.length < 2 || players.length > 6) throw new Error("Players must be 2–6");
  if (!["classic","blind","superblind"].includes(mode)) throw new Error("Invalid game mode");
  const hands = Object.fromEntries(players.map(p => [p.id, []]));
  shuffle(cards).forEach((card, i) => hands[players[i % players.length].id].push(card));
  return { mode, totalCards:cards.length, phase:"choose", round:1, leaderId:players[0].id, hands, pot:[], selectedCategory:null, reveal:null, winnerId:null };
}
function livingPlayerIds(game) {
  return Object.entries(game.hands).filter(([, hand]) => hand.length > 0).map(([id]) => id);
}
function fullDeckWinner(game) {
  if (game.pot.length) return null;
  const total = game.totalCards || Object.values(game.hands).reduce((n,h)=>n+h.length,0);
  return Object.entries(game.hands).find(([,hand])=>hand.length===total)?.[0] || null;
}
function settleLastPlayer(game) {
  const living=livingPlayerIds(game);
  if(living.length===1 && game.pot.length){
    game.hands[living[0]].push(...game.pot);
    game.pot=[];
    game.leaderId=living[0];
  }
  game.winnerId=fullDeckWinner(game);
  return game.winnerId;
}
function chooseCategory(game, category) {
  if (game.phase !== "choose") throw new Error("Wrong phase");
  const alive = livingPlayerIds(game);
  if (!alive.includes(game.leaderId)) game.leaderId = alive[0];
  if(alive.length < 2){ settleLastPlayer(game); return {winnerId:game.winnerId,tied:[],max:null}; }

  const contenders = alive.map(id => {
    const card = game.hands[id][0];
    const value = Number(card.scores[category]);
    if (!Number.isFinite(value)) throw new Error("Invalid score");
    return { id, card, value };
  });

  const max = Math.max(...contenders.map(x => x.value));
  const tied = contenders.filter(x => x.value === max);
  const played = contenders.map(x => game.hands[x.id].shift());

  let winnerId = null;
  if (tied.length === 1) {
    winnerId = tied[0].id;
    const prize = [...game.pot, ...played];
    game.pot = [];
    game.hands[winnerId].push(...prize);
    game.leaderId = winnerId;
  } else {
    game.pot.push(...played);
    if (!tied.some(x => x.id === game.leaderId)) game.leaderId = tied[0].id;
    settleLastPlayer(game);
  }

  game.phase = "result";
  game.selectedCategory = category;
  game.reveal = contenders.map(x => ({playerId:x.id, card:x.card, value:x.value, winner:x.value === max}));
  game.winnerId = fullDeckWinner(game) || game.winnerId;
  return { winnerId, tied:tied.map(x=>x.id), max };
}
function nextRound(game) {
  if (game.phase !== "result") throw new Error("Wrong phase");
  if (game.winnerId) return game;
  settleLastPlayer(game);
  if(game.winnerId) return game;
  game.round += 1;
  game.phase = "choose";
  game.selectedCategory = null;
  game.reveal = null;
  const alive = livingPlayerIds(game);
  if (!alive.includes(game.leaderId)) game.leaderId = alive[0];
  return game;
}
function publicState(game, players, viewerId) {
  const viewerHand = game.hands[viewerId] || [];
  const top = viewerHand[0] || null;
  const canChoose = game.phase === "choose" && game.leaderId === viewerId && !!top;
  const ownCard = top ? JSON.parse(JSON.stringify(top)) : null;

  if (ownCard && (game.mode === "blind" || game.mode === "superblind") && game.phase === "choose") {
    ownCard.scores = Object.fromEntries(Object.keys(ownCard.scores).map(k => [k, null]));
  }
  if (ownCard && game.mode === "superblind" && game.phase === "choose") {
    ownCard.comments = Object.fromEntries(Object.keys(ownCard.comments || {}).map(k => [k, null]));
  }

  return {
    mode:game.mode, phase:game.phase, round:game.round, leaderId:game.leaderId,
    potCount:game.pot.length, selectedCategory:game.selectedCategory, winnerId:game.winnerId,
    canChoose, ownCard,
    players:players.map(p=>({id:p.id,name:p.name,count:(game.hands[p.id]||[]).length,isLeader:p.id===game.leaderId})),
    reveal:game.phase === "result" ? game.reveal : null
  };
}
module.exports = { shuffle, createGame, chooseCategory, nextRound, publicState, livingPlayerIds, fullDeckWinner, settleLastPlayer };
