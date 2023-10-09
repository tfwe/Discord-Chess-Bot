const logger = require('../logger');
const { startGame } = require('../monte-carlo');
const CLIENT_ID = process.env.CLIENT_ID
module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Check if the bot has been mentioned
    if (!message.mentions.has(CLIENT_ID)) return;
      await message.channel.sendTyping()
      const game = await startGame()
      logger.info(JSON.stringify(game))
      await message.reply(`${game}`)
  }
}
