const Discord = require("discord.js")
const config = require("./config.json")
const bot = new Discord.Client();
const fs = require("fs");
bot.commands = new Discord.Collection();
const db = require("quick.db")
var jimp = require('jimp');

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

jsfile.forEach((f, i) =>{
  let props = require(`./commands/${f}`);
  console.log(`${f} loaded!`);
  bot.commands.set(props.help.name, props);
});

});


bot.on("ready", () => {
  console.log(bot.user.username + " is online.")
});

bot.on("message", async message => {
  //a little bit of data parsing/general checks
 
  if(message.author.bot) return;
  if(message.channel.type === 'dm') return;
  let content = message.content.split(" ");
  let command = content[0];
  let args = content.slice(1);
  let prefix = config.prefix;
  if(!message.content.startsWith(prefix)) return;

  //checks if message contains a command and runs it
  let commandfile = bot.commands.get(command.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);
})
bot.on('guildMemberAdd', async member => {
	
	let wChan = db.fetch(`${member.guild.id}`)
	
	if(wChan == null) return;
	
	if(!wChan) return;
	
let font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK) //We declare a 32px font
  let font64 = await jimp.loadFont(jimp.FONT_SANS_64_WHITE) //We declare a 64px font
  let bfont64 = await jimp.loadFont(jimp.FONT_SANS_64_BLACK)
  let mask = await jimp.read('https://i.imgur.com/552kzaW.png') //We load a mask for the avatar, so we can make it a circle instead of a shape
  let welcome = await jimp.read('http://rovettidesign.com/wp-content/uploads/2011/07/clouds2.jpg') //We load the base image

  jimp.read(member.user.displayAvatarURL).then(avatar => { //We take the user's avatar
    avatar.resize(200, 200) //Resize it
    mask.resize(200, 200) //Resize the mask
    avatar.mask(mask) //Make the avatar circle
    welcome.resize(1000, 300)
	
  welcome.print(font64, 265, 55, `Welcome ${member.user.username}`) //We print the new user's name with the 64px font
  welcome.print(bfont64, 265, 125, `To ${member.guild.name}`)
  welcome.print(font64, 265, 195, `There are now ${member.guild.memberCount} users`)
  welcome.composite(avatar, 40, 55).write('Welcome2.png') //Put the avatar on the image and create the Welcome2.png bot
  try{
  member.guild.channels.get(wChan).send(``, { files: ["Welcome2.png"] }) //Send the image to the channel
  }catch(e){
	  // dont do anything if error occurs
	  // if this occurs bot probably can't send images or messages
	  console.error(e);
  }
  })

	
	
})


bot.login(config.token)
