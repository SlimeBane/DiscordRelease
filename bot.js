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
const d = new Date();
const fs = require('fs');


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

// Returns index of weekday in the same order as Date.getDay()
function getWeekDay(string ){
    //console.log(string)
    for (let i=0; i<fdays.length; i++){
        if(fdays[i] === string){
            //console.log(i)
            return i;
        }
    }
    return -1;
}

// Returns Monday of this week
function getMaandag(){
    let weekdag = d.getDay();
    weekdag--;
    if(weekdag === -1){
        weekdag += 7
    }
    return d.getDate() - weekdag;
    
}

// Returns Monday of the week in day, month
function getMaandagFromAny(day, month){
    console.log(day, month);
    let customDate = new Date(d.getFullYear(), month-1, day);
    console.log(customDate);
    let weekdag = customDate.getDay();
    weekdag--;
    if(weekdag === -1){
        weekdag += 7;
    }
    console.log(weekdag, day);
    return day - weekdag;
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

// Returns index of months array from the full english name
function getMonthFromString(month){
    let partMonth = month.substring(0,3);
    for(let i=0; i<months.length; i++){
        if(months[i] === partMonth){
            return i;
        }
    }
    return -1;
}

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
        if(lines[i].substring(0,5) !== date ){
            newdata += lines[i] + '\r\n';
        }
        else{
            console.log("removed", lines[i]);
            removed += lines[i] + '\n'
        }
    }

    console.log(newdata);
    fs.writeFileSync('Edits.txt', newdata);

    return removed;

}

// Clear the Edits.txt file
function clearEdits(){

}

// returns true if the startDate (of an event) is later than the currentDate
function startDateisBigger(startDate, currentDate){
    if(startDate.getFullYear() > currentDate.getFullYear()){
        return true;
    }
    if(startDate.getFullYear() === currentDate.getFullYear() && startDate.getMonth() > currentDate.getMonth()){
        return true;
    }
    if(startDate.getFullYear() === currentDate.getFullYear() && startDate.getMonth() === currentDate.getMonth() && startDate.getDate() > currentDate.getDate()){
        return true;
    }
}

// Gets all the lessons from the calendar and returns a string
function getMessage(day, month, data){

    console.log('Enter get msg function with day ', day, ' and month ', month)
    let arr = [];
    let txt = '```css\n';
    let i = 0;
    let currentDate = new Date(d.getFullYear(), month, day);
    if (currentDate < d){
        currentDate.setFullYear(d.getFullYear()+1)
    }
    // Go over every event.
    for (let k in data){
        if (data.hasOwnProperty(k)) {
            // console.log('in data')
            let ev = data[k];
            // Make sure it has a start date 
            if(ev.start == null){
            }
            else{
                // if the startDate occurs after our date, ignore it
                if(startDateisBigger(ev.start, currentDate)){
                    //console.log(ev.summary, 'started late at ', ev.start.getDate(), ev.start.getMonth())
                    continue;
                }
                let line = '';
                // if it has a reccurance rule, find untill when it last and that the day of the week corresponds with this day
                if(ev.rrule != undefined){
                    let rrule = ev.rrule.toText();
                    let parsed = rrule.split('until'); 
                    let rrulemonth = getMonthFromString(parsed[1].split(' ')[1]);
                    let rruleday = parseInt(parsed[1].split(' ')[2].split(',')[0]);
                    let rruleyear = parseInt(parsed[1].split(' ')[3]);
                    //console.log(rruleyear ,rrulemonth, rruleday.substring(0, rruleday.length-1))  
                    //console.log(parsed)

                    if(day === 20){
                        console.log(rruleyear, rrulemonth, rruleday, d.getFullYear(), month, day)
                    }

                    let customDate = new Date(d.getFullYear(), month, day);
                    let weekdaystring = parsed[0].split(' ')[3];
                    if(customDate.getDay() === getWeekDay(weekdaystring)){
                        //console.log('weekdays are equal')
                        // make sure the repeat end occurs after currentDate
                        if(rruleyear > d.getFullYear()){
                            console.log('yaaay');
                            console.log("Conference",
                            ev.summary,
                            'is in',
                            ev.location);

                            line += ev.summary;
                            line += " at ";
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';
                            
                            arr[i] = line;
                            i++;
                            console.log("year based")
                        }
                        
                        else if(rrulemonth > month && rruleyear === d.getFullYear()){
                            console.log('yaaay');
                            console.log("Conference",
                            ev.summary,
                            'is in',
                            ev.location);

                            line += ev.summary;
                            line += " at ";
                            // var temp = ev.start
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';
                            
                            arr[i] = line;
                            i++;
                            console.log('month based')
                        }
                        else if(rruleday > day && rrulemonth === month && rruleyear === d.getFullYear()){
                            console.log('yaaay');
                            console.log("Conference",
                            ev.summary,
                            'is in',
                            ev.location);

                            line += ev.summary;
                            line += " at ";
                            // var temp = ev.start
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';
                            
                            arr[i] = line;
                            i++;
                            console.log(rruleday, day);
                            console.log('Day based')
                        }
                        
                    }
                }
                
                // if the event starts at currentDate, add to lessons
                if(ev.start.getDate() === day && ev.start.getMonth() === month){
                    console.log('yaaay');
                    console.log("Conference",
                    ev.summary,
                    'is in',
                    ev.location,
                    'with rec ID',
                    ev.dtstamp);

                    line += ev.summary;
                    line += " at ";
                    // var temp = ev.start
                    let tim = ev.start.toString().substring(16, 21);
                    line += ':' + tim;
                    line += '\n';

                    

                    arr[i] = line;
                    i++;
                }
            }
        }       
    }
    
    let sortedarr = [];
    console.log(arr);
    for (let l = 0; l < arr.length; l++){
        let time = arr[l].substring(arr[l].length - 6, arr[l].length - 1).split(':');
        console.log(time);
        let hour = parseInt(time[0]);
        let minute = parseInt(time[1]);

        if(sortedarr.length === 0){
            sortedarr[0] = arr[l];
        }
        let added = false;
        for (i=0; i < sortedarr.length; i++){
            let elem = sortedarr[i];
            let elemTime = elem.substring(elem.length - 6, elem.length - 1).split(':');
            let elemHour = parseInt(elemTime[0]);
            let elemMinute = parseInt(elemTime[1]);

            console.log(hour, elemHour);
            if(hour === elemHour && minute === elemMinute){
                added = true;
                break;
            }
            if(hour < elemHour){
                sortedarr.splice(i, 0, arr[l]);
                added = true;
                console.log('addde', arr[l]);
                break;
            }
        }
        if(!added && l !== 0){
            sortedarr.push(arr[l]);
            //console.log(arr[l]);
        }
        
    }
    
    for (let i = 0; i < sortedarr.length; i++){
        txt += sortedarr[i]
    }
    txt += '```';
    console.log(sortedarr);
    console.log(txt);
    return txt;
}

