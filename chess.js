const logger = require('./logger');
const { Chess } = require('chess.js')

async function newGame() {
  const chess = new Chess()
  const gameState = {
    turn: "white",
    fen: chess.fen()
  } 
  return gameState
}

async function randomGame(fen) {
  let gameState = {
    result: null,
    pgn: null
  }
  const chess = new Chess()
  if (fen)
  try {
    chess.load(fen)
  }
  catch (error) {
    logger.error(error)
    return gameState
  }
  while (!chess.isGameOver()) {
    const moves = chess.moves()
    const move = moves[Math.floor(Math.random() * moves.length)]
    chess.move(move)
  }
  if (chess.isDraw()) {
    gameState.result = "draw"
  }
  else if (chess.isCheckmate()) {
    const lastMove = chess.undo()
    if (chess.turn() == "w") {
      gameState.result = "white"
    }
    else {
      gameState.result = "black"
    }
    chess.move(lastMove)
  }
  gameState.pgn = chess.pgn()
  logger.info(chess.ascii())
  return gameState
}

async function getAvailableMoves(fen) {
  const chess = new Chess()
  try {
    chess.load(fen)
    return chess.moves()
  }
  catch(error) {
    logger.error(error)
    return []
  }
}

async function getLastMove(fen) {
  let lastMove 
  const chess = new Chess()
  try {
    chess.load(fen)
  }
  catch(error) {
    logger.error(error)
    return lastMove
  }
  let undo = chess.undo()
  if (!undo) { // start of the game
    return lastMove 
  }
  lastMove.move = undo.san
  lastMove.turn = (undo.color == "w") ? "white" : "black"
  return lastMove
}

async function applyMoves(fen, moves) {
  // try {
    const chess = new Chess()
    chess.load(fen)
    for (let i of moves) {
      chess.move(i)
    }
    fen = chess.fen()
  // }
  // catch (error) {
  //   logger.error(error)
  //   fen = ""
  // }
  return fen
}
module.exports = { newGame, randomGame, getAvailableMoves, getLastMove, applyMoves }
