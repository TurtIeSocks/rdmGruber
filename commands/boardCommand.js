var {
	SlashCommandBuilder
} = require('discord.js');
var fs = require('fs');
var config = require('../config/config.json');
var Boards = require('../functions/boards.js');
var Roles = require('../functions/roles.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(config.discord.boardCommand.toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription('Create new stat board')
		.addSubcommand(subcommand =>
			subcommand
			.setName('current')
			.setDescription('Create current stat board')
			.addStringOption(option =>
				option.setName('board_area')
				.setDescription(`Enter area name`)
				.setRequired(true)
				.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName('history')
			.setDescription('Create history stat board'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('raid')
			.setDescription('Create raid board').addStringOption(option =>
				option.setName('board_area')
				.setDescription(`Enter area name`)
				.setRequired(true)
				.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName('delete')
			.setDescription('Delete board by ID')
			.addStringOption(option =>
				option.setName('message_id')
				.setDescription(`Enter ID of board message`)
				.setRequired(true)
				.setAutocomplete(true))),

	async execute(client, interaction) {
		let channel = await client.channels.fetch(interaction.channelId).catch(console.error);
		let guild = await client.guilds.fetch(interaction.guildId).catch(console.error);
		let userPerms = await Roles.getUserCommandPerms(guild, interaction.user);
		if (userPerms.includes('boards') || userPerms.includes('admin')) {
			if (interaction.options.getSubcommand() === 'current') {
				Boards.beginCurrentBoard(interaction, interaction.message, 'current');
			} else if (interaction.options.getSubcommand() === 'history') {
				Boards.startHistoryBoard(interaction);
			} else if (interaction.options.getSubcommand() === 'raid') {
				Boards.startRaidBoard(interaction);
			}
			if (userPerms.includes('admin')) {
				if (interaction.options.getSubcommand() === 'delete') {
					let boardID = interaction.options.getString('message_id');
					Boards.deleteBoard(client, interaction, boardID);
				}
			}
		} else {
			channel.send(`User *${interaction.user.username}* does not have required board perms`).catch(console.error);
		}
	},
};