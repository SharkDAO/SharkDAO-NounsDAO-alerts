import { config, getContract, getImage, getSupply } from './config.js';

import { Client, Intents, MessageEmbed, MessageAttachment } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

var current_supply = 51;

async function checkSupply() {
  const new_current_supply = await getSupply();
  if (current_supply == 0) {
    current_supply = new_current_supply;
    console.log(`current_supply: ${current_supply}`);
  } else if (new_current_supply > current_supply) {
    for (let i = current_supply; i < new_current_supply; i++) {
      const png = await getImage(i);
      const attachmentName = `Auction-${i}.png`;
      const attachment = new MessageAttachment(png, attachmentName);
      console.log(`Noun ${i}`);
      current_supply = new_current_supply;
      const message = new MessageEmbed()
        .setTitle(`*** Noun ${i} is live! ***`)
        .setDescription("What do we think of this new Noun??? You can vote for more than 1!")
        .addField('Voting guide', "🔥 (it's amazing)\n\n🪙 (if it's value)\n\n✅ (it's good looking)\n\n♻️ (pass, even if it's cheap)", false)
        .addField('Got any comments?', "Chat in the thread below!", false)
        .setImage(`attachment://${attachmentName}`)
        .setTimestamp();
      await client.channels.cache.get(config.discord_channel).send({ embeds: [message], files:[attachment] }).then(m => {
        m.react('🔥');
        m.react('🪙');
        m.react('✅');
        m.react('♻️');
        m.startThread({
          name: `Noun ${i}`,
          autoArchiveDuration: 60*24,
          reason: 'Talk amongst yourselves',
        });
      });
    }
  }
}   

const seconds = 10, the_interval = seconds * 1000;
setInterval(function() { checkSupply();}, the_interval);

await getContract();
client.login(config.DISCORD_KEY);
