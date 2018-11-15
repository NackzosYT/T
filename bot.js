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

client.on('disconnect', () => console.log('لقد تم اغلاقي ...'));
 
client.on('reconnecting', () => console.log('البدء من جديد ..'));
 
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
  if (!message.content.startsWith(prefix)) return;
  var args = message.content.split(' ').slice(1);
  var argresult = args.join(' ');
  if (message.author.id !== "yourID") return;
 
if (message.content.startsWith(prefix + 'setstream')) {
  client.user.setGame(argresult, "https://www.twitch.tv/taino18");
     console.log('test' + argresult);
    message.channel.sendMessage(Streaming: **${argresult})
}
	});

let profile = JSON.parse(fs.readFileSync("./profile.json", "utf8"))
client.on("message", message => {
  if (message.author.bot) return;
 if(!message.channel.guild)return;
  if (!profile[message.author.id]) profile[message.author.id] = {
    tite: 'HypeLC User',
    rep: 0,
   reps: 'NOT YET',
   lastDaily:'Not Collected',
    level: 0,
    points: 0,
    credits: 1,
  };
fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
if (err) console.error(err);
})
});
client.on("message", (message) => {
  let men = message.mentions.users.first()
  if (message.author.bot) return;
    if (message.author.id === client.user.id) return;
    if(!message.channel.guild) return;
if (message.content.startsWith('Rcredit')) {
  if(men) {
  if (!profile[men.id]) profile[men.id] = {
   lastDaily:'Not Collected',
   credits: 1,
 };
  }
  if(men) {
message.channel.send(** ${men.username}, :credit_card: balance + " is " + `${profile[men.id].credits}$ + "`.**")
} else {
 message.channel.send(** ${message.author.username}, your :credit_card: balance + " is " + `${profile[message.author.id].credits}$ + "`.**")
}
}
if(message.content.startsWith("#credit")) {


  if(profile[message.author.id].lastDaily != moment().format('day')) {
   profile[message.author.id].lastDaily = moment().format('day')
   profile[message.author.id].credits += 310
    message.channel.send(**${message.author.username} you collect your \310\` :dollar: daily pounds**`)
} else {
    message.channel.send(**:stopwatch: | ${message.author.username}, your daily :yen: credits refreshes ${moment().endOf('day').fromNow()}**)
}
}
let cont = message.content.slice(prefix.length).split(" ");
let args = cont.slice(2);
let sender = message.author
if(message.content.startsWith('#credits')) {
          if (!args[0]) {
            message.channel.send(**Usage: Rtrans @someone amount**);
         return;
           }
        // We should also make sure that args[0] is a number
        if (isNaN(args[0])) {
            message.channel.send(**Usage: Rtrans @someone amount**);
            return; // Remember to return if you are sending an error message! So the rest of the code doesn't run.
             }
             if(profile[message.author.id].credits < args[0]) return message.channel.send("*Your Credits is not enough  that*")
if(args[0].startsWith("-")) return  message.channel.send('*!! I Cant Do it*');
				 let defineduser = '';
            let firstMentioned = message.mentions.users.first();
            defineduser = (firstMentioned)
            if (!defineduser) return message.channel.send(**Usage: ${prefix}trans @someone amount**);
            if(defineduser.id === message.author.id) return message.channel.send("**Transfering to your self hah ?!**")
            var mentionned = message.mentions.users.first();
if (!profile[sender.id]) profile[sender.id] = {}
if (!profile[sender.id].credits) profile[sender.id].credits = 310;
fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
if (err) console.error(err);
})
var x = ['5587' ,' 9978' , '3785' , '7734' , '9864' , '7681' , '3758' , '7834' , '3489' , '1382' , '7389' , '8762' , '0889' , '0388' , '3316' , '0976' , '8603' , '1842' , '4565' , '9524' , '9524' , '0964' , '5930' , '5678' , '9567' , '6099' , '7058' , '0001' , '1324' , '9834' , '7668' , '0378' , '7055' , '9733' , '9876' , '9846' , '9685' , '8574' , '8975' , '9845' , '9862' , '0069' , '0807' , '0673' , '0813' , '1235' , '6879'];
var x2 = ['5587' ,' 9978' , '3785' , '7734' , '9864' , '7681' , '3758' , '7834' , '3489' , '1382' , '7389' , '8762' , '0889' , '0388' , '3316' , '0976' , '8603' , '1842' , '4565' , '9524' , '9524' , '0964' , '5930' , '5678' , '9567' , '6099' , '7058' , '0001' , '1324' , '9834' , '7668' , '0378' , '7055' , '9733' , '9876' , '9846' , '9685' , '8574' , '8975' , '9845' , '9862' , '0069' , '0807' , '0673' , '0813' , '1235' , '6879'];
        var x3 = Math.floor(Math.random()*x.length)
        message.channel.send(` \`${args}\`** : Amount**  \n \`${x[x3]}\` ** : Write the Number to Complete **`).then(msg1=> { 
        var r = message.channel.awaitMessages(msg => msg.content == x2[x3], { maxMatches : 1, time : 60000, errors : ['time'] })
        r.catch(() => {
            message.delete()
            r.delete()
            msg.delete()
            message.channel.sendEmbed(embed)
        })
        r.then(s=> {
      var mando = message.mentions.users.id;
      if  (!profile[defineduser.id]) profile[defineduser.id] = {}
      if (!profile[defineduser.id].credits) profile[defineduser.id].credits = 200;
      profile[defineduser.id].credits += (+args[0]);
      profile[sender.id].credits += (-args[0]);
      let mariam = message.author.username
message.channel.send(**:moneybag: | ${message.author.username}, has transferrerd ` + "" + args[0] + "$` to " + <@${defineduser.id}>**)
mentionned.send(` :credit_card: | Transfer Receipt \`\`\`You have received ${args[0]} from user ${message.author.username} ; (ID (${message.author.id})\`\`\``);
               message.channel.sendEmbed(embed)
        })
        })
        
		




}

});


client.on('message', message => {
  var prefix = "B"; /// غير البرفيكس
  
if (message.author.bot) return;
if (!message.content.startsWith(prefix)) return;
   
let command = message.content.split(" ")[0];
command = command.slice(prefix.length);
   
let args = message.content.split(" ").slice(1);
   
if (command === "say") {
message.delete()
  message.channel.sendMessage(args.join(" ")).catch(console.error);
        })
        })
        
		




}

});


