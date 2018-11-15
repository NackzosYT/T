const Discord = require('discord.js');

const Util = require('discord.js');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const YouTube = require('simple-youtube-api');

const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

const queue = new Map();

const ytdl = require('ytdl-core');

const fs = require('fs');

const gif = require("gif-search");

const client = new Discord.Client({disableEveryone: true});

const prefix = "B";

/////////////////////////
////////////////////////

client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `ping`) {
    let embed = new Discord.RichEmbed()
    .setColor(3447003)
    .setTitle("Pong!!")
    .setDescription(`${client.ping} ms,`)
    .setFooter(`Requested by | ${msg.author.tag}`);
    msg.delete().catch(O_o=>{})
    msg.channel.send(embed);
    }
});
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `avatar`){
	if(msg.channel.type === 'dm') return msg.channel.send("Nope Nope!! u can't use avatar command in DMs (:")
        let mentions = msg.mentions.members.first()
        if(!mentions) {
          let sicon = msg.author.avatarURL
          let embed = new Discord.RichEmbed()
          .setImage(msg.author.avatarURL)
          .setColor("#5074b3")
          msg.channel.send({embed})
        } else {
          let sicon = mentions.user.avatarURL
          let embed = new Discord.RichEmbed()
          .setColor("#5074b3")
          .setImage(sicon)
          msg.channel.send({embed})
        }
    };
});
/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////

/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg => { 
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
    
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
        
        if (!voiceChannel) return msg.channel.send("انت لم تدخل روم صوتي");
        
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        
        if (!permissions.has('CONNECT')) {

			return msg.channel.send("ليست لدي صلاحيات للدخول الى الروم");
        }
        
		if (!permissions.has('SPEAK')) {

			return msg.channel.send("انا لا يمكنني التكلم في هاذه الروم");
		}

		if (!permissions.has('EMBED_LINKS')) {

			return msg.channel.sendMessage("انا لا املك صلاحيات ارسال روابط")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            

			for (const video of Object.values(videos)) {
                
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
            }
			return msg.channel.send(`**${playlist.title}**, Just added to the queue!`);
		} else {

			try {

                var video = await youtube.getVideo(url);
                
			} catch (error) {
				try {

					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
                    const embed1 = new Discord.RichEmbed()
                    .setTitle(":mag_right:  YouTube Search Results :")
                    .setDescription(`
                    ${videos.map(video2 => `${++index}. **${video2.title}**`).join('\n')}`)
                    
					.setColor("#f7abab")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
/////////////////					
					try {

						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('لم يتم اختيار الاغنية');
                    }
                    
					const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                    
				} catch (err) {

					console.error(err);
					return msg.channel.send("I didn't find any results!");
				}
			}

            return handleVideo(video, msg, voiceChannel);
            
        }
        
	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
        if (!serverQueue) return msg.channel.send("ليست هناك اغاني ليتم التخطي");

		serverQueue.connection.dispatcher.end('تم تخطي الاغنية');
        return undefined;
        
	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
        if (!serverQueue) return msg.channel.send("There is no Queue to stop!!");
        
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('تم ايقاف الاغنية لقد خرجت من الروم الصوتي');
        return undefined;
        
	} else if (command === `vol`) {

		if (!msg.member.voiceChannel) return msg.channel.send("يجب ان تكون في روم صوتي");
		if (!serverQueue) return msg.channel.send('يعمل الامر فقط عند تشغيل مقطع صوتي');
        if (!args[1]) return msg.channel.send(`لقد تم تغير درجة الصوت الى**${serverQueue.volume}**`);
        
		serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
        
        return msg.channel.send(`درجة الصوت الان**${args[1]}**`);

	} else if (command === `np`) {

		if (!serverQueue) return msg.channel.send('There is no Queue!');
		const embedNP = new Discord.RichEmbed()
	    .setDescription(`Now playing **${serverQueue.songs[0].title}**`)
        return msg.channel.sendEmbed(embedNP);
        
	} else if (command === `queue`) {
		
		if (!serverQueue) return msg.channel.send('There is no Queue!!');
		let index = 0;
//	//	//
		const embedqu = new Discord.RichEmbed()
        .setTitle("The Queue Songs :")
        .setDescription(`
        ${serverQueue.songs.map(song => `${++index}. **${song.title}**`).join('\n')}
**Now playing :** **${serverQueue.songs[0].title}**`)
        .setColor("#f7abab")
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('تم الايقاف');
		}
		return msg.channel.send('في انتظار تشغيل المقطع');
	} else if (command === "resume") {

		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
            return msg.channel.send('تم التشغيل');
            
		}
		return msg.channel.send('Queue is empty!');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}!`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Can't join this channel: ${error}!`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`**${song.title}**, تمت اضافة المقطع الى قائمة الانتظار `);
	} 
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`**${song.title}**, is now playing!`);
}


