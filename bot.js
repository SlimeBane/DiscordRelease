const Discord = require('discord.js');
const auth = require('./auth.json');
const calendar = require('./calendar.json');
const ical = require('ical');
const youtube = require('ytdl-core');
const streamOptions = {seek: 0, volume: 1};
const schedule = require('node-schedule');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fdays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
d = new Date();
const fs = require('fs');
const MessageHandler = require('./Message');
const MessageJson = require('./txt');
const inputValidator = require('./InputValidator');


var jobs = [];
var deadlines = [];

// Configure logger settings


// Initialize Discord Bot
var bot = new Discord.Client();

bot.on('ready', () => {
    console.log('ready');
    bot.user.setPresence({ game: { name: 'with my private vars' }, status: 'busy' })
    .catch(console.error);

    console.log(bot.voiceConnections.array());
    for (let i = 0; i < bot.voiceConnections.array().length; i++){

        bot.voiceConnections.array()[i].leave();
    }


    let channels = bot.channels.array();
    for (let i=0; i<channels.length; i++){
        if(channels[i].id === '468453158419562518'){
            channels[i].send('I just got activated by my master! ')
        }
    }

    readDeadlines(channels);

    /*schedule.scheduleJob('38 20 * * *', function(){
        let channels = bot.channels.array()
        for (i=0; i<channels.length; i++){
            if(channels[i].id === 468453158419562518){
                channels[i].send('My time has come')
            }
        }
    })*/
});

bot.login(auth.token);


// Returns Monday of this week


// Returns index of months array from the full english name


function writeDeadline(year, month, day, hour, minute, msg, vak, channelID, userID){
    let data = fs.readFileSync('Deadlines.txt', 'utf-8');

    data += minute + '-';
    data += hour + '-';
    data += day + '-';
    data += month + '-';
    data += year + ';';
    data += channelID + ';';
    data += vak + ';';
    data += msg + ';';
    data += userID;
    data += '\r\n';

    console.log(data);

    deadlines = data.split('\r\n');
    fs.writeFileSync('Deadlines.txt', data);
}

function listDeadLines(channel, vak){
    if(vak === ''){
        let txt = '';
        for (let i=0; i<deadlines.length; i++){
            if(deadlines[i] === '') continue;

            let deadlineargs = deadlines[i].split('-');
            let day = '';
            let hour = '';
            let minute = '';
            if(parseInt(deadlineargs[2]) < 10)
                day += '0';
            if(parseInt(deadlineargs[1]) < 10)
                hour += '0';
            if(parseInt(deadlineargs[0]) < 10)
                minute += '0';
            day += deadlineargs[2];
            hour += deadlineargs[1];
            minute += deadlineargs[0];


            txt += 'Vak ' + deadlines[i].split(';')[2] + ': ' + deadlines[i].split(';')[3] + ' indienen voor ' + day + ' '
                + months[parseInt(deadlineargs[3]) -1] + ' ' + hour + 'u' + minute + '\n';
        }
        if(txt === ''){
            txt = 'No deadlines found';
        }
        channel.send(txt)
    }
    else{

    }
}

function readDeadlines(channels){
    var deadline = fs.readFileSync('Deadlines.txt', 'utf-8');

    deadlines = deadline.split('\r\n');
    console.log(deadlines);

    for (let i=0; i< deadlines.length; i++){
        let args = deadlines[i].split(';');
        let time = args[0].split('-');
        let minute = parseInt(time[0]);
        let hour = parseInt(time[1]);
        let day = parseInt(time[2]);
        let month = parseInt(time[3]);
        let year = parseInt(time[4]);
        let date = new Date(year, month, day, hour, minute);
        console.log('finding ');
        console.log(args);

        let channelid = args[1];
        let mentions = '';

        for (let j=4; j<args.length; j++){
            mentions += '<@';
            mentions += args[j];
            mentions += '> ';
        }
        let msg = mentions + args[3];

        for (let k=0; k<channels.length; k++){
            if(channels[k].id === channelid){
                console.log(channelid);
                console.log(msg);
                jobs[jobs.length] = schedule.scheduleJob(date, function(){
                    channels[k].send(msg);
                })
            }
        }

    }
}