client.on('message', message => {
var prefix = "B";

    if (message.author.id === client.user.id) return;
    if (message.guild) {
   let embed = new Discord.RichEmbed()
    let args = message.content.split(' ').slice(1).join(' ');
if(message.content.split(' ')[0] == prefix + 'bc2') {
                      if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.sendMessage('radio_button Hey! || You Don't Have Perms . ')
    if (!args[1]) {
message.channel.send(* - أستعمل : -bc [الرسالة] \n يمكنك أرسال صوره مع البرودكاست 😄*);
return;
}
        message.guild.members.forEach(m => {
   if(!message.member.hasPermission('ADMINISTRATOR')) return;
            var bc = new Discord.RichEmbed()
            .addField('» السيرفر :', ${message.guild.name})
            .addField('» المرسل : ', <@${message.author.id}>)
            .addField(' » الرسالة : ', args)
            .setColor('#ff0000')
            m.send(${m},{embed: bc})
    if(message.attachments.first()){
m.sendFile(message.attachments.first().url).catch();
}
})
}
}
});




client.on('message', message => {
    if (message.content.startsWith("Bavatar")) {
if(!message.channel.guild) return;
        var mentionned = message.mentions.users.first();
    var client;
      if(mentionned){
          var client = mentionned; } else {
          var client = message.author;
      }
        const embed = new Discord.RichEmbed()
                           .addField('Requested by:', "<@" + message.author.id + ">")
        .setColor(000000)
        .setImage(${client.avatarURL})
      message.channel.sendEmbed(embed);
    }
});

client.on('message', message => {
                 if(message.content === ".mc") {
                                     if(!message.channel.guild) return message.reply("*This command only for servers*");

             if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("*_ليس لديك صلاحيات_*");
                        message.channel.overwritePermissions(message.guild.id, {
                      SEND_MESSAGES: false

                        }).then(() => {
                            message.reply("*_تم تقفيل الشات_ ✅ *")
                        });
                          }

              if(message.content === ".unmc") {
                                  if(!message.channel.guild) return message.reply("*This command only for servers*");

             if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("*_ليس لديك صلاحيات_*");
                        message.channel.overwritePermissions(message.guild.id, {
                      SEND_MESSAGES: true

                        }).then(() => {
                            message.reply("*__تم فتح الشات__✅*")
                        });
              }

			  
			  const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = "B"
const Sra7a = [//////bot by Taino#6004
            'صراحه  |  صوتك حلوة؟',
            'صراحه  |  التقيت الناس مع وجوهين؟',//////bot by Taino#6004
            'صراحه  |  شيء وكنت تحقق اللسان؟',
            'صراحه  |  أنا ��خص ضعيف عندما؟',
            'صراحه  |  هل ترغب في إظهار حبك ومرفق لشخص أو رؤية هذا الضعف؟',
            'صراحه  |  يدل على أن الكذب مرات تكون ضرورية شي؟',//////bot by Taino#6004
            'صراحه  |  أشعر بالوحدة على الرغم من أنني تحيط بك كثيرا؟',
            'صراحه  |  كيفية الكشف عن من يكمن عليك؟',
            'صراحه  |  إذا حاول شخص ما أن يكرهه أن يقترب منك ويهتم بك تعطيه فرصة؟',
            'صراحه  |  أشجع شيء حلو في حياتك؟',
            'صراحه  |  طريقة جيدة يقنع حتى لو كانت الفكرة خاطئة" توافق؟',
            'صراحه  |  كيف تتصرف مع من يسيئون فهمك ويأخذ على ذهنه ثم ينتظر أن يرفض؟',
            'صراحه  |  التغيير العادي عندما يكون الشخص الذي يحبه؟',
            'صراحه  |  المواقف الصعبة تضعف لك ولا ترفع؟',
            'صراحه  |  نظرة و يفسد الصداقة؟',
            'صراحه  |  ‏‏إذا أحد قالك كلام سيء بالغالب وش تكون ردة فعلك؟',//////bot by Taino#6004
            'صراحه  |  شخص معك بالحلوه والمُره؟',
            'صراحه  |  ‏هل تحب إظهار حبك وتعلقك بالشخص ��م ترى ذلك ضعف؟',
            'صراحه  |  تأخذ بكلام اللي ينصحك ولا تسوي اللي تبي؟',
            'صراحه  |  وش تتمنى الناس تعرف عليك؟',
            'صراحه  |  ابيع المجرة عشان؟',
            'صراحه  |  أحيانا احس ان الناس ، كمل؟',
            'صراحه  |  مع مين ودك تنام اليوم؟',
            'صراحه  |  صدفة العمر الحلوة هي اني؟',
            'صراحه  |  الكُره العظيم دايم يجي بعد حُب قوي " تتفق؟',
            'صراحه  |  صفة تحبها في نفسك؟',//////bot by Taino#6004
            'صراحه  |  ‏الفقر فقر العقول ليس الجيوب " ، تتفق؟',
            'صراحه  |  تصلي صلواتك الخمس كلها؟',
            'صراحه  |  ‏تجامل أحد على راحتك؟',
            'صراحه  |  اشجع شيء سويتة بحياتك؟',
            'صراحه  |  وش ناوي تسوي اليوم؟',
            'صراحه  |  وش شعورك لما تشوف المطر؟',
            'صراحه  |  غيرتك هاديه ولا تسوي مشاكل؟',
            'صراحه  |  ما اكثر شي ندمن عليه؟',
            'صراحه  |  اي الدول تتمنى ان تزورها؟',
            'صراحه  |  متى اخر مره بكيت؟',
            'صراحه  |  تقيم حظك ؟ من عشره؟',
            'صراحه  |  هل تعتقد ان حظك سيئ؟',
            'صراحه  |  شـخــص تتمنــي الإنتقــام منـــه؟',
            'صراحه  |  كلمة تود سماعها كل يوم؟',
            'صراحه  |  **هل تُتقن عملك أم تشعر بالممل؟',//////bot by Taino#6004
            'صراحه  |  هل قمت بانتحال أحد الشخصيات لتكذب على من حولك؟',
            'صراحه  |  متى آخر مرة قمت بعمل مُشكلة كبيرة وتسببت في خسائر؟',
            'صراحه  |  ما هو اسوأ خبر سمعته بحياتك؟',
            '‏صراحه | هل جرحت شخص تحبه من قبل ؟',
            'صراحه  |  ما هي العادة التي تُحب أن تبتعد عنها؟',
            '‏صراحه | هل تحب عائلتك ام تكرههم؟',
            '‏صراحه  |  من هو الشخص الذي يأتي في قلبك بعد الله – سبحانه وتعالى- ورسوله الكريم – صلى الله عليه وسلم؟',
            '‏صراحه  |  هل خجلت من نفسك من قبل؟',
            '‏صراحه  |  ما هو ا الحلم  الذي لم تستطيع ان تحققه؟',
            '‏صراحه  |  ما هو الشخص الذي تحلم به كل ليلة؟',
            '‏صراحه  |  هل تعرضت إلى موقف مُ��رج جعلك تكره صاحبهُ؟',
             '‏صراحه  |  هل قمت بالبكاء أمام من تُحب؟',
            '‏صراحه  |  ماذا تختار حبيبك أم صديقك؟',
            '‏صراحه  | هل حياتك سعيدة أم حزينة؟',//////bot by Taino#6004
            'صراحه  |  ما هي أجمل سنة عشتها بحياتك؟',
            '‏صراحه  |  ما هو عمرك الحقيقي؟',
            '‏صراحه  |  ما اكثر شي ندمن عليه؟',
            'صراحه  |  ما هي أمنياتك المُستقبلية؟‏',
       ]
          client.on('message', message => {
        if (message.content.startsWith(prefix + 'صراحه')) {
            if(!message.channel.guild) return message.reply('* This command only for servers *');
         var client= new Discord.RichEmbed()
         .setTitle("Alpha Taino#6004")
         .setColor('RANDOM')//////bot by Taino#6004
         .setDescription(${Sra7a[Math.floor(Math.random() * Sra7a.length)]})
         .setImage("https://cdn.discordapp.com/attachments/371269161470525444/384103927060234242/125.png")
                         .setTimestamp()
       
          message.channel.sendEmbed(client);
          message.react("??")
        }
       }); //////bot by Taino#6004
client.on('message', message => {
    if (message.content == "Bامثال") {
        var x = ["أذا ذل رويال فهو ...",
"الإتحاد ...",
"الناس سواسية كأسنان ...",
"ما أشبه الليله",
"البعد ...",
"الماء أهون موجود وأعز ...",
"الهزيمة تحل ...",//////bot by Taino#6004
"العقل ...",
"البطنة تزيل ...",
"اللبيب بالإشارة ...",
"اخطب لابنتك ولا تخطب ...",
"أعز من الولد ولد ...",
"القرد في عين أمه ...",
"الكتاب يقرأ من ...",
"آخر الحياة ...",
"أكرم نفسك عن كل",
"العز في نواصي",
];
        var x2 = ['ذليل',
        "قوة",
        "المشط",//////bot by Taino#6004
        "بالبارحة",
        "جفاء",
        "مفقود",
        "العزيمة",
        "زينة",
        "الفطنة",
        "يفهم",
        "لابنك",
        "الولد",
        "غزال",
        "عنوانه",
        "الموت",
        "دنيء",
        "الخيل",
        //////bot by Taino#6004
       
       
       
        ];
       
        var x3 = Math.floor(Math.random()*x.length)
        message.channel.send(` اكمل المثل التآلي :  _*${x[x3]}*_ ؟
    لديك 30 ثآنية للإجآبة `).then(msg1=> {
            var r = message.channel.awaitMessages(msg => msg.content == x2[x3], {
                maxMatches : 1,
                time : 30000,
                errors : ['time']
            })
        r.catch(() => {//////bot by Taino#6004
            return message.channel.send(`:negative_squared_cross_mark: لقد انتهى الوقت ولم يقم أحد بالأجابة بشكل صحيح
            الإجآبة الصحيحةة هي __*${x2[x3]}*__`)
        })
       
        r.then((collected)=> {
            message.channel.send(`${collected.first().author} لقد قمت بكتابة الجواب الصحيح بالوقت المناسب  `);
        })
        })//////bot by Taino#6004
    }
})
/////////////////////////////
 
 
client.on('message', message => {
if (!points[message.author.id]) points[message.author.id] = {
    points: 50,
  };
if (message.content.startsWith(prefix + 'عواصم')) {
    if(!message.channel.guild) return message.reply('*هذا الأمر للسيرفرات فقط*').then(m => m.delete(3000));
 
const type = require('./3wasem/3wasem.json');
const item = type[Math.floor(Math.random() * type.length)]; //////bot by Taino#6004
const filter = response => {
    return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
};
message.channel.send('*اديك 15 ثاني�� لتوجد العاصمه الصحيحه*').then(msg => {
    let embed = new Discord.RichEmbed()
    .setColor('#000000')
    .setFooter("عواصم  | Legend GaMerZ Bot", 'https://cdn.discordapp.com/avatars/439427357175185408/3eb163b7656922ebc9e90653d50231f1.png?size=2048')
    .setDescription(**اكتب عاصمه: ${item.type}**)
 
    msg.channel.sendEmbed(embed).then(() => {
        message.channel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
        .then((collected) => {//////bot by Taino#6004
        message.channel.send(${collected.first().author} ✅ **الاجابه صحيحه**);
 
        console.log([Typing] ${collected.first().author} typed the word.);
            let won = collected.first().author;
            points[won.id].points++;
          })//////bot by Taino#6004
          .catch(collected => {
            message.channel.send(:x: **لا يوجد احد كتب الاجابه الصحيحه**);
            console.log(`[Typing] ماحد قال الاجابه `);
          })
        })
    })//////bot by Taino#6004
}
});
 
//============================ الجيسون
 
[
    {
        "type": "العراق",
        "answers": ["بغداد"]
    },//////bot by Taino#6004
    {
        "type": "مصر",
        "answers": ["القاهرة"]
    },
    {
        "type": "سوريا",
        "answers": ["دمشق"]
    },
    {//////bot by Taino#6004
        "type": "السعودية",
        "answers": ["الرياض"]
    },
    {
        "type": "اليمن",
        "answers": ["صنعاء"]
    },
    {
        "type": "السودان",
        "answers": ["الخرطوم"]//////bot by Taino#6004
    },
    {
        "type": "الاردن",
        "answers": ["عمان"]
    },
    {
        "type": "ليبيا",
        "answers": ["طرابلس"]
    },//////bot by Taino#6004
    {
        "type": "البحرين",
        "answers": ["المنامة"]
    }
]//////bot by Taino#6004
/////////////////
const Discord = require('discord.js');
const logger = require('winston'); //NOURELDIEN ALPHACODES
const connect4 = require('./connect4/connect4.js');
//NOURELDIEN ALPHACODES
const runningGames = new Map(); //NOURELDIEN ALPHACODES
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug'; //NOURELDIEN ALPHACODES
 
 //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
 
const playTheGame = (msg) => {
    if(runningGames.has(msg.author.id)){
        console.log(runningGames);
    }else{
        runningGames.set(msg.author.id, new connect4());
    }
};
 
 
const emojiToCol = new Map();
emojiToCol.set('\u0031\u20E3',0);
emojiToCol.set('\u0032\u20E3',1);
emojiToCol.set('\u0033\u20E3',2); //NOURELDIEN ALPHACODES
emojiToCol.set('\u0034\u20E3',3); //NOURELDIEN ALPHACODES
emojiToCol.set('\u0035\u20E3',4); //NOURELDIEN ALPHACODES
emojiToCol.set('\u0036\u20E3',5); //NOURELDIEN ALPHACODES
emojiToCol.set('\u0037\u20E3',6); //NOURELDIEN ALPHACODES
let theMsgWeWorkWith;
 
const createDisplayGrid = (grid) => {
    let theCurrentGrid = grid.getGridForDisplay();
    let msgTxt = "";
    for(let row of theCurrentGrid){  
        msgTxt += row.join('')
        .replace(/0/g,':white_large_square: ')
        .replace(/Y/g,':red_circle: ')
        .replace(/R/g,':large_blue_circle: ');
        msgTxt+='\n'; //NOURELDIEN ALPHACODES
    }
    return msgTxt;
}
 //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
const createMessageAndCollector = (message) => {
    message.channel.send(createDisplayGrid(runningGames.get(message.author.id)))
    .then(function(msg){
        theMsgWeWorkWith = msg;
        msg.react('\u0031\u20E3').then(() => { //NOURELDIEN ALPHACODES
            msg.react('\u0032\u20E3').then(() => {
                msg.react('\u0033\u20E3').then(() => {
                    msg.react('\u0034\u20E3').then(() => {
                        msg.react('\u0035\u20E3').then(() => {
                            msg.react('\u0036\u20E3').then(() => {
                                msg.react('\u0037\u20E3');
                            })
                        })
                    })
                })
            }) //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
        });
        let filter = function(reaction, user){
            return user.id != bot.user.id && user.id == message.author.id;
        };
        let collector = msg.createReactionCollector(filter, { time: 60000 });
        collector.on('collect', function(reaction){
            console.log(theMsgWeWorkWith);
            if(emojiToCol.has(reaction.emoji.name)){
                let g = runningGames.get(message.author.id);
                g.play('R', emojiToCol.get(reaction.emoji.name));
                g.IA_cleanSmartPlay('Y');
                if(g.isWon()||g.isDraw()){
                    theMsgWeWorkWith.delete()
                    .then(()=>{
                        collector.stop();
                        message.channel.send(createDisplayGrid(g));
                        if(g.isDraw())
                            message.channel.send(Match nul);
                        if(g.isWon())
                            message.channel.send(:tada: | **Congratulations ${((g._winner == 'Y')?':red_circle:':':large_blue_circle:')} won the game !);
                        runningGames.delete(message.author.id);
                    })
                    .catch(console.log("Cannot delete"));
                }
                else{
                    theMsgWeWorkWith.delete()
                    .then(()=>{ //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
                        collector.stop();
                        createMessageAndCollector(message);
                    })
                    .catch(console.log("Cannot delete"));
                }
                console.log(g);
            }
        });
        collector.on('end', function(collected, reason){
     
        });
    });
}; //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
 
// Initialize Discord Bot
const bot = new Discord.Client();
 
/* Bot stuff, creating ready event*/
bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});
 
bot.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with prefix
    let prefix = "=";
    if(message.author.id == bot.user.id)
        return;
    if (message.content.substring(0, 1) == prefix) {  
        let args = message.content.substring(prefix.length).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) { //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
            case 'c4':
                message.channel.send(:fire: **${message.author}** VS **NourBot** :fire:)
                playTheGame(message);
                createMessageAndCollector(message);
                ///////////////////////////////////////////
               /*
                theMsgWeWorkWith = message.channel.send('Play')
                .then(function(msg){
                    msg.react('\u0031\u20E3').then(() => {
                        msg.react('\u0032\u20E3').then(() => {
                            msg.react('\u0033\u20E3').then(() => {
                                msg.react('\u0034\u20E3').then(() => {
                                    msg.react('\u0035\u20E3').then(() => {
                                        msg.react('\u0036\u20E3').then(() => {
                                            msg.react('\u0037\u20E3');
                                        })
                                    })
                                })
                            })
                        })
                    });
                    var filter = function(reaction, user){
                        return user.id != bot.user.id;
                    };
                    const collector = msg.createReactionCollector(filter, { time: 60000 });
                    collector.on('collect', function(reaction){
                        if(emojiToCol.has(reaction.emoji.name)){
                            let g = runningGames.get(message.author.id);
                            g.play('R', emojiToCol.get(reaction.emoji.name));
                            g.IA_cleanSmartPlay('Y');
                            if(g.isWon())
                                message.channel.send("PArtie terminée");
                            console.log(g);
                        }
                    });
                    collector.on('end', function(collected, reason){
                 
                    });
                });*/
                ////////////////////////////////////////
            break; //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
            case 'c4play':
                console.log(runningGames.get(message.author.id));
            break;
         }
     }
}); //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES //NOURELDIEN ALPHACODES
 
