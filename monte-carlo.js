const logger = require('./logger');
const { newGame, getAvailableMoves, getLastMove, applyMoves, randomGame } = require('./chess.js')

class Node {
  constructor(move, turn, parent=null) {
    this.move = move;
    this.turn = turn;
    this.timesPlayed = 0;
    this.timesWon = 0;
    this.winRate = 0
    this.parent = parent;
  }
}

function buildTree(fen) {
  const MAX_DEPTH = 1;
  const tree = {
    fen: fen,
    depth: MAX_DEPTH,
    leafNodes: [],
  }
  let lastMove
  lastMove = getLastMove(fen)
  if (!lastMove) {
    lastMove = {
      color: "black"
    }
  }
  let rootNode 
  if (lastMove) {
    rootNode = new Node(lastMove.move, lastMove.color);
  }
  let currentNode = rootNode;
  let parentNode = rootNode;
  const availableMoves = getAvailableMoves(fen);
  if (availableMoves.length == 0) {
    return;
  }
  let depth
  let opp = (lastMove.color == "white") ? "black" : "white"
  for (let i of availableMoves) {
    depth = 0
    while (depth <= MAX_DEPTH) {
      parentNode = currentNode
      currentNode = new Node(i, (depth % 2 == 0) ? opp : lastMove.color, parentNode);
      depth += 1;
    }
    tree.leafNodes.push(currentNode)
  }
  return tree
}
async function updateTree(leafNodes, fen) {
  for (let leafNode of leafNodes) {
    let moves = []
    let node = leafNode
    while (node) {
      moves.push(node.move)
      node = node.parent
    }
    moves = moves.reverse()
    let fenToTest = applyMoves(fen, moves)
    let testGame = randomGame(fenToTest)
    node = leafNode
    while (node) {
      node.timesPlayed += 1
      if (node.turn == testGame.result) {
        node.timesWon += 1
      }
      node.winRate = node.timesWon / node.timesPlayed
      node = node.parent
    }
  }
}

function startGame() {
  const startFen = newGame().fen
  let tree = buildTree(startFen)
  updateTree(tree.leafNodes, startFen)
  let highestWinRateNode

  while (tree.leafNodes.length >= 1) {
    highestWinRateNode = tree.leafNodes[0]
    for (let i of tree.leafNodes) {
      if (i.winRate >= highestWinRateNode.winRate) {
        highestWinRateNode = i
      }
    }
    let currentNode = highestWinRateNode
    while (currentNode.parent) {
      currentNode = currentNode.parent
    }
    let moveQueue = []
    moveQueue.push(currentNode.move)
    tree = buildTree(applyMoves(tree.fen, moveQueue))
    updateTree(tree.leafNodes, tree.fen)
  }
  logger.info(JSON.stringify(tree))
  return tree.pgn
}

module.exports = { startGame }
