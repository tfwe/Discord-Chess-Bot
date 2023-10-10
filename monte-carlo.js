const logger = require('./logger');
const { newGame, getAvailableMoves, getLastMove, applyMoves, randomGame, } = require('./chess.js')

class Node {
  constructor(move, turn="white", parent=null) {
    this.move = move;
    this.turn = turn;
    this.timesPlayed = 0;
    this.timesWon = 0;
    this.winRate = 0
    this.depth = (parent == null) ? 0 : parent.depth + 1
    this.parent = parent;
  }
}

async function fenToNode(fen) {
  let lastMove
  let node
  lastMove = await getLastMove(fen)
  if (lastMove) {
    node = new Node(lastMove.move, lastMove.color)
  }
  return node
}

async function fenFromNode(node) {
  let game = await newGame()
  let fen = game.fen
  if (!node) return fen
  let moves = []
  while (node) {
    moves.push(node.move)
    node = node.parent
  }
  if (moves.length == 0) {
    return fen
  }
  // logger.info(JSON.stringify(moves))
  moves = moves.reverse()
  fen = await applyMoves(fen, moves) 
  return fen
}

async function expansion(node=null) {
  const fen = await fenFromNode(node)
  const availableMoves = await getAvailableMoves(fen)
  let leafNodes = []
  for (let i of availableMoves) {
    let newNode
    if (node) {
      newNode = new Node(i, (node.turn == "black") ? "white" : "black", node)
    }
    else {
      newNode = new Node(i)
    }
    leafNodes.push(newNode)
  }
  
  return leafNodes
}

// async function selection(leafNodes) {
//   let selectedNode
//   if (leafNodes.length > 1) {
//     leafNodes.sort((a, b) => {
//       aScore = a.timesPlayed - Math.sqrt(a.depth)
//       bScore = b.timesPlayed - Math.sqrt(b.depth)
//       if (a.timesPlayed == 0) {
//         aScore += 1
//       }
//       if (b.timesPlayed == 0) {
//         bScore += 1
//       }
//       if (aScore < bScore) {
//         return -1
//       }
//       else if (aScore > bScore) {
//         return 1
//       }
//       else {
//         return 0
//       }
//     })
//     selectedNode = leafNodes[leafNodes.length-1]
//   } 
//   else if (leafNodes.length == 1) {
//     selectedNode = leafNodes[0]
//   }
//   return selectedNode
// }

async function selection(leafNodes) {
  let selectedNode
  if (leafNodes.length > 1) {
    let totalPlays = leafNodes.reduce((sum, node) => sum + node.timesPlayed, 0);
    leafNodes.sort((a, b) => {
      let aUCB1 = a.winRate + Math.sqrt((2 * Math.log(totalPlays)) / a.timesPlayed);
      let bUCB1 = b.winRate + Math.sqrt((2 * Math.log(totalPlays)) / b.timesPlayed);
      return bUCB1 - aUCB1;
    })
    selectedNode = leafNodes[0];
  } else if (leafNodes.length == 1) {
    selectedNode = leafNodes[0];
  }
  return selectedNode;
}

async function simulation(selectedNode) {
  if (!selectedNode) {
    throw new Error('cannot simulate null node')
  }
  let fen = await fenFromNode(selectedNode)
  let gameObj = await randomGame(fen)
  if (!gameObj) {
    throw new Error('cannot simulate invalid game')
  }
  return gameObj
}

async function update(selectedNode, gameObj) {
  if (!gameObj) {
    throw new Error('cannot update nodes with invalid game result in gameObj')
  }
  while (selectedNode) {
    if (gameObj.result == selectedNode.turn)
      selectedNode.timesWon += 1
    selectedNode.timesPlayed += 1
    selectedNode.winRate = selectedNode.timesWon / selectedNode.timesPlayed
    selectedNode = selectedNode.parent
  }
}

async function pickBestMove(fen) {
  let node = await fenToNode(fen)
  let leafNodes
  let selectedNode
  let explored = []
  leafNodes = await expansion(node)
  if (leafNodes.length == 0) return
  selectedNode = leafNodes[0]
  let count = 0
  while (leafNodes.length >= 1) {
    selectedNode = await selection(leafNodes)
    logger.info(JSON.stringify(selectedNode))
    if (explored.includes(selectedNode)) {
      let newNodes = await expansion(selectedNode)
      if (!newNodes) {
        let deleteIndex = leafNodes.indexOf(selectedNode)
        leafNodes = leafNodes.slice(0, deleteIndex - 1).concat(leafNodes.slice(deleteIndex+1,leafNodes.length-1));
      }
      leafNodes = leafNodes.concat(newNodes)
    }
    else {
      let gameObj = await simulation(selectedNode)
      count += 1
      await update(selectedNode, gameObj)
      explored.push(selectedNode)
    }
    if (count >= 100) {
      break
    }
  }
  if (leafNodes)
    selectedNode = await selection(leafNodes)
  let currentNode = selectedNode
  while (currentNode.parent) {
    currentNode = currentNode.parent
  }
  return currentNode.move
}

module.exports = { pickBestMove }
