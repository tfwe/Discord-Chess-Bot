const logger = require('../logger');
const { clientId } = require('../config.json');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    const guild = message.guild;
    // Check if the bot has been mentioned
    if (!message.mentions.has(clientId)) return;
    
    // Get the prompt from the message
    const author = message.author.id
    if (author == clientId) return;
  }
}
