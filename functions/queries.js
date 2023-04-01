var {
   ActionRowBuilder,
   StringSelectMenuBuilder,
   EmbedBuilder
} = require('discord.js');
var fs = require('fs');
var mysql = require('mysql2');
var config = require('../config/config.json');
var queryConfig = require('../config/queries.json');

module.exports = {
   queries: async function queries(channel) {
      var selectList = [];
      queryConfig.custom.forEach(query => {
         let listOption = {
            label: query.name,
            value: `${config.serverName}~customQuery~${query.name}`
         }
         selectList.push(listOption);
      });
      let fullQueryList = new ActionRowBuilder()
         .addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(`${config.serverName}~queryList`)
            .setPlaceholder('Custom query list')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(selectList))

      channel.send({
         content: 'Select query below to run',
         components: [fullQueryList]
      }).catch(console.error);
   }, //End of queries()


   customQuery: async function customQuery(channel, user, queryName, queryFull) {
      var dbConfig = config.rdmDB;
      dbConfig.multipleStatements = true;
      let connection = mysql.createConnection(dbConfig);
      connection.connect();
      var queryEmbed = new EmbedBuilder().setTitle(`${queryName} Results:`);
      connection.query(queryFull, function (err, results) {
         if (err) {
            console.log(`(${user.username}) custom query error:`, err);
         } else {
            console.log(`(${user.username}) ran custom query: ${queryName}`);
            var queryResults = results;
            if (!queryFull.replace(';', '').includes(';')) {
               queryResults = [results];
            }
            for (var r in queryResults) {
               for (const [key, value] of Object.entries(queryResults[r][0])) {
                  queryEmbed.addFields({
                     name: key,
                     value: value.toLocaleString()
                  });
               }
            } //End of r loop
            channel.send({
               embeds: [queryEmbed],
            }).catch(console.error);
         }
      }) //End of query
      connection.end();
   }, //End of customQuery()
}