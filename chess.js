const logger = require('./logger');
const { Chess } = require('chess.js')

function newGame() {
  const chess = new Chess()
  const gameState = {
    turn: "white",
    fen: chess.fen()
  } 
  return gameState
}

function randomGame(fen) {
  const gameState = {
    result: "",
    pgn: ""
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

function getAvailableMoves(fen) {
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

function getLastMove(fen) {
  const lastMove = {
    move: "",
    turn: "",
  }
  const chess = new Chess()
  try {
    chess.load(fen)
    let undo = chess.undo()
    lastMove.move = undo.san
    lastMove.turn = (undo.color == "w") ? "white" : "black"
  }
  catch(error) {
    logger.error(error)
  }
  return lastMove
}

function applyMoves(fen, moves) {
  try {
    const chess = new Chess()
    chess.load(fen)
    for (let i of moves) {
      chess.move(i)
    }
    fen = chess.fen() 
  }
  catch (error) {
    logger.error(error)
    fen = ""
  }
  return fen
}
module.exports = { newGame, randomGame, getAvailableMoves, getLastMove, applyMoves }
