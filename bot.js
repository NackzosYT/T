const Discord = require('discord.js');

const Util = require('discord.js');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const YouTube = require('simple-youtube-api');

const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

const queue = new Map();

const ytdl = require('ytdl-core');

const fs = require('fs');

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
 
    if (msg.content.startsWith(${prefix}play)) {
        console.log(${msg.author.tag} has been used the ${prefix}play command in ${msg.guild.name});
 
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'يجب ان تكون في روم صوتي'
              }
            ]
          }
        });
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) {
            return msg.channel.send({embed: {
                color: 15158332,
                fields: [{
                    name: "❌ خطأ",
                    value: 'لا توجد لدي الصلاحيه لدخول هذا الروم '
                  }
                ]
              }
            });
        }
        if (!permissions.has('SPEAK')) {
            return msg.channel.send({embed: {
                color: 15158332,
                fields: [{
                    name: "❌ خطأ",
                    value: 'لا استطيع التحدث في هذا الروم تأكد من أعطائي الصلاحيات المطلوبه'
                  }
                ]
              }
            });
        }
       
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, msg, voiceChannel, true) // eslint-disable-line no-await-in-loop
            }
            return msg.channel.send({embed: {
                color: 15158332,
                fields: [{
                    name: "✅ تمت اضافته الي قائمه التشغيل",
                    value: `قائمه التشغيل: *${playlist.title}* تمت اضافته `
                  }
                ]
              }
            });
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    msg.channel.send({embed: {
                        color: 15158332,
                        fields: [{
                            name: "📋 اختيار الاغاني",
                            value: ${videos.map(video2 => `\`${++index}\ *-* ${video2.title}`).join('\n')}`
                          },
                          {
                              name: "لديك 10 ثواني",
                              value: "يجب ان تختار اغنيه "
                          }
                        ]
                      }
                    })
                    try {
                        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send({embed: {
                            color: 15158332,
                            fields: [{
                                name: "❌ خطأ",
                                value: 'تم ادخال قيمه غير صحيحه .. سيتم الغاء التشغيل
                              }
                            ]
                          }
                        })
                    }
                    const videoIndex = (response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return msg.channel.send({embed: {
                        color: 15158332,
                        fields: [{
                            name: "❌ خطأ",
                            value: 'لم استطيع العثور علي اغنيه بهذا الاسم '
                          }
                        ]
                      }
                    })
                }
            }
 
            return handleVideo(video, msg, voiceChannel);
        }
    } else if (msg.content.startsWith(${prefix}skip)) {
        console.log(${msg.author.tag} has been used the ${prefix}skip command in ${msg.guild.name});
        if (!msg.member.voiceChannel) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'انت لست في روم صوتي'
              }
            ]
          }
        })
        if (!serverQueue) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل ليتم تخطيه'
              }
            ]
          }
        })
        serverQueue.connection.dispatcher.end();
        return undefined;
    } else if (msg.content.startsWith(${prefix}stop)) {
        console.log(${msg.author.tag} has been used the ${prefix}stop command in ${msg.guild.name});
        if (!msg.member.voiceChannel) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'انت لست في روم صوتي'
              }
            ]
          }
        })
        if (!serverQueue) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل ليتم ايقافه'
              }
            ]
          }
        })
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Stop command has been used!');
        return undefined;
    } else if (msg.content.startsWith(${prefix}volume)) {
        console.log(${msg.author.tag} has been used the ${prefix}volume command in ${msg.guild.name});
        if (!msg.member.voiceChannel) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'انت لست في روم صوتي'
              }
            ]
          }
        })
        if (!serverQueue) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل'
              }
            ]
          }
        })
        if (!args[1]) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "🔊 الصوت",
                value: درجه الصوت الان: **${serverQueue.volume}**
              }
            ]
          }
        })
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "🔊 الصوت",
                value: تم تغيير درجه الصوت الي: **${args[1]}**
              }
            ]
          }
        })
    } else if (msg.content.startsWith(${prefix}np)) {
        console.log(${msg.author.tag} has been used the ${prefix}np command in ${msg.guild.name});
        if (!serverQueue) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل ليتم تخطيه'
              }
            ]
          }
        })
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "🎵 قيد التشغيل",
                value: **${serverQueue.songs[0].title}**
              }
            ]
          }
        })
    } else if (msg.content.startsWith(${prefix}queue)) {
        console.log(${msg.author.tag} has been used the ${prefix}queue command in ${msg.guild.name});
        if (!serverQueue) return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل ليتم تخطيه '
              }
            ]
          }
        })
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "📋 قائمه الاغاني",
                value: ${serverQueue.songs.map(song => `**- ${song.title}**).join('\n')}`
              },
              {
                  name: "🎵 قيد التشغيل",
                  value: **${serverQueue.songs[0].title}**
              }
            ]
          }
        })
        } else if(msg.content.startsWith(${prefix}help)) {
        console.log(${msg.author.tag} has been used the ${prefix}help command in ${msg.guild.name});
 
        msg.channel.send('تم ارسال الاوامر في الخاص :inbox_tray:')
 
        msg.react('✅');
 
        msg.author.send({embed: {
            color: 15158332,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            fields: [{
                name: "اوامر البوت:",
                value: `**${prefix}help** - This message!\n\
*${prefix}play* - تشغيل اغنيه.\n\
*${prefix}skip* - تخطيها.\n\
*${prefix}stop* - ايقافها.\n\
*${prefix}volume* - التحكم في درجه الصوت.\n\
*${prefix}np* - قيد التشغيل .\n\
*${prefix}queue* - لائحه الاغاني .\n\
*${prefix}pause* - ايقاف مؤقت.\n\
*${prefix}resume* - تشغيل الاغنيه`
              }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "made by : taino"
            }
          }
        });
    } else if (msg.content.startsWith(${prefix}pause)) {
        console.log(${msg.author.tag} has been used the ${prefix}pause command in ${msg.guild.name});
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "⏯️ ايقاف",
                value: 'تم ايقاف الاغنيه مؤقتا'
              }
            ]
          }
        })
        }
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شئ قيد التشغيل'
              }
            ]
          }
        })
    } else if (msg.content.startsWith(${prefix}resume)) {
        console.log(${msg.author.tag} has been used the ${prefix}resume command in ${msg.guild.name});
 
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing =  true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send({embed: {
                color: 15158332,
                fields: [{
                    name: "⏯️ تشغيل",
                    value: 'تم اعاده تشغيل الاغنيه'
                  }
                ]
              }
            })
        }
        return msg.channel.send({embed: {
            color: 15158332,
            fields: [{
                name: "❌ خطأ",
                value: 'لا يوجد شي قيد التشغيل او ان هناك اغنيه قيد التشغيل بالفعل'
              }
            ]
          }
        })
    }
 
    return undefined;
});
 
 
async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
        const song = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: https://www.youtube.com/watch?v=${video.id}
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
                console.error(I could not join the voice channel: ${error});
                queue.delete(msg.guild.id);
                return msg.channel.send({embed: {
                    color: 15158332,
                    fields: [{
                        name: "❌ خطا",
                        value: لم استطع الدخول الي هذا الروم: ${error}
                      }
                    ]
                  }
                });
            }
        } else {
            serverQueue.songs.push(song);
            if (playlist) return undefined;
            else return msg.channel.send({embed: {
                color: 15158332,
                fields: [{
                    name: "✅ اضافه اغنيه",
                    value: `**${song.title}** تمت اضافه اغنيه : `
                  }
                ]
              }
            })
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
 
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => {
            console.log('Song ended.');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.log(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
 
    serverQueue.textChannel.send({embed: {
        color: 15158332,
        fields: [{
            name: "✅ بدء التشغيل",
            value: قيد التشغيل الان: **${song.title}**
          }
        ]
      }
    })
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
❧ Broles ➺ لعرض الرتب الموجودة في السيرفر
❧ Bsay ➺ البوت يكرر كلام انته تحدده
❧ Bid ➺ لعرض معلوماتك
❧ Bnew ➺ لانشاء تذكرة

─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
 
 
 
 

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