//////////////////
var cats = [
 
"https://cdn.discordapp.com/attachments/477840502583066624/489925349480595471/c8458dcb83ef3f51eb67871656460acda8008de1_hq.jpg",
"https://cdn.discordapp.com/attachments/471048168734326784/489926293945843722/D986D983D8AA-D8B9D986-D8A7D984D8A8D986D8A7D8AA-4.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926344956837918/D986D983D8AA-D986D983D8A7D8AA-D986D983D8AA-D985D8B6D8ADD983D8A9-130.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926377219555328/3dlat.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926396878127114/images.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926441497001984/75e9de50bbe56adfa2dd0d79765618f3_400x400.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926523143585793/maxresdefault.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926558975262721/D986D983D8AAD8A9-1.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926561441513482/3dlat.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926572699025408/83efa282386a3c97b55b554e12034f09.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489926573823361037/images.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927028988968970/3dlat.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927039474991117/3dlat.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927054238679052/hqdefault.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927075751395338/images.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927100300525568/screen-16.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927135952240666/D986D983D8AAD987.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927196056748032/1462535501-kololk.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927216474357771/52ec73eb7867b5d69fe2573c695ddec0ef59aaae_00.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927223055220736/10352280_326716524148020_473570926368633860_n.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927225953615872/84.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927310246674432/D8B5D988D8B1-D986D983D8AA-D985D8B6D8ADD983D8A9-D8ACD8AFD8A7-500x380.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927542812180493/D8B5D988D8B1-D986D983D8AA-2.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927575783735316/750a293b4222503c2c82ea351795d82d94d394bd_hq.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927587653615626/joke.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927610260914178/D8B5D988D8B1-D986D983D8AA-32.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927618972352547/images.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927638794764288/3dlat.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927661502857226/images.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927734458581002/665.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927737738526721/D986D983D8AA-D985D8B6D8ADD983D8A9-5.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927741555343405/5L756426.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489927775168233493/27-1.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928045449314356/D986D983D8AA.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928124188852226/C_0g73iVYAARXkq.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928134347587604/almastba.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928135379517440/e3b1c8571e56805fc07e776eb5fd46df-best-funny-images-arabic-jokes.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928158141743112/PIC-724-1452961611-1.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928201116581888/do.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928210126077955/21581874-v2_xlarge.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928236390940698/D986D983D8AA-D985D8B6D8ADD983D8A9-3.png",
"https://cdn.discordapp.com/attachments/471048168734326784/489928244293009408/D986D983D8AA-D986D983D8A7D8AA-D986D983D8AA-D985D8B6D8ADD983D8A9-128.png"
]
    client.on('message', message => {
        var args = message.content.split(" ").slice(1);//////bot by Taino#6004
    if(message.content.startsWith("Bنكت")) {
         var cat = new Discord.RichEmbed()//////bot by Taino#6004
.setImage(cats[Math.floor(Math.random() * cats.length)])
message.channel.sendEmbed(cat);//////bot by Taino#6004
    }
});
//////bot by Taino#6004
////////////////////////
 
