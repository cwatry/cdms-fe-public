﻿//CDMSDateTimeCellValidator - extends CellValidator

// validates datetime cells. 


function CDMSDateTimeCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSDateTimeCellValidator.prototype = new CellValidator;

CDMSDateTimeCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    console.log("-- date validation --");
    console.dir(data);

    if (data.value == null || data.value == "")
        return;

    var the_date = moment(data.value);

    if (!the_date.isValid()) {
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a date-time (mm/dd/yyyy hh:mm)."));
    }
    else // it IS a valid date value, make sure it isn't older than 1901!
    {
        if(theDate.getFullYear() < 1901)
            this.errors.push(new ValidationError(this.cdms_field, "Year is before 1901 (set from Excel?); Please update Year."));
    }

    return this.errors;
};