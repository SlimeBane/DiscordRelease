
const calendar = require('./calendar.json');
const ical = require('ical');


module.exports = {
    getMessage,
    getMaandag
};


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fdays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
d = new Date();

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

function getMonthFromString(month){
    let partMonth = month.substring(0,3);
    for(let i=0; i<months.length; i++){
        if(months[i] === partMonth){
            return i;
        }
    }
    return -1;
}

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



// Gets all the lessons from the calendar and returns a string
function getMessage(date, data){

    console.log('Enter get msg function with day ', date.getDate(), ' and month ', date.getMonth()+1);
    if(date.getDate() > 31 || date.getMonth() > 11 || date.getMonth() < 0 || date.getDate() < 1){
        var nils = "Nils geeft een slecht voorbeeld";
        return nils
    }

    let arr = [];
    let txt = '```css\n';
    let i = 0;
    let currentDate = date;
    if (currentDate < d){
        currentDate.setFullYear(d.getFullYear()+1)
    }
    // Vind de vakken die op die dag voorkomen
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

                    let weekdaystring = parsed[0].split(' ')[3];
                    if(currentDate.getDay() === getWeekDay(weekdaystring)){
                        //console.log('weekdays are equal')
                        // make sure the repeat end occurs after currentDate
                        if(rruleyear > currentDate.getFullYear()){
                            console.log("Conference",
                                ev.summary,
                                'is in',
                                ev.location);

                            line += ev.summary;
                            line += " in " + ev.location;
                            line += " at ";
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';

                            arr[i] = line;
                            i++;
                            console.log("year based")
                        }

                        else if(rrulemonth > currentDate.getMonth() && rruleyear === currentDate.getFullYear()){
                            console.log("Conference",
                                ev.summary,
                                'is in',
                                ev.location);

                            line += ev.summary;
                            line += " in " + ev.location;
                            line += " at ";
                            // var temp = ev.start
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';

                            arr[i] = line;
                            i++;
                            console.log('month based')
                        }
                        else if(rruleday > currentDate.getDate() && rrulemonth === currentDate.getMonth() && rruleyear === currentDate.getFullYear()){
                            console.log("Conference",
                                ev.summary,
                                'is in',
                                ev.location);

                            line += ev.summary;
                            line += " in " + ev.location;
                            line += " at ";
                            // var temp = ev.start
                            let tim = ev.start.toString().substring(16, 21);
                            line += ':' + tim;
                            line += '\n';

                            arr[i] = line;
                            i++;
                            // console.log(rruleday, currentDate.getDate());
                            console.log('Day based')
                        }

                    }
                }

                // if the event starts at currentDate, add to lessons
                if(ev.start.getDate() === currentDate.getDate() && ev.start.getMonth() === currentDate.getMonth()){
                    console.log('yaaay');
                    console.log("Conference",
                        ev.summary,
                        'is in',
                        ev.location,
                        'with rec ID',
                        ev.dtstamp);

                    line += ev.summary;
                    line += " in " + ev.location;
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

    // sorteer de vakken in chronologische volgorde

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

            // console.log(hour, elemHour);
            if(hour === elemHour && minute === elemMinute){
                added = true;
                break;
            }
            if(hour < elemHour){
                sortedarr.splice(i, 0, arr[l]);
                added = true;
                console.log('added', arr[l]);
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
    // console.log(txt);
    return txt;
}

// Message tests

ical.fromURL(calendar.urls[0].url, {}, function(err, data) {
    let date = new Date();
    date.setDate(date.getDate()+2);
    console.log(getMessage(date, data));
});