const zead = [
   '* انا اسمي مريم *',
   '* مرحباَ ماهو اسمك ؟ *',
   *** اهلا بك ! انا تائهه في هذا المكان  ***,
   '* هل تود مساعدتي ؟ *',
   '* لماذا هل انت قاسي القلب ؟ *',
   '* انني اشفق عليك يجب ان تطهر روحك وتحب الخير للجميع *',//////bot by Taino#6004
   '* ابتعد عني قليل انني متعبة *',
     '* هل انت نادم على ماقلت ؟ *',
   '* هل تود مساعدتي ؟ *',
   '* واو اشكرك انك شخصاَ رائع ! *',
   '* ابحث معي عن منزلي لقد كان قريباَ من هنا *',
   '* ولاكن عندما حل الليل لم اعد ارى اي شيء *',
   '* مذا تظن اين يوجد ؟ يمين او يسار *',
   '* هيا اذاَ *',
   '* اود ان اسئلك سؤال ونحن في الطريق *',
   '* هل تراني فتاة لطيفة ام مخيفة *',//////bot by Taino#6004
   '* اشكرك !  *',
   '* لقد وصلنا الى المنزل شكراَ جزيلَ انتطرني ثواني وسوف اعود *',
   '* هل انت جاهز ؟ *',
   '* لقد اخبرت والدي عنك وهم متحمسين لرؤيتك *',//////bot by Taino#6004
   '* هل تود ان تراهم الان *',
'* انا لست الحوت الازرق كما يدعون *',
   '* انا لست كاذبة صدقني***',
   '* لماذا ارى في عينيك الخوف ؟ *',//////bot by Taino#6004
   '* انا مجرد فتاة لطيفة تحب اللعب مع الجميع *',
   '* اعرف كل شيء يحدث اسمع ذالك بالراديو *',
   '* سمعت ان البشر يقتلون من اجل المال فقط *',
   '* لماذا لم تدخل الغرفة ؟ *',
   '* ههههههههههههههههههه انت الان مسجون في هذه الغرفة *',
   '* لن تخرج حتى اعود لك بعد قليل *',//////bot by Taino#6004
   '* المفتاح معك ! اكتب .مريم  *',
   '* مفتاح احمر , هل حصلت عليه ؟ *',
   '* ان لم تحصل عليه , اكتب .مريم مرة اخرى *',
   '* مفتاح اسود . هل حصلت عليه ؟ *',
   '* اين تريد ان تختبئ بسرعة قبل ان تعود *',//////bot by Taino#6004
   '* لقد عادت من جديد الى المنزل *',
   '* لا تصدر اي صوت ! *',
   '* مريم : لقد عدت *',
   '* مريم : يا ايها المخادع اين انت *',
   '* مريم : اعلم انك هنا في المنزل *',
   '* مريم : ماذا تريد ان تسمع *',//////bot by Taino#6004
   '* احد ما خرج من المنزل *',
   '* انتظر الجزء الثاني عندما يوصل البوت 100 سيرفر , ساعدني في نشر البوت وادخل هذا السيرفر  *'
];
 client.on('message', message => {
 if (message.content.startsWith('Bمريم')) {//////bot by Taino#6004
  var mariam= new Discord.RichEmbed()
  .setTitle("لعبة مريم ..")//////bot by Taino#6004
  .setColor('RANDOM')
  .setDescription(${zead[Math.floor(Math.random() * zead.length)]})//////bot by Taino#6004
  .setImage("https://www.npa-ar.com/wp-content/uploads/2017/08/%D9%84%D8%B9%D8%A8%D8%A9-%D9%85%D8%B1%D9%8A%D9%85-300x200.jpg")
   message.channel.sendEmbed(mariam);
  }
});
//////////////////////////////////////////
var cats = [
 
      "https://cdn.discordapp.com/attachments/479044877745782801/479045993132720128/download_1.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046003937247253/download_2.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046011956887552/download_3.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046019904962562/download_4.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046030214692864/download_5.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046039794352151/download_6.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046055581974549/download_7.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046065367154712/download.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046084442980354/images_1.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046105674547216/images_4.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046113945583639/images_5.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046119838580756/images_6.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046131796672513/images_7.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046143318425621/images_8.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046152491368448/images_9.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046158979825686/images_10.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046162247188498/images_11.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046196434960416/images_12.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046214571130882/images_13.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046219528929290/images_14.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479072892022161408/images_15.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046222045511685/images_16.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046225086382081/images_18.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046228047560736/images_19.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046230794829834/images_20.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046233533710336/images_21.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479074274850766863/images_22.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046289477337089/images_23.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046293436629041/images_24.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046294925606914/images_25.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046303330992169/images_26.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046307072311317/images_27.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046315100340224/images_28.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046325619392537/images_29.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046333114875907/images_30.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046334825889807/images_31.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046338718466058/images_32.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046340379148288/images_33.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046342795198484/images_34.jpg",
      "https://cdn.discordapp.com/attachments/479044877745782801/479046349644365827/images.jpg"
      ]
          client.on('message', message => {
              var args = message.content.split(" ").slice(1);//////bot by Taino#6004
          if(message.content.startsWith('Bهل تعلم')) {
               var cat = new Discord.RichEmbed()
      .setImage(cats[Math.floor(Math.random() * cats.length)])//////bot by Taino#6004
      message.channel.sendEmbed(cat);
          }//////bot by Taino#6004
      });