// Returns the edits stored in Edits.txt with that day and month
function getEdits(day, month ){
    // month 1-12
    let edits = fs.readFileSync('Edits.txt', 'utf-8');

    console.log(edits);

    let lines = edits.split('\r\n');
    console.log(lines);

    let result = '';

    for (i=0; i < lines.length; i++){
        let line = lines[i];
        let editDay = parseInt(line.substring(0, 2));
        let editMonth = parseInt(line.substring(3,5));

        console.log(editDay, editMonth);

        if(editDay === day && editMonth === month){
            result += line.substring(7);
            result += '\n';
        }
    }

    return result;
}

// Write a new edit to Edits.txt
function writeEdit(day, month, msg){
    let data = fs.readFileSync('Edits.txt', 'utf-8');
    if(day < 10){
        data += '0'
    }

    data += day;
    data += '-';
    if(month < 10){
        data += '0'
    }
    data += month;
    data += ': ';
    data += msg;
    data += '\r\n';

    console.log(data);
    fs.writeFileSync('Edits.txt', data);
    
}

// Removes an edit and return a msg for the bot 
function removeEdit(day, month){
    let data = fs.readFileSync('Edits.txt', 'utf-8');

    let lines = data.split('\r\n');
    let date = '';
    if(day < 10){
        date += '0';
    }
    date += day + '-' ;
    if(month < 10){
        date += '0';
    }
    date += month;
    console.log(date, lines);

    let newdata = '';
    let removed = 'Removed:\n';
    for (let i=0; i<lines.length; i++){
        console.log(lines[i].substring(0,5));
        // TODO check for indiv msg
        if(lines[i].substring(0,5) === date ){
            removed += lines[i] + '\n';
            console.log("removed", lines[i]);
        }
        else{
            newdata += lines[i] + '\r\n'
        }
    }

    console.log(newdata);
    fs.writeFileSync('Edits.txt', newdata);

    return removed;

}

// Clear the Edits.txt file
function clearEdits(){

}

// Calculates if the given year is a leap year
function schrikkeljaar(jaar){
    if(jaar % 4 === 0){
        if(jaar % 100 === 0){
            if(jaar % 400 === 0){
                return true;
            }
            else{
                return false;
            }
        }
        else{
            return true;
        }
    }
    return false;

}

function help(inputMessage) {
    let message = inputMessage.content;
    console.log(message.split(' ').length);
    if(message.split(' ').length !== 2){
        inputMessage.channel.send(MessageJson.failedhelp);
        return true;
    }
    if(message.split(' ')[1].toLowerCase() === 'help'){
        inputMessage.channel.send(MessageJson.help);
        return true;
    }
    else{
        inputMessage.channel.send(MessageJson.failedhelp);
        return true;
    }
}