function execComand(inputMessage){
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    let message = inputMessage.content;
    console.log(message);
    //console.log(inputMessage.channel)
    if(inputMessage.isMentioned(bot.user)){
        if(message.split(' ')[1].toLowerCase() === 'help'){
            inputMessage.channel.send('Command List:');
            inputMessage.channel.send('!les (optional: [Date])\n!les week (optional: [Date])\n!les morgen\n!les add [Date] [Message]\n!les [\'rm\' || \'remove\' || \'del\' || \'delete\'] [Date]')
            inputMessage.channel.send('!deadline add [Time + Date] [Vak] [Message]\n!deadline ls \n!deadline [\'rm\' || \'remove\' || \'del\' || \'delete\'] [Time + Date]\n!deadline vak');
            inputMessage.channel.send('Date is always in this format: day-month.\nTime + Date is always in this format: minute-hour-day-month[optional: -year]. ')
            return true;
        }
        else{
            inputMessage.channel.send('Hi how can I help you?\nFor help mention me and type \'help\'.')
            return true;
        }
    }
    if (message.substring(0, 1) === '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                inputMessage.channel.send('Pong!');
                break;
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

                break;
            case 'les':
                console.log(args.length);
                if(args.length === 0){
                    ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
                        console.log('No extra Arguments');
                        let today = 'Vandaag:\n';
                        let msg = getMessage(d.getDate(), d.getMonth(), data).toString();
                        if(msg === '```css\n```'){
                            today += "Geen les!\n ╯°□°）╯┻━┻"
                        }
                        else{
                            today += msg;
                        }
                        inputMessage.channel.send(today)
                        return true;
                    });
                }

                else{
                    if(args.length === 1){
                        var extra = args[0].split('-');
                        console.log(extra);
                        if(extra.length === 2){
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                let dag = extra[0];
                                let maand = extra[1];
                                let today = 'Les op ';
                                today += dag;
                                today += "-";
                                today += maand;
                                today += ":\n";
                                console.log(dag,maand-1);
                                let msg = getMessage(dag, maand-1, data).toString();
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
                            console.log('done')
                            return true;
                        }
                        if(extra[0] === 'morgen'){
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                let dag = d.getDate()+1;
                                let maand = d.getMonth()+1;
                                let today = 'Les morgen (';
                                today += dag;
                                today += "-";
                                today += maand;
                                today += "):\n";
                                let msg = getMessage(dag, maand-1, data).toString();
                                if(msg === '```css\n```'){
                                    today += "Geen les!\n ╯°□°）╯┻━┻"
                                }
                                else{
                                    today += msg;
                                }
                                today += getEdits(dag, maand);

                                console.log(msg);

                                inputMessage.channel.send(today);
                                console.log('done')
                                return true;
                            });
                        }
                        if(extra[0] === 'week'){
                            let maandag = getMaandag();
                            console.log('in extra === week')
                            ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
                                let today = 'Lesweek: (';
                                today += getMaandag();
                                today += "-";
                                today += d.getMonth()+1;
                                today += ' tot ';
                                today += getMaandag()+6;
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
                                    today += ': (' + dag + '-' + maand + ')\n';

                                    let msg = getMessage(dag, maand-1, data).toString();
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
                                console.log(time, day, month);
                                let maandag = getMaandagFromAny(day, month);


                                console.log('maandag', maandag);
                                ical.fromURL(calendar.urls[0].url, {}, function(err, data) {

                                    let today = 'Lesweek: (';
                                    today += maandag;
                                    today += "-";
                                    today += month;
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
                                        today += ': (' + dag + '-' + maand + ')\n';

                                        console.log(dag,maand-1);
                                        let msg = getMessage(dag, maand-1, data).toString();
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

        }
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