//////////////////////////
   client.on('message', message => {//////bot by Taino#6004
                   if(message.channel.type === "dm") return;
                     if(message.content.startsWith ("Bmarry")) {
                     if(!message.channel.guild) return message.reply(' This command only for servers ')
                     var proposed = message.mentions.members.first()
//////bot by Taino#6004
                     if(!message.mentions.members.first()) return message.reply('لازم تطلب ايد وحدة').catch(console.error);
                     if(message.mentions.users.size > 1) return message.reply('ولد ما يضبط لازم بنت تذكر لازم بنت الحلال').catch(console.error);
                      if(proposed === message.author) return message.reply(**خنثى ؟ **);//////bot by Taino#6004
                       if(proposed === client.user) return message.reply(** تبي تتزوجني؟ **);
                             message.channel.send(`**${proposed}//////bot by Taino#6004
                بدك تقبلي عرض الزواج من ${message.author}
                العرض لمدة 10 ثانية
                اكتب موافقة او لا**`)
//////bot by Taino#6004
               const filter = m => m.content.startsWith("موافقة");
               message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
               .then(collected =>{//////bot by Taino#6004
                   message.channel.send(**${message.author} و ${proposed} الف الف مبروك انشاء الله تستمتعون بحياتكم الزوجية ويطول اعماركم ولا تنسون شهر العسل**);
               })//////bot by Taino#6004
                  .catch(collected => message.channel.send(**السكوت علامة الرضا نقول قلللوش مبروك**))
//////bot by Taino#6004
                  const filte = m => m.content.startsWith("لا");//////bot by Taino#6004
               message.channel.awaitMessages(filte, { max: 1, time: 15000, errors: ['time'] })
               .then(collected =>{//////bot by Taino#6004
                  message.channel.send(**${message.author} تم رفض عرضك**);
               })
 
 
 
 
                 }
               });//////bot by Taino#6004
