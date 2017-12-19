﻿//ControlType Definitions are defined below.
// Each type of control that can be on a datasheet needs to have a basic
// definition that will be used to configure a column of that type.
// Note: Custom cell renderers are defined in ag-grid-custom-components.js

//multiselect list - displays as multiple selection dropdown list
var MultiselectControlType = function (cdms_field, col_def) {
    
    col_def.cellEditor = CDMSMultiselectCellEditor;
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues)
    };

    return col_def;

};

//select list - displays as drop down select
var SelectControlType = function (cdms_field, col_def) {
    //    console.log('we are a select');

    col_def.cellEditor = CDMSSelectCellEditor; //or: agRichSelectCellEditor OR better I think we make our own...
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues),
    };

    return col_def;
};

//currency - displays as USD currency, saves as number
var CurrencyControlType = function (cdms_field, col_def) {
    col_def.valueFormatter = function (params) {
        return filterToCurrency(params.value);
    };
    col_def.valueParser = function (params) {
        return parseToFloat(params.newValue);
    };
    return col_def;
};

//date - displays as MM/DD/YYYY date without time, saves datetime
//TIMEZONE note - we save it as a date without any timezone. 
var DateControlType = function (cdms_field, col_def) {
    col_def.cellEditor = 'agTextCellEditor';
    col_def.cellEditorParams = {
        useFormatter: true, 
    };
    col_def.valueFormatter = function (params) {
        if (params.value !== undefined && params.value !== null)
            return moment(params.value).format("YYYY-MM-DD");
    };
    col_def.valueParser = function (params) {
        return moment(params.newValue).format("YYYY-MM-DDTHH:mm:ss")  // 2017-12-19T14:03:10 (no timezone)
    };
    return col_def;};

//datetime - displays as MM/DD/YYYY HH:mm:ss, saves as datetime
//TIMEZONE note - we save it as a date without any timezone. 
var DateTimeControlType = function (cdms_field, col_def) {
    col_def.cellEditor = 'agTextCellEditor';
    col_def.cellEditorParams = {
        useFormatter: true,
    };
    col_def.valueFormatter = function (params) {
        if (params.value !== undefined && params.value !== null)
            return moment(params.value).format("YYYY-MM-DD HH:mm:ss"); 
    };
    col_def.valueParser = function (params) {
        return moment(params.newValue).format("YYYY-MM-DDTHH:mm:ss")  // 2017-12-19T14:03:10 (no timezone)
    };
    return col_def;
};


var EastingControlType = function (cdms_field, col_def) {
    return col_def;
};

var FileControlType = function (cdms_field, col_def) {
    return col_def;
};

var LinkControlType = function (cdms_field, col_def) {
    return col_def;
};

var NorthingControlType = function (cdms_field, col_def) {
    return col_def;
};

var NumberControlType = function (cdms_field, col_def) {
    return col_def;
};

var StringControlType = function (cdms_field, col_def) {
    return col_def;
};

var TempWaypointFileControlType = function (cdms_field, col_def) {
    return col_def;
};

var TextControlType = function (cdms_field, col_def) {
    return col_def;
};

var TextAreaControlType = function (cdms_field, col_def) {
    return col_def;
};

var TimeControlType = function (cdms_field, col_def) {
    return col_def;
};

var UploadControlType = function (cdms_field, col_def) {
    return col_def;
};

var ControlTypeDefinitions = {
    'multiselect': MultiselectControlType,
    'currency': CurrencyControlType,
    'date': DateControlType,
    'datetime': DateTimeControlType,
    'easting': EastingControlType,
    'file': FileControlType,
    'link': LinkControlType,
    'northing': NorthingControlType,
    'number': NumberControlType,
    'select': SelectControlType,
    'string': StringControlType,
    'temp-waypoint-file': TempWaypointFileControlType,
    'text': TextControlType,
    'textarea': TextAreaControlType,
    'time': TimeControlType,
    'upload': UploadControlType,
};