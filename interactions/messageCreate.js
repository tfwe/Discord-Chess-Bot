const logger = require('../logger');
const { pickBestMove } = require('../monte-carlo');
const CLIENT_ID = process.env.CLIENT_ID
module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Check if the bot has been mentioned
    if (!message.mentions.has(CLIENT_ID)) return;
      await message.channel.sendTyping()
      // const game = await startGame()
      // logger.info(JSON.stringify(game))
      let bestMove = await pickBestMove('rnbqkb1r/1p3ppp/p2p1n2/4p3/4P3/1NN1B3/PPP2PPP/R2QKB1R b KQkq - 1 7') 
      await message.reply(`${bestMove}`)
  }
}