//////////////////////
 
       client.on('message', message => {
           if (message.content.startsWith("Bhack")) {//////bot by Taino#6004
             if (message.author.bot) return
                  message.delete();
                    let args = message.content.split(' ').slice(1);
                          let virusname = args.join(' ');//////bot by Taino#6004
                        if (virusname < 1) {
                            return message.channel.send("`اكتب اسم الشخص الي تبي يتهكر`");
                                            }
                        message.channel.send({embed: new Discord.RichEmbed().setTitle('Loading ' + virusname + "...").setColor(0xFF0000)}).then(function(m) {
                    setTimeout(function() {
                      m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓ ] 1%').setColor(0xFF0000)})
                    }, 1000)
                   setTimeout(function() {
                      m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓▓▓▓] 25%').setColor(0xFF0000)})
                    }, 2000)
                  setTimeout(function() {
                      m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ] 100%').setColor(0xFF0000)})
                    }, 3000)
                       setTimeout(function() {
                      m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Uploaded! Initiating explosion in 1...').setColor(0xFF0000)})
                    }, 4000)
                     setTimeout(function() {//////bot by Taino#6004
                      m.delete()
                  }, 5000)//////bot by Taino#6004
                    setTimeout(function() {
                      message.channel.send('تم تهكيرك')
                  }, 6000)
                  });
                }
        });
 
 client.on('message', message => {
        if(message.content === prefix + "Bhc") {
        if(!message.channel.guild) return;
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('You Dont Have Perms ❌');
               message.channel.overwritePermissions(message.guild.id, {
               READ_MESSAGES: false
   })
                message.channel.send('Channel Hided Successfully ! ✅  ')
   }
  });


