﻿

//gridDatasheetOptions needs to be set to your datasheet grid
datasets_module.service('DataSheet', ['Logger', '$window', '$route',
    function (Logger, $window, $route, $q) {
        //var LocationCellTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';

        var LocationCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'locationId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in locationOptions"/>';

        var QACellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatusOptions"/>';

        var InstrumentCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'InstrumentId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in instrumentOptions"/>';

        var FishermanCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'FishermanId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in fishermenOptions"/>';  // GC

        var TimezoneCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'timezone\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in timezoneOptions"/>';

        var service = {

            initScope: function (scope) {

                //setup variable in the scope
                scope.CellOptions = {}; //dropdown list options
                scope.FieldLookup = {}; //convenience lookup dbcolname->fieldobj (populated by dataentry-controller.makecoldef)
                scope.onRow = undefined;
                scope.onField = undefined;
                scope.autoUpdateUndone = [];
                scope.deletedRows = [];
                scope.updatedRows = [];
                scope.autoUpdateFeatureDisabled = true;
                scope.headerFieldErrors = {};
                scope.dataChanged = false; //any changes to the grid yet?
                scope.gridWidth = { width: '2000' }; //will set below based on number of fields

                //scope wrapper functions
                scope.undoAutoUpdate = function () { service.undoAutoUpdate(scope) };
                scope.updateCell = function (row, field) { service.updateCell(row, field, scope) };
                //scope.updateHeaderField = function(field) { service.updateHeaderField(field, scope)};
                scope.updateHeaderField = function (row, field) { service.updateHeaderField(row, field, scope) };
                //scope.validateGrid = function() { service.validateGrid(scope)};
                scope.validateGrid = function () { service.validateGrid(scope) };
                scope.validate = function (row) { service.validate(scope, row) };
                scope.removeRow = function () { service.removeOnRow(scope) };
                scope.undoRemoveRow = function () { service.undoRemoveOnRow(scope) };
                scope.getFieldStats = function () { return service.getFieldStats(scope) };

                scope.onNumberField = function () {
                    if (!scope.onField)
                        return false;

                    return (scope.onField.ControlType == "number");
                };

                scope.recalculateGridWidth = function (length) {
                    console.log("recalculateGridWidth with length: " + length);

                    var minwidth = (980 < $window.innerWidth) ? $window.innerWidth - 50 : 980;
                    //console.log("minwidth: " + minwidth);

                    var width = 150 * length; //multiply number of columns by 100px
                    //console.log("or multiplied: " + width);

                    //if(width < minwidth) width=minwidth; //min-width
                    if (width < minwidth) width = minwidth; //min-width

                    //console.log("Decided: " + width);

                    scope.gridWidth = { width: width };
                    //refresh the grid
                    setTimeout(function () {
                        scope.gridDatasheetOptions.$gridServices.DomUtilityService.RebuildGrid(scope.gridDatasheetOptions.$gridScope, scope.gridDatasheetOptions.ngGrid); //refresh
                        console.log("Width now: " + width);
                    }, 400);
                };

                scope.selectCell = function (field) {
                    //console.log("select cell!");
                    scope.onField = scope.FieldLookup[field];
                };

                //dynamically set the width of the grids.
                /*
                var grid_width_watcher = scope.$watch('FieldLookup', function(){
                    var length = array_count(getMatchingByField(scope.FieldLookup,"2","FieldRoleId"));

                    console.log("Found number of detail fields: "+length);

                    //however -- if we are in full-grid mode, we need space calculated on adding in the header fields.
                    //  currently that is only for import, full datasheet and query.
                    if($route.current.controller == 'DatasetImportCtrl' || $route.current.controller == 'DataQueryCtrl' || $route.current.controller == 'DataEntryDatasheetCtrl')
                        length = array_count(scope.FieldLookup);

                    console.log("calling with length: "+ length);

                    scope.recalculateGridWidth(length);
                    grid_width_watcher(); //remove watcher.

                },true);
                */

                //only do this for pages that have editing enabled
                if (scope.gridDatasheetOptions.enableCellEdit) {
                    //setup editing rowtemplate
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="{\'has-validation-error\': !row.getProperty(\'isValid\')}" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
                }
                else {
                    //for viewing
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

                }

                //this is pure awesomeness: setup a watcher so that when we navigate the grid we update our current row and validate it.
                scope.$watch('gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow', function () {
                    //console.dir(scope.gridDatasheetOptions.$gridScope);
                    scope.onRow = scope.gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow;
                    //console.dir(scope.gridDatasheetOptions.$gridScope.selectionProvider);
                });

            },

            getColDefs: function (DatastoreTablePrefix, theMode) {
                console.log("Inside services, getColDefs...");
                console.log("theMode = " + theMode);
                console.log("DatastoreTablePrefix = " + DatastoreTablePrefix);

                if (DatastoreTablePrefix === "WaterTemp")   // Water Temp related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: false,
                                Field: { Description: "Instrument the detected this value." }
                            },
                        ];
                        console.log("Water Temp-related form...");
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter', //'locationNameFilter','',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: true,
                                Field: { Description: "Instrument the detected this value." }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }

                            },
                            {
                                field: 'Timezone',
                                Label: 'Reading Timezone',
                                displayName: 'Reading Timezone',
                                editableCellTemplate: TimezoneCellEditTemplate,
                                cellFilter: 'timezoneFilter',
                                Field: { Description: "The timezone the reading took place in." }
                            }
                        ];
                    }
                }
                else if (DatastoreTablePrefix === "WaterQuality")  // Water Quality related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: false,
                                Field: { Description: "Instrument the detected this value." }
                            },
                        ];
                        console.log("Water Quality-related form...");
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter', //'locationNameFilter','',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: true,
                                Field: { Description: "Instrument the detected this value." }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }

                            }
                        ];
                    }
                }
                //else if (theDatasetId == 1206) // This changes the order of the fields, to what makes for sense for the users of this dataset.
                else if (DatastoreTablePrefix === "CreelSurvey") // Creel Survey related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'FishermanId',
                                Label: 'Fisherman',
                                displayName: 'Fisherman',
                                cellFilter: 'fishermanFilter',
                                editableCellTemplate: FishermanCellEditTemplate,
                                //visible:  false,
                                Field: { Description: "Fisherman that was interviewed." }
                            }
                        ];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
							/*{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}

							},*/
                            {
                                field: 'FishermanId',
                                Label: 'Fisherman',
                                displayName: 'Fisherman',
                                cellFilter: 'fishermanFilter',
                                editableCellTemplate: FishermanCellEditTemplate,
                                //visible:  false,
                                Field: { Description: "Fisherman that was interviewed." }
                            }
                        ];
                    }
                }
                else if ((DatastoreTablePrefix === "SpawningGroundSurvey") || //Spawning Ground related
                    (DatastoreTablePrefix === "SnorkelFish") || //Snorkel Fish related
                    (DatastoreTablePrefix === "FishTransport") || //Fish Transport related
                    (DatastoreTablePrefix === "Electrofishing") || //Electrofishing related
                    (DatastoreTablePrefix === "ScrewTrap") || //Screw Trap related
                    (DatastoreTablePrefix === "ArtificialProduction") || //ArtificialProduction related
                    (DatastoreTablePrefix === "BSample") || //BSample related
                    (DatastoreTablePrefix === "JvRearing") || //JvRearing related
                    (DatastoreTablePrefix === "Genetic") || //Genetic related
                    (DatastoreTablePrefix === "Benthic") || //Benthic related
                    (DatastoreTablePrefix === "Drift") || //Drift related
                    (DatastoreTablePrefix === "AdultWeir") //Adult Weir related
                ) {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }
                            }
                        ];
                    }
                }
                else if ((DatastoreTablePrefix === "StreamNet_RperS") ||
                    (DatastoreTablePrefix === "StreamNet_NOSA") ||
                    (DatastoreTablePrefix === "StreamNet_SAR")
                ) {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }
                            }
                        ];
                    }
                }
                else if (DatastoreTablePrefix === "FishScales") //Fish Scales related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status" }
                        }];
                    }
                }

                else if (DatastoreTablePrefix === "Metrics") {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status" }
                        }];
                    }
                }

                else if (DatastoreTablePrefix === "Appraisal") // Appraisal-related (Tax Parcels)
                {
                    console.log("Configuring for Appraisal...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [];
                    }
                }

                else if (DatastoreTablePrefix === "CrppContracts") // CRPP Contracts-related
                {
                    console.log("Configuring for CrppContracts...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [];
                    }
                }

                else {
                    var coldefs = [
                        {
                            field: 'locationId',
                            Label: 'Location',
                            displayName: 'Location',
                            cellFilter: 'locationNameFilter',
                            editableCellTemplate: LocationCellEditTemplate,
                            Field: { Description: "What location is this record related to?" }
                        },
                        {
                            field: 'activityDate',
                            Label: 'Activity Date',
                            displayName: 'Activity Date (MM/DD/YYYY)',
                            cellFilter: 'date: \'MM/dd/yyyy\'',
                            editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                            Field: { Description: "Date of activity in format: '10/22/2014'" }
                        },
                        {
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status" }
                        }
                    ];
                }

                return coldefs;
            },

            //in order to call validate, you'll need to have your FieldLookup and CellOptions set
            //  on the controller (and obviously previously populated by the DataSheet service.)
            validate: function (row, scope) {
                if (row) {
                    //console.log("Inside validate...");
                    //console.log("scope.callingPage = " + scope.callingPage);
                    ////console.log("scope is next...");
                    ////console.dir(scope);
                    //console.log("row is next...");
                    //console.dir(row);

                    //spin through our fields and validate our value according to validation rules
                    var row_errors = [];

                    //console.log("Validating a row with " + array_count(scope.FieldLookup) + " rows.");

                    // We use row_num to give us a reference for what line of data we are on, in the debugger.
                    //var row_num = 0;

                    angular.forEach(scope.FieldLookup, function (field, key) {
                        //TODO: first check if there is no value but one is required.

                        //if not value, ditch.
                        if (!row[key])
                            return;


                        validateField(field, row, key, scope, row_errors);
                        //row_num++;
                        //console.log("  >>incrementing!");

                    });

                    if (scope.DatastoreTablePrefix === "CreelSurvey") {
                        // Do we have a valid location?
                        if ((typeof row.LocationId !== 'undefined') && (row.LocationId !== null)) {
                            row_errors.push("[LocationId] The Location does not match anything in the Locations table for this dataset.");
                        }


                        if ((typeof row.InterviewTime === 'undefined') && (typeof row.FishermanId === 'undefined')) // No interviewTime && No FishermandId
                        {
                            // Do nothing, because we probably do not have a detail; no error.
                            console.log("No detail...");
                        }
                        else if (((typeof row.InterviewTime !== 'undefined') && (row.InterviewTime !== null)) && ((typeof row.FishermanId === 'undefined') || (row.FishermanId === null))) {
                            // We have an interview, so we must have a fisherman also; error
                            row_errors.push("[Fisherman] InterviewTime is present, but the Fisherman is missing.");
                        }
                        else // We have row.InterviewTime && row.FishermanId
                        {
                            // Verify that the fisherman is in the Fishermen table.
                            var foundName = false;
                            angular.forEach(scope.fishermenList, function (aFisherman) {
                                //console.log("aFisherman.Fullname = " + aFisherman.Fullname + ", row.Fullname =" + row.Fullname);
                                if ((typeof row.FishermanId !== 'undefined') && (aFisherman.Id === row.FishermanId)) {
                                    //console.log("Matched the fisherman to a name in the Fishermen table.");
                                    foundName = true;
                                }

                            });

                            //console.log("typeof row.FishermanId = " + typeof row.FishermanId + ", row.FishermanId = " + row.FishermanId + ", foundName = " + foundName);
                            //if ((row.FishermanId !== null) && (!foundName))
                            //	row_errors.push("Fisherman name does not match any name in the Fishermen table."); // This turns the row color to red.
                        }
                    }

                    //console.log(row_num + " --------------- is our rownum");
                    //console.log("row_errors is next...");
                    //console.dir(row_errors);
					
					/*	Notes are in order here.
					*	All three items below (row.isValid, row.errors, and scope.gridHasErrors) are necessary to turn the row color red.
					*	If all three itesms ARE NOT preset, the error will be flagged, but the color WILL NOT turn red.
					*/
                    if (row_errors.length > 0) {
                        row.isValid = false;
                        //row.errors = row_errors;
						
						// validateGrid(scope) calls validate
						// validate does angular.forEach on $scope.dataSheetDataset, passing the data_row to here, coming in as row.
                        row.errors = angular.copy(row_errors);
                        //scope.row.errors = angular.copy(row_errors);
                        scope.gridHasErrors = true;
                    }
                    else {
                        row.isValid = true;
                        row.errors = undefined;
                    }

                }
            },

            //updateHeaderField: function(field_name, scope)
            updateHeaderField: function (row, field_name, scope) {
                scope.dataChanged = true;

                //var value = scope.row[field_name];
                if (typeof field_name === 'undefined') {
                    // We are probably checking a header field on the form.
                    field_name = row;
                    console.log("field_name updated = " + field_name);
                    var value = scope.row[row];
                }
                else {
                    var value = scope.row[field_name];
                }
                console.log("value = " + value);

                var field = scope.FieldLookup[field_name];
                var errors = [];
                var row = scope.row;
                var headers = []; //there are none; our row is the headers.

                validateField(field, scope.row, field_name, scope, errors);

                if (errors.length > 0) {
                    scope.headerFieldErrors[field_name] = errors;
                    row.isValid = false;
                    //if (typeof scope.onRow !== 'undefined')
                    //{
                    scope.onRow.errors = errors;
                    scope.gridHasErrors = true;
                    //}
                }
                else {
                    delete scope.headerFieldErrors[field_name];
                    row.isValid = true;
                    //row.errors = undefined;
                    if (typeof scope.onRow !== 'undefined')
                        scope.onRow.errors = undefined;
                }


                //fire rules - OnChange

                fireRules("OnChange", row, field, value, headers, errors, scope);

                scope.headerHasErrors = (array_count(scope.headerFieldErrors) > 0);

            },

            undoAutoUpdate: function (scope) {
                for (var i = 0; i < scope.autoUpdate.updated.length; i++) {

                    //TODO -- eww don't do it this way! don't need rendered rows
                    var entityFieldValue = scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field];

                    //console.log("Unsetting "+scope.autoUpdate.field+": " + entityFieldValue + " back to " + scope.autoUpdate.from);

                    scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field] = scope.autoUpdate.from;
                }

                //set the originally changed one to still be TO
                scope.gridDatasheetOptions.$gridScope.renderedRows[scope.autoUpdate.origRowIndex].entity[scope.autoUpdate.field] = scope.autoUpdate.to;

                scope.autoUpdateUndone.push(scope.autoUpdate.field); // mark this so we don't do it again.
                scope.autoUpdate = undefined;

                service.validateGrid(scope);

            },

            //fired whenever a cell value changes.
            //updateCell: function (row, field_name, scope) {
            updateCell: function (row, field_name, scope, rootScope) {
				console.log("Inside datasheet.js, updateCell...");
				console.log("row is next...");
				console.dir(row);
                //console.log("Field changed: " + field_name);
				console.log("scope is next...");
				console.dir(scope);

                scope.dataChanged = true;

                if (scope.onRow.entity) {
                    var fromValue = scope.onRow.entity[field_name];
                    var toValue = row.entity[field_name];

                    //console.log("Changed " + field + " from: " + fromValue + " to: " + toValue);
                    console.log("Changed " + field_name + " from: " + fromValue + " to: " + toValue);
					
					//scope.removeRowErrorsBeforeRecheck();
                }
                //console.log("has an id? " + row.entity.Id);

                //make note of this update so we can save it later. (relevant only for editing)
                if (row.entity.Id) {

                    if (scope.updatedRows.indexOf(row.entity.Id) == -1) {
                        //console.log("added an update: " + row.entity.Id);
                        scope.updatedRows.push(row.entity.Id);
                    }
                    //else
                    //    console.log("Not updating a record.");
                }
                //else
                //console.log("not row.entity.id");


                //set value of multiselect back to an array


                //row.entity[field] = angular.toJson(toValue).toString();


                /*

                // bail out if it would be a duplicate update
                if(fromValue == toValue)
                {
                    scope.validateGrid(scope);
                    return;
                }

                //bail out if they've already undone this cascade once before
                if(scope.autoUpdateUndone.indexOf(field) > -1 || scope.autoUpdateFeatureDisabled)
                {
                    scope.validateGrid(scope); // before we bail out.
                    return;
                }
                */

                /*
                //go ahead and change all the others (this will expose an option to undo if they want)
                scope.autoUpdate = {
                    field: field,
                    from: fromValue,
                    to: toValue,
                    origRowIndex: row.rowIndex,
                    updated: [],
                };

                angular.forEach(scope.gridDatasheetOptions.$gridScope.renderedRows, function(data_row, key){
                    //if the value of this row is the same as what they just changed FROM
                    //  AND if the rowindex is higher than the current rowindex (cascade down only)
                    if(data_row.entity[field] == fromValue && key > row.rowIndex )
                    {
                        data_row.entity[field] = toValue;
                        scope.autoUpdate.updated.push(key);
                        //console.log("Autoupdated: " + key);
                    }
                });
                */

                var value = row.entity[field_name];
                var field = scope.FieldLookup[field_name];

                //console.dir(scope.FieldLookup);
                //console.log("field name = " + field_name);

                row = row.entity; //get the right reference for our rules

                //fire OnChange rule

                // -------------------------------------------
                //I like to write my test rules here and move into rule and delete when i'm done  ---------------------------
                //eg:
                /*
                
                                if(field_name == "Disposition")
                                {
                                    console.log("Disposition value: " + value);
                                    var testRule =
                                    {
                                        "OnChange":
                                        ""
                                    };
                
                                    field.Field.Rule = angular.fromJson(testRule);
                
                                }
                */
                // ------------------------------------------
                var headers = scope.row;
                console.log("headers is next...");
                console.dir(headers);

                if (typeof scope.onRow.entity.errors === 'undefined')
                    scope.onRow.entity.errors = [];

                if ((typeof field !== 'undefined') && (field.FieldRoleId !== null) && (field.FieldRoleId == 1)) {
                    scope.onRow.errors = [];
                    fireRules("OnValidate", row, field, value, headers, scope.onRow.errors, scope);
                }
                else {
                    fireRules("OnValidate", row, field, value, headers, scope.onRow.entity.errors, scope);
                }

                if (field && value) {
                    fireRules("OnChange", row, field, value, headers, [], scope);
                }

                //this is expensive in that it runs every time a value is changed in the grid.
                scope.validateGrid(scope); //so that number of errors gets calculated properly.
				
				if ((field_name === "ReadingDateTime") || (field_name === "activityDate"))
				{
					console.log("Found " + field_name);
					if ((typeof scope.activities !== 'undefined') && (scope.activities !== null))
						scope.activities.errors = undefined;
					
					//scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;
					
					//scope.removeRowErrorsBeforeRecheck();
					scope.rebuildDateTimeList();
					scope.checkForDuplicates();
				}
            },


            undoRemoveOnRow: function (scope) {
                var entity = scope.deletedRows.pop();
                scope.dataSheetDataset.push(entity);
                scope.validateGrid(scope);
            },


            removeOnRow: function (scope) {
                scope.dataChanged = true;
                scope.deletedRows.push(scope.onRow.entity);
                var index = scope.dataSheetDataset.indexOf(scope.onRow.entity);
                scope.dataSheetDataset.splice(index, 1);
                scope.onRow = undefined;
                scope.validateGrid(scope);
            },



            //spin through all of the rows and re-validate.
            validateGrid: function (scope) {
                console.log("Inside validateGrid...");
                console.log("scope.callingPage = " + scope.callingPage);
                //console.dir(scope);

                if (!scope.gridDatasheetOptions.enableCellEdit)
                    return;

                console.log(">>>>>>> validating the whole grid baby");
				console.log("Resetting scope.validation_error_count...");
                scope.validation_error_count = 0;

                angular.forEach(scope.dataSheetDataset, function (data_row, key) {
                    service.validate(data_row, scope);
                    if (!data_row.isValid)
                        scope.validation_error_count++;
                });

                scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;

            },

            getFieldStats: function (scope) {

                if (!scope.onField || scope.onField.ControlType != "number")
                    return "";

                //first get the mean (average)
                var total = 0;
                var num_recs = 0;
                var max = undefined;
                var min = undefined;

                //calculate total (for mean), max, min
                angular.forEach(scope.dataSheetDataset, function (item, key) {

                    try {
                        var num = new Number(item[scope.onField.DbColumnName]);

                        if (!isNaN(num)) //just skip if it is not a number (NaN)
                        {
                            total += num;

                            if (typeof min == "undefined")
                                min = num;

                            if (typeof max == "undefined")
                                max = num;

                            if (num > max)
                                max = num;

                            if (num < min)
                                min = num;

                            num_recs++;
                        }
                    }
                    catch (e) {
                        //ran across something that wasn't a number (usurally a blank...)
                        console.log("couldn't convert this to a number: " + item[scope.onField.DbColumnName] + " on " + scope.onField.DbColumnName);
                    }

                });

                var mean = total / num_recs;

                var std_total = 0;

                //now do standard deviation
                angular.forEach(scope.dataSheetDataset, function (item, key) {
                    if (!isNaN(item[scope.onField.DbColumnName]))
                        std_total += Math.pow((item[scope.onField.DbColumnName] - mean), 2); //difference of each item, squared
                });

                var std_dev = Math.sqrt(std_total / (num_recs - 1));//square root of sum of squared differences

                var stats = "Mean: " + mean.toFixed(2);
                stats += " / Max: " + max;
                stats += " / Min: " + min;
                stats += " / Std Dev: " + std_dev.toFixed(2);
                stats += " / Total: " + total;

                return stats;
            },

        } //end service

        return service;

    }]);