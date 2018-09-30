module.exports = {
    validateInputDate,
    schrikkeljaar
};

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

// valid date input day 1-31 month 0-11
function validateInputDate(day, month, year){
    if (year < 1){
        return false;
    }
    if(day < 1 || month < 0){
        return false;
    }
    switch (month){
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
            if (day > 31){
                return false;
            }
        case 1:
            if (schrikkeljaar(year)) {
                if (day > 30) return false;
            }
            else{
                if (day > 29) return false;
            }
        default:
            if (day > 30){
                return false;
            }
    }
    return true;
}

var testnr = 0;

function assertEqual(bool1, bool2){
    testnr += 1;
    if (bool1 === bool2){
        console.log("Test", testnr, "Passed");
        return true;
    }
    console.log("Test", testnr, "Failed Expected", bool2.toString(), "got", bool1.toString());
    return false
}

// tests

assertEqual(validateInputDate(0,0,0), false);
assertEqual(validateInputDate(1,9,2018), true);
assertEqual(validateInputDate(-1,-1000,"geen getal"), false);
assertEqual(validateInputDate(30,1,2016), true);
assertEqual(validateInputDate(30,1,2018), false);
assertEqual(validateInputDate(32,56,20), false);