client.on('message', message => {
        if(message.content === prefix + "Bsc") {
        if(!message.channel.guild) return;
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('❌');
               message.channel.overwritePermissions(message.guild.id, {
               READ_MESSAGES: true
   })
                message.channel.send('Done  ')
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

client.on("message", (message) => {
                        if (message.channel.type === "dm") {
                    if (message.author.id === client.user.id) return;
                    let yumz = new Discord.RichEmbed()
                                .setTimestamp()
                                .setTitle("Direct Message To The Bot")
                                .addField(Sent By:, <@${message.author.id}>)
                                .setColor("RANDOM")
                                .setThumbnail(message.author.displayAvatarURL)
                                .addField(Message: `, `\n\n\`\`\`${message.content}\`\`\`)
                                .setFooter(DM Bot Messages | DM Logs)
                            client.users.get("الايدي حقك").send(yumz)
                        }
            });
			
			const Discord = require("discord.js");
const client = new Discord.Client();
var prefix = "B";
client.on('message', message => { // Leaked by [ @Out Our server ]
   if(!message.channel.guild) return;
if(message.content.startsWith(prefix + 'bc')) {
if(!message.channel.guild) return message.channel.send('*هذا الأمر فقط للسيرفرات*').then(m => m.delete(5000));
if(!message.member.hasPermission('ADMINISTRATOR')) return
const args = message.content.split(" ").slice(1).join(" ")
const BcList = new Discord.RichEmbed()
.setThumbnail(message.author.avatarURL)
.setAuthor(محتوى الرساله : ${args})
.setDescription(**برودكاست بـ امبد 📝\nبرودكاست بدون امبد✏ \nلديك دقيقه للأختيار قبل الغاء البرودكاست**)
if (!args) return message.reply('*يجب عليك كتابة كلمة او جملة لإرسال البرودكاست*');message.channel.send(BcList).then(msg => {
msg.react('📝')
.then(() => msg.react('✏'))
.then(() =>msg.react('📝'))
 
var EmbedBcFilter = (reaction, user) => reaction.emoji.name === '📝' && user.id === message.author.id;
var NormalBcFilter = (reaction, user) => reaction.emoji.name === '✏' && user.id === message.author.id;
 
var EmbedBc = msg.createReactionCollector(EmbedBcFilter, { time: 60000 });
var NormalBc = msg.createReactionCollector(NormalBcFilter, { time: 60000 });
 
 
EmbedBc.on("collect", r => {
 
message.channel.send(:ballot_box_with_check: تم ارسال الرساله بنجاح).then(m => m.delete(5000));
message.guild.members.forEach(m => {
var EmbedRep = args.replace('<server>' ,message.guild.name).replace('<user>', m).replace('<by>', ${message.author.username}#${message.author.discriminator})
var bc = new
Discord.RichEmbed()
.setColor('RANDOM')
.setDescription(EmbedRep)
.setThumbnail(message.author.avatarURL)
m.send({ embed: bc })
msg.delete();
})
})
NormalBc.on("collect", r => {
  message.channel.send(:ballot_box_with_check: تم ارسال الرساله بنجاح).then(m => m.delete(5000));
message.guild.members.forEach(m => {
var NormalRep = args.replace('<server>' ,message.guild.name).replace('<user>', m).replace('<by>', ${message.author.username}#${message.author.discriminator})
m.send(NormalRep);
msg.delete();
})
})
})
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
      if(message.content.startsWith ("Bmarry")) {
      if(!message.channel.guild) return message.reply('* This command only for servers *')
      var proposed = message.mentions.members.first()
     
      if(!message.mentions.members.first()) return message.reply(' ?? *لازم تطلب ايد وحدة*').catch(console.error);
      if(message.mentions.users.size > 1) return message.reply(' ?? *ولد ما يصحلك الا حرمة وحدة كل مرة*').catch(console.error);
       if(proposed === message.author) return message.reply(**خنثى ؟ **);
        if(proposed === client.user) return message.reply(** تبي تتزوجني؟ **);
              message.channel.send(`**${proposed} 
 بدك تقبلي عرض الزواج من ${message.author} 
 العرض لمدة 15 ثانية  
 اكتبي موافقة او لا**`)

const filter = m => m.content.startsWith("موافقة");
message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
.then(collected =>{ 
    message.channel.send(` *${message.author} و ${proposed} الف الف مبروك الله , يرزقكم الذرية الصالحة* `);
})

   const filte = m => m.content.startsWith("لا");
message.channel.awaitMessages(filte, { max: 1, time: 15000, errors: ['time'] })
.then(collected =>{ 
   message.channel.send(`  *${message.author} تم رفض عرضك* `);
})
        
  }
});

client.on('message',  (message) => {
        if(message.content.startsWith('Bkf')) {
  let user = message.mentions.users.first();
  if (!user) {

    return message.emit('commandUsage', message, this.help);
  }
  let slaps = [
    'https://i.giphy.com/media/3XlEk2RxPS1m8/giphy.gif',
    'https://i.giphy.com/media/mEtSQlxqBtWWA/giphy.gif',
    'https://i.giphy.com/media/j3iGKfXRKlLqw/giphy.gif',
    'https://i.giphy.com/media/2M2RtPm8T2kOQ/giphy.gif',
    'https://i.giphy.com/media/l3YSimA8CV1k41b1u/giphy.gif',
    'https://i.giphy.com/media/WLXO8OZmq0JK8/giphy.gif'
  ];

  message.channel.send({
    embed: {
      description: ${message.author.username} ضربك كف بنص وجهك ${user.username}!,
      image: {
        url: slaps[Math.floor(Math.random() * slaps.length)]
      }
    }
  }).catch(e => {
    client.log.error(e);
  })
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


client.on('message', message => {
    if (message.content.startsWith("Bhacked")) {
      if (message.author.bot) return
           message.delete();
             let args = message.content.split(' ').slice(1);
                   let virusname = args.join(' ');
                 if (virusname < 1) {
                     return message.channel.send("`اكتب اسم الشخص الي تبي يتهكر`");
                                     }
                 message.channel.send({embed: new Discord.RichEmbed().setTitle('Loading ' + virusname + "...").setColor(0xFF0000)}).then(function(m) {
             setTimeout(function() {
               m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓ ] 1%').setColor(0xFF0000)})
             }, 1000)
            setTimeout(function() {
               m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓▓▓▓] 25%').setColor(0xFF0000)})
             }, 2000)
           setTimeout(function() {     
               m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Loading Discord Virus [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ] 100%').setColor(0xFF0000)})
             }, 3000)
                setTimeout(function() {
               m.edit({embed: new Discord.RichEmbed().setTitle('[' + virusname + ']: Uploaded! Initiating explosion in 1...').setColor(0xFF0000)})
             }, 4000)
              setTimeout(function() {
               m.delete()
           }, 5000)
             setTimeout(function() {
               message.channel.send('تم تهكير جهازك راقب ماذا سيحدث تاليا')
           }, 6000)
           });
         }
 });
 
 
 
  client.on('message', async message => {
  if(message.content.startsWith(prefix + "Bapply")) {
    await message.channel.send("*الاسم*").then(e => {
    let filter = m => m.author.id === message.author.id
    let lan = '';
    let md = '';
    let br = '';
    let chaLan = message.channel.awaitMessages(filter, { max: 1, time: 40000, errors: ['time'] })
    .then(collected => {
      lan = collected.first().content
      collected.first().delete()
e.delete();
     message.channel.send('*العمر*').then(m => {
let chaMd = message.channel.awaitMessages(filter, { max: 1, time: 40000, errors: ['time'] })
.then(co => {
  md = co.first().content
        co.first().delete()
        m.delete();
message.channel.send('*ماذا تستطيع ان تقدم للسيرفر*').then(ms => {
let br = message.channel.awaitMessages(filter, { max: 1, time: 40000, errors: ['time'] })
.then(col => {
  br = col.first().content
        col.first().delete()

ms.delete()

 message.channel.send('جاري التقديم ..').then(b => {
        setTimeout(() => {
  b.edit(**تم التقديم وسيتم الرد فـ اقرب وقت**)
        },2000);
var gg = message.guild.channels.find('name', 'التقديمات')
if(!gg) return;
if(gg) {
gg.send({embed : new Discord.RichEmbed()
.setDescription(**  الاسم :question:  : \n ${lan}\nالعمر :link: :\n ${md} \n ماذا تستطيع ان تقدم للسيرفر :question: :\n ${br}  \nتم التقديم بواسطة  : <@${message.author.id}> **)  
          .setFooter(ادارة السيرفر)
.setTimestamp()
});
}        
})
})
})
})
})
})
})
 }
})

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


client.on('message', message =>{
    let args = message.content.split(' ');
    let prefix = 'B'; //تقدر تغير البرفكس
    
    if(args[0] === ${prefix}avatar){
        let mentions = message.mentions.members.first()
        if(!mentions) {
          let sicon = message.author.avatarURL
          let embed = new Discord.RichEmbed()
          .setImage(message.author.avatarURL)
          .setColor("#f7abab") 
          .setDescription(**${message.author.username}#${message.author.discriminator}**'s avatar :);
          message.channel.send({embed})
        } else {
          let sicon = mentions.user.avatarURL
          let embed = new Discord.RichEmbed()
          .setColor("#f7abab")
          .setDescription(**${mentions.user.username}#${mentions.user.discriminator}**'s avatar :)
          .setImage(sicon)
          message.channel.send({embed})
        }
    };
});

client.on('message', message => {
    if (message.content.startsWith("Bbans")) {
        message.guild.fetchBans()
        .then(bans => message.channel.send(`${bans.size} عدد اشخاص المبندة من السيرفر `))
  .catch(console.error);
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
 
client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

  if (command == "say") {
if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('?|**\`ADMINISTRATOR\`ليس لديك صلاحيات`**');


   message.channel.sendMessage(args.join("  "))
   message.delete()
  }
 });

 
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

client.on("message", (message) => {
    /// ALPHA CODES
   if (message.content.startsWith("Bnew")) {     /// ALPHA CODES
        const reason = message.content.split(" ").slice(1).join(" ");     /// ALPHA CODES
        if (!message.guild.roles.exists("name", "Support Team")) return message.channel.send(لازم تسوي رتبة اسمها \Support Team\` وتنطي البوت ادمنيتر حتا يقدر يسوي الرومات ويعدل برمشنات`);
        if (message.guild.channels.exists("name", "ticket-{message.author.id}" + message.author.id)) return message.channel.send(You already have a ticket open.);    /// ALPHA CODES
        message.guild.createChannel(ticket-${message.author.username}, "text").then(c => {
            let role = message.guild.roles.find("name", "Support Team");
            let role2 = message.guild.roles.find("name", "@everyone");
            c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });    /// ALPHA CODES
            c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            message.channel.send(:white_check_mark: تم انشاء تذكرتك, #${c.name}.);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .addField(Hey ${message.author.username}!, تم فتح تذكرة الرجاء انتظار الى حين يأتي مشرف ويقوم بلرد عليك)
                .setTimestamp();
            c.send({
                embed: embed
            });
        }).catch(console.error);
    }
 
 
  if (message.content.startsWith("Bclose")) {
        if (!message.channel.name.startsWith(ticket-)) return message.channel.send(You can't use the close command outside of a ticket channel.);
 
       message.channel.send(هل انت متأكد من اقفالك للتذكرة اذا متأكد اكتب Bclose)
           .then((m) => {
               message.channel.awaitMessages(response => response.content === 'Bclose', {
                       max: 1,
                       time: 10000,
                       errors: ['time'],
                   })    /// ALPHA CODES
                   .then((collected) => {
                       message.channel.delete();
                   })    /// ALPHA CODES
                   .catch(() => {
                       m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                           m2.delete();
                       }, 3000);
                   });
           });
   }
 
});
 

client.on('ready', () => {
   console.log(----------------);
      console.log(Desert Bot- Script By : EX Clan);
        console.log(----------------);
      console.log(`ON ${client.guilds.size} Servers '     Script By : EX Clan ' `);
    console.log(----------------);
  console.log(Logged in as ${client.user.tag}!);
client.user.setGame(Bhelp | BloodSystem,"http://twitch.tv/Blood")
client.user.setStatus("dnd")
});
 
 
 
client.on('message' , message => {
if(message.content === 'Bhelp') {
  var EsTeKnAN = new Discord.RichEmbed()
  .setColor('RANDOM')
message.author.send(`
*_وصف عن البوت_*
**
─════════════ {✯اوامر البوت✯} ════════════─
❧ Bbc ➺ برودكاست ب امبيد وبدون
❧ BLink ➺ رابط انفايت للسيرفر
❧ Bclear ➺ مسح الشات
❧ Bserver ➺ لعرض معلومات السيرفر
❧ Bmarry ➺ لعبة الزواج
❧ Bkf ➺ لعبة كف
❧ Bmc ➺ قفل الشات
❧ Bumc ➺ فتح الشات
❧ Bhacked ➺ لعبة التهكير
❧ Bapply ➺ تقديم / لازم في روم اسمه التقديمات
❧ Breport ➺ تبليغ / لازم في روم اسمه repoerts
❧ Bavatar ➺ عرض صورتك او شخص تمنشنه
❧ Bbans ➺ يقولك عدد الاشخاص المبندين من السيرفر
❧ Bct ➺ انشاء روم كتابي
❧ Bcv ➺ انشاء روم صوتي
❧ BsetVoice ➺ يسويلك روم ويقولك عدد الاشخاص في الرومات الصوتية
❧ Bmove ➺ سحب عضو للروم الصوتي
❧ Bban ➺ تبنيد عضو من السيرفر
❧ Bkick ➺ طرد عضو من السيرفر
❧ BMute ➺ اعطاء ميوت كتابي
❧ Bunmute ➺ فك الميوت الكتابي
❧ Brooms ➺ لعرض الرومات الموجودة في السيرفر
❧ Broles ➺ لعرض الرتب الموجودة في السيرفر
❧ Bsay ➺ البوت يكرر كلام انته تحدده
❧ Bid ➺ لعرض معلوماتك
❧ Bnew ➺ لانشاء تذكرة
❧ Bplay ➺ لتشغيل اغنيه
❧ Bstop ➺ لتوقيف اغنيه
❧ Bskip ➺ لتخطي الاغنيه
─════════════ {✯Blood,Server✯} ════════════─
**
`);
}
})
 
client.login(process.env.BOT_TOKEN);