client.on('message', message => {
    if (message.content === 'BhelpMusic') {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('**أوامر الميوزك...**')
        .setDescription('**برفكس البوت (!)**')
        .addField('play', 'لتشغيل اغنية')
        .addField('join', 'دخول رومك الصوتي')
        .addField('disconnect', 'الخروج من رومك الصوتي')
        .addField('skip', 'تخطي الأغنية')
        .addField('pause', 'ايقاف الاغنية مؤقتا')
        .addField('resume', 'تكملة الاغنية')
        .addField('queue', 'اظهار قائمة التشغيل')
        .addField('np', 'اظهار الاغنية اللي انت مشغلها حاليا')
      message.channel.send(helpEmbed);
    }
});


client.on('message' , message => {
if(message.content === 'Bhelp') {
  var EsTeKnAN = new Discord.RichEmbed()
  .setColor('RANDOM')
message.channel.send(`
─════════════ {✯اوامر البوت✯} ════════════─

BhelpP ➺ اوامر عامه
BhelpA ➺ اوامر الادمن
BhelpM ➺ اوامر الاغاني

─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
 
 
 client.on('message' , message => {
if(message.content === 'BhelpM') {
  var EsTeKnAN = new Discord.RichEmbed()
  .setColor('RANDOM')
message.channel.send(`
─════════════ {✯اوامر الاغاني✯} ════════════─

play    ➺ لتشغيل اغنية
skip    ➺ تخطي الأغنية
pause   ➺ ايقاف الاغنية مؤقتا
resume  ➺ تكملة الاغنية
queue   ➺ اظهار قائمة التشغيل
np      ➺ اظهار الاغنية اللي انت مشغلها حاليا

─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
 
 
 
client.on('message' , message => {
if(message.content === 'BhelpA') {
  var EsTeKnAN = new Discord.RichEmbed()
  .setColor('RANDOM')
message.channel.send(`
─════════════ {✯اوامر الاداره✯} ════════════─

❧ Bbc ➺ برودكاست ب امبيد وبدون
❧ Bclear ➺ مسح الشات
❧ Bmc ➺ قفل الشات
❧ Bumc ➺ فتح الشات
❧ Bct ➺ انشاء روم كتابي
❧ Bcv ➺ انشاء روم صوتي
❧ BsetVoice ➺ يسويلك روم ويقولك عدد الاشخاص في الرومات الصوتية
❧ Bmove ➺ سحب عضو للروم الصوتي
❧ Bban ➺ تبنيد عضو من السيرفر
❧ Bkick ➺ طرد عضو من السيرفر
❧ BMute ➺ اعطاء ميوت كتابي
❧ Bunmute ➺ فك الميوت الكتابي

─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
client.on('message' , message => {
if(message.content === 'BhelpP') {
  var EsTeKnAN = new Discord.RichEmbed()
  .setColor('RANDOM')
message.author.send(`
**
─════════════ {✯اوامر عامه✯} ════════════─

❧ رابط ➺ رابط انفايت للسيرفر
❧ Breport ➺ تبليغ / لازم في روم اسمه repoerts
❧ Bavatar ➺ عرض صورتك او شخص تمنشنه
❧ Brooms ➺ لعرض الرومات الموجودة في السيرفر
❧ Broles ➺ لعرض الرتب الموجودة في السيرفر
❧ Bsay ➺ البوت يكرر كلام انته تحدده
❧ Bid ➺ لعرض معلوماتك
❧ Bnew ➺ لانشاء تذكرة
─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
 
 
 




client.on('message', message => {
    const prefix = 'B'
var args = message.content.split(" ").slice(1);    
if(message.content.startsWith(prefix + 'id')) {
var year = message.author.createdAt.getFullYear()
var month = message.author.createdAt.getMonth()
var day = message.author.createdAt.getDate()
var men = message.mentions.users.first();  
let args = message.content.split(' ').slice(1).join(' ');
if (args == '') {
var z = message.author;
}else {
var z = message.mentions.users.first();
}

let d = z.createdAt;          
let n = d.toLocaleString();   
let x;                       
let y;                        

if (z.presence.game !== null) {
y = ${z.presence.game.name};
} else {
y = "No Playing... |??.";
}
let embed = new Discord.RichEmbed()
.setColor("#502faf")
.addField(': ?? | اسمك',`**<@` + ${z.id} + >**, true)
.addField(': ?? | ايديك', "*"+ ${z.id} +"*",true)
.addField(': ? | Playing','*'+y+'*' , true)
.addField(': ?? | تاق حق حسابك',"**#" +  ${z.discriminator}**,true)
.addField('*: ?? | التاريح الذي انشئ فيه حسابك*', message.author.createdAt.toLocaleString())
.addField("*: ? | تاريخ دخولك للسيرفر*", message.member.joinedAt.toLocaleString())    

.setThumbnail(${z.avatarURL})
.setFooter(message.author.username, message.author.avatarURL)

message.channel.send({embed});
    if (!message) return message.reply('*ضع المينشان بشكل صحيح  ? *').catch(console.error);

}

});




  client.on('message', message => {
    if (message.content === "Brooms") {
                      if (!message.guild) return;

        var channels = message.guild.channels.map(channels => `${channels.name}, `).join(' ')
        const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .addField(${message.guild.name},`**Rooms:white_check_mark:**`)
        .addField(':arrow_down: Rooms Number. :heavy_check_mark:',`** ${message.guild.channels.size}**`)
        
.addField(':arrow_down:Rooms  Name. :heavy_check_mark::',`**[${channels}]**`)
        message.channel.sendEmbed(embed);
    }
});


client.on('message', message => {
    if (message.content === "Broles") {
        var roles = message.guild.roles.map(roles => `${roles.name}, `).join(' ')
        const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .addField('الرتب:',`**[${roles}]**`)
        message.channel.sendEmbed(embed);
    }
});
client.on('message' , message => {
  var prefix = "B";
  if(message.author.bot) return;
  if(message.content.startsWith(prefix + "ping")) {
 message.channel.send('Pong...').then((msg) => {
      msg.edit(\`\`\javascript\nTime taken: ${msg.createdTimestamp - message.createdTimestamp} ms.\nDiscord API: ${Math.round(client.ping)} ms.\`\`\``);
 })
  }  
 });
 


 
client.on('message', async message => {
  let args = message.content.split("B");
  if(message.content.startsWith(prefix + "mute")) {
    if(!message.member.hasPermission("MUTE_MEMBERS")) return message.channel.send('').then(msg => {
      msg.delete(3500);
      message.delete(3500);
    });
 
    if(!message.guild.member(client.user).hasPermission("MUTE_MEMBERS")) return message.channel.send('').then(msg => {
      msg.delete(3500);
      message.delete(3500);
    });
 
    let mention = message.mentions.members.first();//kinggamer حقوق الفا كودز و
    if(!mention) return  message.channel.send('').then(msg => { //kinggamer حقوق الفا كودز و
      msg.delete(3500);
      message.delete(3500);
    });
 
    if(mention.id === message.author.id) return message.channel.send('*:x:You Cannot give mute to your self*').then(msg => {
      msg.delete(3500);
      message.delete(3500); //kinggamer حقوق الفا كودز و
    });
   
    if(mention.hasPermission('ADMINISTRATOR')) return message.channel.send(**:x: لا يمكن آعطاء ميوت لادارة السيرفر**); //kinggamer حقوق الفا كودز و
 
    if(message.guild.member(mention).roles.find('name', 'Muted')) return message.channel.send(**:information_source: ${mention.user.username} Already Muted**);
 
   
    if(mention.position >= message.guild.member(message.author).positon) return message.channel.send('You Donot Have Permission *Muted_Members* ').then(msg => {
      msg.delete(3500);
      message.delete(3500);
    });
   
    if(mention.positon >= message.guild.member(client.user).positon) return message.channel.send('I Donot Have Permission *Muted_Members*').then(msg => {
      msg.delete(3500);
      message.delete(3500); //kinggamer حقوق الفا كودز و
    });
   
    let duration = args[2];
    if(!duration) message.channel.send(**:hash: You Can Use ${prefix}mute @user Time Reason**).then(msg => {
      msg.delete(3500);
      message.delete(3500);
    });
 
    if(isNaN(duration))  message.channel.send('').then(msg => {
      msg.delete(3500);
      message.delete(3500);
    });
 
    let reason = message.content.split(" ").slice(3).join(" ");
    if(!reason) reason = " [ *لم يذكر لماذا* ] ";
 
    let thisEmbed = new Discord.RichEmbed()
    .setAuthor(mention.user.username, mention.user.avatarURL)
    .setTitle('*تم آعطائك ميوت*')
    .addField('*_السيرفر_*',[ message.guild.name ]) //kinggamer حقوق الفا كودز و
    .addField('*_تم آعطائك ميوت بواسطة_*', [ message.author ])
    .addField('*_آلسبب_*',reason)
    .addField('*_وقت الميوت_*',duration)
 
    let role = message.guild.roles.find('name', 'Muted') || message.guild.roles.get(r => r.name === 'Muted');
    if(!role) try {
      message.guild.createRole({
        name: "Muted",
        permissions: 0 //kinggamer حقوق الفا كودز و
      }).then(r => {
        message.guild.channels.forEach(c => {
          c.overwritePermissions(r , {
            SEND_MESSAGES: false, //kinggamer حقوق الفا كودز و
            READ_MESSAGES_HISTORY: false,
            ADD_REACTIONS: false
          });
        });
      }); //kinggamer حقوق الفا كودز و
    } catch(e) {
      console.log(e.stack);
    }
    mention.addRole(role).then(() => {
      mention.send(thisEmbed);
      message.channel.send(`**:white_check_mark: ${mention.user.username}  Muted! :zipper_mouth:  **  `);
      mention.setMute(true); //kinggamer حقوق الفا كودز و
    });
    setTimeout(() => {
      if(duration === 0) return;
      mention.setMute(false);
      mention.removeRole(role)
    },duration * 60000); //kinggamer حقوق الفا كودز و
  }
});
client.on('message', async message => {
    let mention = message.mentions.members.first();
let command = message.content.split(" ")[0];
     command = command.slice(prefix.length);
    let args = message.content.split(" ").slice(1);  //kinggamer حقوق الفا كودز و
if(command === unmute) {2
  if(!message.member.hasPermission("MUTE_MEMBERS")) return message.channel.sendMessage("*You Donot HavePermission Mute_Members*").then(m => m.delete(5000));
if(!message.guild.member(client.user).hasPermission("MUTE_MEMBERS")) return message.reply("*I donot Have Permission Mute_Members*").then(msg => msg.delete(6000))
 
  let kinggamer = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
     if(!kinggamer) return message.channel.send('').then(msg => {
      msg.delete(3500);
      message.delete(3500); //kinggamer حقوق الفا كودز و
    });
 
  let role = message.guild.roles.find (r => r.name === "Muted");
 
  if(!role || !kinggamer.roles.has(role.id)) return message.channel.sendMessage(**:information_source:${mention.user.username} لقد تم فك الميوت عنه مسبقا**)
 
  await kinggamer.removeRole(role) //kinggamer حقوق الفا كودز و
  message.channel.sendMessage(**:white_check_mark: ${mention.user.username}  Unmuted! **);
 
  return;
 
  }
 
});

 
 
 client.on('message', message => {
    var prefix = "B";
if(!message.channel.guild) return;
if(message.content.startsWith(prefix + 'move')) {
 if (message.member.hasPermission("MOVE_MEMBERS")) {
 if (message.mentions.users.size === 0) {
 return message.channel.send("`لاستخدام الأمر اكتب هذه الأمر : " +prefix+ "move [USER]`")
}
if (message.member.voiceChannel != null) {
 if (message.mentions.members.first().voiceChannel != null) {
 var authorchannel = message.member.voiceChannelID;
 var usermentioned = message.mentions.members.first().id;
var embed = new Discord.RichEmbed()
 .setTitle("Succes!")
 .setColor("#000000")
 .setDescription(`لقد قمت بسحب <@${usermentioned}> الى الروم الصوتي الخاص بك✅ `)
var embed = new Discord.RichEmbed()
.setTitle(You are Moved in ${message.guild.name})
 .setColor("RANDOM")
.setDescription(**<@${message.author.id}> Moved You To His Channel!\nServer --> ${message.guild.name}**)
 message.guild.members.get(usermentioned).setVoiceChannel(authorchannel).then(m => message.channel.send(embed))
message.guild.members.get(usermentioned).send(embed)
} else {
message.channel.send("`لا تستطيع سحب "+ message.mentions.members.first() +" `يجب ان يكون هذه العضو في روم صوتي")
}
} else {
 message.channel.send("*`يجب ان تكون في روم صوتي لكي تقوم بسحب العضو أليك`*")
}
} else {
message.react("B")
 }}});
 
  client.on('message', message => {
  if (message.author.codes) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

  if (command == "ban") {
               if(!message.channel.guild) return message.reply('* This command only for servers*');
         
  if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return message.reply("*انت لا تملك الصلاحيات المطلوبه*");
  if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) return message.reply("*I Don't Have ` BAN_MEMBERS ` Permission*");
  let user = message.mentions.users.first();
  
  if (message.mentions.users.size < 1) return message.reply("*منشن شخص*");
  if (!message.guild.member(user)
  .bannable) return message.reply("*يجب ان تكون رتبة البوت اعلي من رتبه الشخص المراد تبنيدة*");


  message.guild.member(user).ban(7, user);

message.channel.send(`**:white_check_mark: ${user.tag} banned from the server ! :airplane: **  `)

}
});


client.on('message', message => {
const prefix = "B";
  if (message.author.kick) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

  if (command == "kick") {
               if(!message.channel.guild) return;
         
  if(!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You Don't Have KICK_MEMBERS Permission").then(msg => msg.delete(5000));
  if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) return message.reply("I Don't Have KICK_Members Permission");
  let user = message.mentions.users.first();
  let reason = message.content.split(" ").slice(2).join(" ");

  if (message.mentions.users.size < 1) return message.reply("منشن شخص");
  if(!reason) return message.reply ("اكتب سبب الطرد");
  if (!message.guild.member(user)
  .bannable) return message.reply("لايمكنني طرد شخص اعلى من رتبتي");

  message.guild.member(user).kick(7, user);

  const banembed = new Discord.RichEmbed()
  .setAuthor('Kicked !', user.displayAvatarURL)
  .setColor("RANDOM")
  .setTimestamp()
  .addField("User:",  [ + ${user.tag} + ])
  .addField("By:", [  + ${message.author.tag} +  ])
  .addField("Reason:", [ + ${reason} +  ])
  client.channels.get("492086928397565952").send({embed : banembed})
}
});


client.on("message", (message) => {
if (message.content.startsWith("Bct")) {
            if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.reply("You Don't Have MANAGE_CHANNELS Premissions ");
        let args = message.content.split(" ").slice(1);
    message.guild.createChannel(args.join(' '), 'text');
message.channel.sendMessage('تـم إنـشاء روم كـتابـي')

}
});
client.on("message", (message) => {
if (message.content.startsWith("Bcv")) {
            if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.reply("You Don't Have MANAGE_CHANNELS Premissions ");
        let args = message.content.split(" ").slice(1);
    message.guild.createChannel(args.join(' '), 'voice');
    message.channel.sendMessage('تـم إنـشاء روم صـوتي')
    
}
});


client.on('message',async message => {
    if(message.content.startsWith(prefix + "setVoice")) {
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ *ليس لديك الصلاحيات الكافية*');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ *ليس معي الصلاحيات الكافية*');
    message.channel.send('✅| *تم عمل الروم بنجاح*');
    message.guild.createChannel(Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ] , 'voice').then(c => {
      console.log(Voice online channel setup for guild: \n ${message.guild.name});
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName(Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ])
      },1000);
    });
    }
  });
  

  client.on('message', message =>{
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let prefix = 'B';
     
    if(cmd === ${prefix}report){
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!rUser) return message.channel.send("Idk who 2 report ??");
        let reason = args.join(" ").slice(22);
        if(!reason) return message.channel.send("What is the reason ??");
    
        let reportEmbed = new Discord.RichEmbed()
        .setTitle("User just reported...")
        .setColor("#f7abab")
        .addField("- Reported User :", ${rUser} (${rUser.id}))
        .addField("- Reported By :", ${message.author} (${message.author.id}))
        .addField("- Reported In :", message.channel)
        .addField("- Report Time :", message.createdAt.toLocaleString(),true)
        .addField("- Reason :", reason);
    
        let reportschannel = message.guild.channels.find(name, "reports");
        if(!reportschannel) return message.channel.send("You should to make reports channel.");
    
    
        message.delete().catch(O_o=>{});
        message.author.send(<@${rUser.id}>, Reported Successfully!!)
        reportschannel.send(reportEmbed);
    };
});
  
  
  
  client.on('message', message => {

    if (message.content === "Bmc") {
                        if(!message.channel.guild) return message.reply(' هذا الامر فقط للسيرفرات !!');

if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply(' ليس لديك صلاحيات');
           message.channel.overwritePermissions(message.guild.id, {
         SEND_MESSAGES: false

           }).then(() => {
               message.reply("تم تقفيل الشات ? ")
           });
             }
if (message.content === "Bumc") {
    if(!message.channel.guild) return message.reply(' هذا الامر فقط للسيرفرات !!');

if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('ليس لديك صلاحيات');
           message.channel.overwritePermissions(message.guild.id, {
         SEND_MESSAGES: true

           }).then(() => {
               message.reply("تم فتح الشات?")
           });
             }



});

  
  
  
  client.on('message', function(message) {
    if (message.content == "Bclear") {
        if (message.member.hasPermission("MANAGE_MESSAGES")) {
            message.channel.fetchMessages()
               .then(function(list){
                    message.channel.bulkDelete(list);
                }, function(err){message.channel.send("ERROR: ERROR CLEARING CHANNEL.")})
        }
    }

});
  
  
  
  
   client.on('message', message => {
     if (message.author.bot) return;
    if (message.content.startsWith("رابط")) {
        message.channel.createInvite({
        thing: true,
        maxUses: 10,
        maxAge: 3600,
    }).then(invite =>
      message.author.sendMessage(invite.url)
    )
    const embed = new Discord.RichEmbed()
        .setColor("RANDOM")
          .setDescription(" تم أرسال الرابط برسالة خاصة ")
           .setAuthor(client.user.username, client.user.avatarURL)
                 .setAuthor(client.user.username, client.user.avatarURL)
                .setFooter('طلب بواسطة: ' + message.author.tag)

      message.channel.sendEmbed(embed).then(message => {message.delete(10000)})
              const Embed11 = new Discord.RichEmbed()
        .setColor("RANDOM")
        
    .setDescription(" مدة الرابط : ساعه  عدد استخدامات الرابط : 10 ")
      message.author.sendEmbed(Embed11)
    }
});


 
  
  
client.on('ready', () => {
   console.log(`----------------`);
      console.log(`Desert Bot- Script By : EX Clan`);
        console.log(`----------------`);
      console.log(`ON ${client.guilds.size} Servers '     Script By : EX Clan ' `);
    console.log(`----------------`);
  console.log(`Logged in as ${client.user.tag}!`);
client.user.setGame(`Bhelp | BloodSystem`,"http://twitch.tv/Blood")
client.user.setStatus("dnd")
});

client.login(process.env.BOT_TOKEN);
