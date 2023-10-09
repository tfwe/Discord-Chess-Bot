const logger = require('../logger');
const { randomGame } = require('../chess.js');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Plays a random game')
    .addStringOption(option =>
      option.setName('fen')
        .setDescription('FEN Position to start from')),
  async execute(interaction) {
    await interaction.channel.sendTyping();
    let fen = interaction.options.getString('fen');
    const game = randomGame(fen);
    logger.debug(`loaded game: ${JSON.stringify(game)}`);

    if (game.pgn.length > 2000) {
      const filename = 'random_game_pgn.txt';
      fs.writeFileSync(filename, game.pgn);
      const attachment = new AttachmentBuilder(filename);
      await interaction.reply({ files: [attachment] });
      await unlinkAsync(filename);
    } else {
      await interaction.reply(`\`\`\`${game.pgn}\`\`\``);
    }
  }
}