function execComand(inputMessage){
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    let message = inputMessage.content;
    //console.log(inputMessage.channel)
    if(inputMessage.isMentioned(bot.user)){
        help(inputMessage)
    }
    if (message.substring(0, 1) === '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
        d = new Date();
        args = args.splice(1);
        cmd = cmd.toLocaleLowerCase();
        switch(cmd) {
            // !ping
            case 'ping':
                inputMessage.channel.send('Pong!');
                break;
                /*
            case 'deadline':
                switch(args.length) {
                    case 0:
                        break;
                    case 1:
                        if(args[0] === 'ls') listDeadLines(inputMessage.channel, '');
                        break;
                    case 4:

                    default:
                        if(args[0] === 'add'){
                            let time = args[1].split('-');
                            let vak = args[2];
                            let msg = args[3];
                            for (let i = 4; i < args.length; i++){
                                msg += args[i];
                            }
                            let year = d.getFullYear();
                            if(time.length === 5)
                                year = parseInt(time[0]);

                            let month = parseInt(time[3]);
                            let day = parseInt(time[2]);
                            let hour = parseInt(time[1]);
                            let minute = parseInt(time[0]);
                            writeDeadline(year, month, day, hour, minute, msg, vak, inputMessage.channel.id, inputMessage.author.id);
                            return true;

                        }
                        inputMessage.channel.send('Unrecognised Deadline command');
                        return true;
                }

                break; */
            case 'help':
                help(inputMessage);
                return true;

            case 'les':
                console.log(args.length);
                if(args.length === 0){
                    // les vandaag
                    ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
                        let today = d.getDate().toString();
                        today += '- ';
                        today += months[d.getMonth()];
                        today += ':\n';
                        let date = d;
                        let msg = MessageHandler.getMessage(date, data).toString();
                        if(msg === '```css\n```'){
                            today += "Geen les!\n ╯°□°）╯┻━┻"
                        }
                        else{
                            today += msg;
                        }
                        let edit = getEdits(d.getDate(), d.getMonth()+1);
                        if(edit !== ''){
                            today += "Edit: ";
                            today += edit
                        }
                        inputMessage.channel.send(today);
                        return true;
                    });
                }

                else{
                    if(args.length === 1){
                        var extra = args[0].split('-');
                        console.log(extra);
                        if(extra.length === 2){
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
                                let dag = parseInt(extra[0]);
                                let maand = parseInt(extra[1]);
                                if (!inputValidator.validateInputDate(dag, maand, d.getFullYear())){
                                    inputMessage.channel.send('Slechte datum');
                                    return false;
                                }

                                let date = new Date(d.getFullYear(), maand-1, dag);
                                let today = 'Les op ';
                                today += date.getDate();
                                today += "-";
                                today += months[date.getMonth()];
                                today += ":\n";
                                console.log(dag, maand-1);

                                let msg = MessageHandler.getMessage(date, data).toString();
                                if(msg === '```css\n```'){
                                    today += "Geen les!\n ╯°□°）╯┻━┻"
                                }
                                else{
                                    today += msg;
                                }
                                let edit = getEdits(dag, maand);
                                if(edit !== ''){
                                    today += "Edit: ";
                                    today += edit
                                }

                                console.log(msg);

                                inputMessage.channel.send(today);
                            });
                            console.log('done');
                            return true;
                        }
                        if(extra[0] === 'morgen'){
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                let date = new Date();
                                date.setDate(date.getDate() + 1);

                                let today = 'Les morgen (';
                                today += date.getDate();
                                today += "-";
                                today += months[date.getMonth()];
                                today += "):\n";
                                let msg = MessageHandler.getMessage(date, data).toString();
                                if(msg === '```css\n```'){
                                    today += "Geen les!\n ╯°□°）╯┻━┻"
                                }
                                else{
                                    today += msg;
                                }
                                today += getEdits(date.getDate(), date.getMonth()+1);

                                console.log(msg);

                                inputMessage.channel.send(today);
                                console.log('done');
                                return true;
                            });
                        }
                        if(extra[0] === 'overmorgen'){
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                let date = new Date();
                                date.setDate(date.getDate() + 2);
                                let today = 'Les overmorgen (';
                                today += date.getDate();
                                today += "-";
                                today += months[date.getMonth()];
                                today += "):\n";
                                let msg = MessageHandler.getMessage(date, data).toString();
                                if(msg === '```css\n```'){
                                    today += "Geen les!\n ╯°□°）╯┻━┻"
                                }
                                else{
                                    today += msg;
                                }
                                today += getEdits(date.getDate(), date.getMonth()+1);

                                console.log(msg);

                                inputMessage.channel.send(today);
                                console.log('done');
                                return true;
                            });
                        }
                        if(extra[0] === 'week'){
                            let maandag = MessageHandler.getMaandag();
                            console.log('in extra === week');
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
                                let today = 'Lesweek: (';
                                today += MessageHandler.getMaandag();
                                today += "-";
                                today += d.getMonth()+1;
                                today += ' tot ';
                                today += MessageHandler.getMaandag()+6;
                                today += "-";
                                today += d.getMonth()+1;
                                today += ')\n';

                                for(j=0; j<5; j++){
                                    let dag = maandag + j;
                                    let maand = d.getMonth()+1;
                                    let jaar = d.getFullYear();

                                    switch(maand){
                                        case 2:
                                            if(dag > 28){
                                                if(schrikkeljaar(jaar) && dag > 29){
                                                    dag -= 29;
                                                    maand = 3;
                                                    console.log("maand ++ wel schrikkeljaar")
                                                }
                                                else{
                                                    dag -= 28;
                                                    maand = 3;
                                                    console.log("maand ++ geen schrikkeljaar")
                                                }
                                            }
                                            break;
                                        case 4:
                                        case 6:
                                        case 9:
                                        case 11:
                                            if(dag > 30){
                                                dag -= 30;
                                                maand++;
                                                console.log('30 maand ++')
                                            }
                                            break;
                                        default:
                                            if(dag > 31){
                                                dag -= 31;
                                                maand++;
                                                console.log('30 maand ++')
                                            }
                                    }

                                    today += '__**' + days[j] + '**__';
                                    today += ': (' + dag + '-' + months[maand-1] + ')\n';
                                    let date = new Date();
                                    date.setDate(dag);
                                    date.setMonth(maand-1);
                                    let msg = MessageHandler.getMessage(date, data).toString();
                                    if(msg === '```css\n```'){
                                        today += "Geen les!\n ╯°□°）╯┻━┻"
                                    }
                                    else{
                                        today += msg;
                                    }
                                    today += getEdits(dag, maand);
                                    today += '\n\n';
                                    console.log(msg);

                                }

                                inputMessage.channel.send(today);
                                console.log('done');
                                return true;
                            });
                        }

                    }
                    if(args.length === 2){
                        if(args[0] === 'remove' || args[0] === 'del' || args[0] === 'delete' || args[0] === 'rm'){
                            let time = args[1].split('-');
                            if(time.length === 2){
                                let day = parseInt(time[0]);
                                let month = parseInt(time[1]);
                                console.log(time, day, month);
                                let msg = removeEdit(day, month);
                                if(msg === 'Removed:\n'){
                                    msg = 'No edits found on ' + day + '-' + month;
                                }
                                inputMessage.channel.send(msg);
                                return true;
                            }
                        }
                        if(args[0] === 'week'){
                            let time = args[1].split('-');
                            if(time.length === 2){
                                let day = parseInt(time[0]);
                                let month = parseInt(time[1]);
                                if (!inputValidator.validateInputDate(day, month, d.getFullYear())){
                                    inputMessage.channel.send('Foute kut datum');
                                    return false;
                                }
                                console.log(time, day, month);
                                let maandag = getMaandagFromAny(day, month);


                                console.log('maandag', maandag);
                                ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                    let today = 'Lesweek: (';
                                    today += maandag;
                                    today += "-";
                                    today += months[month-1];
                                    today += ' tot ';
                                    today += maandag+6;
                                    today += "-";
                                    today += month;
                                    today += ')\n';

                                    for(let j=0; j<5; j++){
                                        let dag = maandag + j;
                                        let maand = month;

                                        let jaar = d.getFullYear();

                                        switch(maand){
                                            case 2:
                                                if(dag > 28){
                                                    if(schrikkeljaar(jaar) && dag > 29){
                                                        dag -= 29;
                                                        maand = 3;
                                                        console.log("maand ++ wel schrikkeljaar");
                                                    }
                                                    else{
                                                        dag -= 28;
                                                        maand = 3;
                                                        console.log("maand ++ geen schrikkeljaar");
                                                    }
                                                }
                                                break;
                                            case 4:
                                            case 6:
                                            case 9:
                                            case 11:
                                                if(dag > 30){
                                                    dag -= 30;
                                                    maand++;
                                                    console.log('30 maand ++');
                                                }
                                                break;
                                            default:
                                                if(dag > 31){
                                                    dag -= 31;
                                                    maand++;
                                                    console.log('30 maand ++');
                                                }
                                        }

                                        today += '__**' + days[j] + '**__';
                                        today += ': (' + dag + '-' + months[maand] + ')\n';

                                        console.log(dag,maand-1);
                                        let date = new Date();
                                        date.setDate(dag);
                                        date.setMonth(maand-1);
                                        let msg = MessageHandler.getMessage(date, data).toString();
                                        if(msg === '```css\n```'){
                                            today += "Geen les!\n ╯°□°）╯┻━┻";
                                        }
                                        else{
                                            today += msg;
                                        }
                                        today += getEdits(dag, maand);
                                        today += '\n\n';
                                        console.log(msg, j);

                                    }

                                    inputMessage.channel.send(today);
                                    console.log('done');
                                    return true;
                                });
                            }


                        }
                    }
                    if(args.length > 2){
                        let command = args[0];
                        console.log(args);
                        if(command === 'add'){
                            console.log('adding');
                            let time = args[1].split('-');
                            if(time.length === 2){
                                let dag = parseInt(time[0]);
                                let maand = parseInt(time[1]);
                                let msg = args[2];
                                for (let i=3; i < args.length; i++){
                                    msg += ' ';
                                    msg += args[i];
                                }
                                console.log(dag, maand, msg);
                                if(!isNaN(dag) && !isNaN(maand)){
                                    writeEdit(dag, maand, msg);
                                    let fs = require('fs');
                                    let edits = fs.readFileSync('Edits.txt', 'utf-8');
                                    if(edits.includes(msg)){
                                        inputMessage.channel.send('Edit added successfully');
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }



                break;
            default:
                inputMessage.channel.send("Invalid command pls try again");

        }
    }
    let viezeGif = "giphy";
    if (message.includes(viezeGif)){
        message.delete().catch()
    }
    viezeGif = "tenor";
    if (message.includes(viezeGif)){
        message.delete().catch()
    }
    /*
    if (message === 'Waar zijn die handjes?'){
        inputMessage.channel.send(':raised_hands: :raised_hands: :raised_hands:');
        return true;
    }
    let lower = message.toLowerCase();
    if (lower === 'hello there'){
        const attachment = new Discord.Attachment('https://i.imgur.com/VDRXqTn.jpg');
        inputMessage.channel.send(attachment);
        return true;
    }

    if (lower === 'ship'){
        let number = Math.round(Math.random());
        if(number === 0){
            const attachment = new Discord.Attachment('https://zippy.gfycat.com/HeftyHilariousBudgie.webm');
            inputMessage.channel.send(attachment)
        }
        if (number === 1){
            const attachment = new Discord.Attachment('https://media.giphy.com/media/wmeqY7N3q304w/source.gif');
            inputMessage.channel.send(attachment)
        }
        return true;
    }

    if (lower === 'rick'){
        inputMessage.channel.send('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        return true;
    }
    */
}



bot.on('message', message => {
    execComand(message);
});

bot.on('messageUpdate', (oldmessage, message) => {

    if(execComand(message))
        message.channel.send('Send from a edited msg')
    //message.channel.send('you edited a message');
});

/*
let count = 0;
bot.on('messageReactionAdd', (messageReaction, user) => {
    messageReaction.remove(user).catch(console.error);
    count ++;
    if(count === 3){
        messageReaction.message.channel.send('Nice try...');
        count = 0;
    }
});
bot.on('messageReactionRemove', (messageReaction, user) => {
    messageReaction.message.channel.send('loop de loop ')

});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;


    if(oldUserChannel === undefined && newUserChannel !== undefined) {
        // User Joins a voice channel
        if(newUserChannel.joinable){
            console.log('enter');

            newUserChannel.join().then(connection => {
                connection.on("ready", () => {
                    console.log('authenticated');
                    connection.playArbitraryInput('https://cdn.glitch.com/018aa56f-e856-4798-ade7-38e7e339e320%2FObi-Wan%20-%20Hello%20there.mp3').on("end", () => {
                        newUserChannel.leave();
                        console.log('end')
                    });
                });
            }).catch(console.error);

            console.log('leave');
        }

    } else if(newUserChannel === undefined){
        // User leaves a voice channel


    }
});

*/