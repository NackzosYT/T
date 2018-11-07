const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setGame(`Śtranger,ForEver🌹`,"http://twitch.tv/nackzos")
  console.log(' Bot Is Online')
});


client.on('guildMemberAdd', (member) => {
member.addRole(member.guild.roles.find('name', '• Śtranger'));
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
          var prefix = "S";
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
 client.on('message', message => {
          var prefix = "S";
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




client.on("message", message => {
          var prefix = "S";
            if (message.content.startsWith(prefix + "bc")) {
                         if (!message.member.hasPermission("ADMINISTRATOR"))  return;
  let args = message.content.split(" ").slice(1);
  var argresult = args.join(' '); 
  message.guild.members.filter(m => m.presence.status !== 'all').forEach(m => {
 m.send(`${argresult}\n ${m}`);
})
 message.channel.send(`\`${message.guild.members.filter(m => m.presence.status !== 'all').size}\` : عدد الاعضاء المستلمين`); 
 message.delete(); 
};     
});


client.on("message", message => {
    var prefix = "S";
        if (message.author.id === client.user.id) return;
        if (message.guild) {
       let embed = new Discord.RichEmbed()
        let args = message.content.split(' ').slice(1).join(' ');
    if(message.content.split(' ')[0] == prefix + 'bc2') {
        if (!args[1]) {
    message.channel.send("**bc2 <message>**");
    return;
    }
            message.guild.members.forEach(m => {
       if(!message.member.hasPermission('ADMINISTRATOR')) return;
                m.send(args);
            });
            const AziRo = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)   
            .setTitle('✅| جاري ارسال رسالتك ') 
            .addBlankField(true)
            .addField('♨| عدد الاعضاء المرسل لهم ', message.guild.memberCount , true)        
            .addField('📝| الرسالة ', args)
            .setColor('RANDOM')  
            message.channel.sendEmbed(AziRo);          
        }
        } else {
            return;
        }
    });



client.login(process.env.BOT_TOKEN);
