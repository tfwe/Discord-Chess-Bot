import { Chess } from 'chess.js'

function randomGame(message) {
  const chess = new Chess()
  while (!chess.isGameOver()) {
    const moves = chess.moves()
    const move = moves[Math.floor(Math.random() * moves.length)]
    chess.move(move)
  }
  const ascii = chess.ascii()
  logger.info(ascii)
  message.channel.send(ascii)
}

