﻿//CDMSTimeCellValidator - extends CellValidator

// validates time cells. 


function CDMSTimeCellValidator(cdms_field) {
    this.base = CellValidator;
    //console.log("calling constructor?");
    this.base(cdms_field);
    //this.init(cdms_field);
};
CDMSTimeCellValidator.prototype = new CellValidator;

CDMSTimeCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

/*
    //george's time checking

    var value = data.value;

    var timeContentValid = true;

    if (!is_empty(value) && !stringIsTime(value))
        timeContentValid = false;
    else if (value.indexOf(".") > -1)
        timeContentValid = false;
    else if (value.indexOf(":") === -1)
        timeContentValid = false;

    if (!timeContentValid)
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a valid time (hh:mm)."));

*/

    if (data.value == null || data.value == "")
        return this.errors;

    var the_date = moment(data.value, ["HH:mm"],true);

    if (!the_date.isValid()) {
        the_date = moment(data.value); //is it a "full" date?
    }

    console.dir(the_date);
    console.log(the_date._i);
    if (!the_date.isValid()) {
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a time (hh:mm)."));
    }
    else // it IS a valid date value, make sure it isn't older than 1901!
    {
        var strTime = the_date._i;
        if (!stringIsTime(strTime))
            this.errors.push(new ValidationError(this.cdms_field, "Value is an invalid time format; please use hh:mm format."));
        else if(the_date.year() < 1901)
            this.errors.push(new ValidationError(this.cdms_field, "Year is before 1901 (set from Excel?); Please update Year."));
    }

    return this.errors;
};