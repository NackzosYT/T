const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setGame(`Secrecy , Server`,"http://twitch.tv/nackzos")
  console.log(' Bot Is Online')
});


client.on('guildMemberAdd', (member) => {
member.addRole(member.guild.roles.find('name', 'Nine'));
});


client.on('message', message => {
     if (message.author.bot) return;
    if (message.content.startsWith("رابط")) {
        message.channel.createInvite({
        thing: true,
        maxUses: 100,
        maxAge: 36000,
    }).then(invite =>
      message.author.sendMessage(invite.url)
    )
    const embed = new Discord.RichEmbed()
        .setColor("RANDOM")
          .setDescription(" تم أرسال الرابط على الخاص ")


      message.channel.sendEmbed(embed).then(message => {message.delete(10000)})
              const Embed11 = new Discord.RichEmbed()
        .setColor("RANDOM")
        
    .setDescription("اتفضل رابط خاص فيك")
      message.author.sendEmbed(Embed11)
    }
});


// !$say

client.on('message', message => {
          var prefix = "N";
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

// !$say
  if (command === "say") {
          message.delete()
    message.channel.sendMessage(args.join(" ")).catch(console.error);
  }
  
 

if (command == "emb") {
    let say = new Discord.RichEmbed()
  .setThumbnail(message.author.avatarURL)  
  .setAuthor(message.author.username)
    .setDescription(args.join("  "))
    .setColor(0x00AE86)
    message.channel.sendEmbed(say);
    message.delete();
  }


});






client.on('message', msg => {
  if (msg.content === 'السلام عليكم') {
    msg.reply('**وعليكم السلام**');
  }
});




client.on('message', message => {
          var prefix = "N";
    if(message.content.startsWith(prefix + 'avatar')) {
        var mentionned = message.mentions.users.first();
          var getvalueof;
          var bot;
          if(mentionned) {
            getvalueof = mentionned;
          } else {
            getvalueof = message.author;
          }
          let avatar = new Discord.RichEmbed()
          .setTitle(`${getvalueof.username}\'s Avatar`)
          .setImage(`${getvalueof.avatarURL}`);
          message.channel.sendEmbed(avatar);
      }
});





client.on('ready', () => {
  console.log(`Secrecy`);

});
//Hixx
client.on('message', message => {
if (message.content.split(' ')[0] == 'Nbc2')
 message.guild.members.forEach( member => {
         if (!message.member.hasPermission("ADMINISTRATOR"))  return;
member.send( `${member} ! ` + "**" + message.guild.name + " : ** " + message.content.substr(3));
                                                            message.delete();
});
});





 client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find('name', '『ωєℓcσмє』');
  if (!channel) return;
  let memberavatar = member.user.avatarURL
  let embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setThumbnail(memberavatar)
    .addField('**Welcome To Secrecy,Server** :rose: ***:*** ',`**[${member}]**`)
    .addField('***انت العضو رقم***',`**[${member.guild.memberCount}]**`)
    channel.send({embed:embed});
}
);



 client.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find('name', '『ωєℓcσмє』');
  if (!channel) return;
  let memberavatar = member.user.avatarURL
  let embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setThumbnail(memberavatar)
    .addField('***3/> ..رحل يروح ويجي غيره: ّ ( ***',`**[${member}]**`)
    .addField('***عدد الاعضاء الان***',`**[${member.guild.memberCount}]**`)
    channel.send({embed:embed});
}
);



  client.on('message', message => {
    if(message.content == 'Nmem') {
    const embed = new Discord.RichEmbed()
    .setDescription(`**Members info🔋
:green_heart: online:   ${message.guild.members.filter(m=>m.presence.status == 'online').size}
:red_circle: dnd:       ${message.guild.members.filter(m=>m.presence.status == 'dnd').size}
:large_orange_diamond: idle:     ${message.guild.members.filter(m=>m.presence.status == 'idle').size}   
:black_circle: offline:   ${message.guild.members.filter(m=>m.presence.status == 'offline').size} 
🔹  all:  ${message.guild.memberCount}**`)         
         message.channel.send({embed});

    }
  });
    




client.on('message', message => {
            if (message.author.id === client.user.id) return;
        if (message.guild) {
       let embed = new Discord.RichEmbed()
        let args = message.content.split(' ').slice(1).join(' ');
                var prefix = "N";
    if(message.content.split(' ')[0] == prefix + 'bc') {
        if (!args[1]) {
    message.channel.send("**Nbc <message>**");
    return;
    }
            message.guild.members.forEach(m => {
       if(!message.member.hasPermission('ADMINISTRATOR')) return;
                var bc = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .addField('Server:', `${message.guild.name}`,true)
                .addField('By:', `${message.author.username}#${message.author.discriminator}`,true)
                .addField('message:', args)
                .setThumbnail(message.guild.iconURL)
                .setColor('RANDOM')
                m.send(`${m}`,{embed: bc});
            });
            const dark = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)   
            .setTitle(':white_check_mark:| Done ') 
            .addBlankField(true)
            .addField(':hotsprings:| عدد الاعضاء المرسل لهم ', message.guild.memberCount , true)        
            .addField(':pencil:| message: ', args)
            .setColor('RANDOM')
            message.channel.sendEmbed(dark);          
        }
        } else {
            return;
        }
    });

   

 client.on("message", msg => {
           var prefix = "N";
  if(msg.content.startsWith (prefix + "id")) {
    if(!msg.channel.guild) return msg.reply('**:x: اسف لكن هذا الامر للسيرفرات فقط **');         
      const embed = new Discord.RichEmbed();
  embed.addField(":cloud_tornado:  الاسم", `**[ ${msg.author.username}#${msg.author.discriminator} ]**`, true)
          .addField(":id:  الايدي", `**[ ${msg.author.id} ]**`, true)
          .setColor("RANDOM")
          .setFooter(msg.author.username , msg.author.avatarURL)
          .setThumbnail(`${msg.author.avatarURL}`)
          .setTimestamp()
          .setURL(`${msg.author.avatarURL}`)
          .addField(':spy:  الحالة', `**[ ${msg.author.presence.status.toUpperCase()} ]**`, true)
          .addField(':satellite_orbital:   يلعب', `**[ ${msg.author.presence.game === null ? "No Game" : msg.author.presence.game.name} ]**`, true)
          .addField(':military_medal:  الرتب', `**[ ${msg.member.roles.filter(r => r.name).size} ]**`, true)
          .addField(':robot:  هل هو بوت', `**[ ${msg.author.bot.toString().toUpperCase()} ]**`, true);
      msg.channel.send({embed: embed})
  }
});






client.login(process.env.BOT_TOKEN);
