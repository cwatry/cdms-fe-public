//CDMS - Centralized Data Management System - Configuration File
//Written by Ken Burcham of CTUIR
//Instructions on getting started can be found here: https://github.com/ctuir/cdms/wiki

/*

This system is (C) 2014 by the Confederated Tribes of the Umatilla Indian Reservation.
Any use is subject to our license agreement included with this code.
A copy is currently located here: https://github.com/ctuir/cdms/blob/master/LICENSE

THE CDMS AND COVERED CODE IS PROVIDED UNDER THIS LICENSE ON AN "AS IS" BASIS,
WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, WITHOUT LIMITATION,
WARRANTIES THAT THE COVERED CODE IS FREE OF DEFECTS, MERCHANTABLE, FIT FOR A PARTICULAR
PURPOSE OR NON-INFRINGING. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE COVERED CODE
 IS WITH LICENSEE. SHOULD ANY COVERED CODE PROVE DEFECTIVE IN ANY RESPECT, LICENSEE (NOT THE CTUIR
 OR ANY OTHER CONTRIBUTOR) ASSUMES THE COST OF ANY NECESSARY SERVICING, REPAIR OR CORRECTION.
 THIS DISCLAIMER OF WARRANTY CONSTITUTES AN ESSENTIAL PART OF THIS LICENSE. NO USE OF
  ANY COVERED CODE IS AUTHORIZED HEREUNDER EXCEPT UNDER THIS DISCLAIMER.

*/

//  This file contains all of the various config values.
//  Many of these items will need to be configured when you implement this system
//  in a new environment.

//note: there are some other files you will need to edit, too:
//projects/components/project-list/templates/projects.html - (the layer url must be defined there or the directive fails.)

var ENVIRONMENT = "dev"; //or "prod"

var CURRENT_VERSION = ".3";

//Change these to point to your own webserver directories
var serviceUrl = '//localhost/services';
var serverUrl = '//localhost/cdms';

var cdmsShareUrl = 'C://ken//IIS-WEB//cdms-ken//services//uploads//';  // Location of project/dataset/subproject files
var proxyUrl = "FIXME_PROXY";

var REPORTSERVER_URL = 'http://cdms-sql/Reports/Pages/Folder.aspx?ItemPath=%2f'; //the Datastore "name" will be appended here, so make sure your report server folders are named the same as your datastore
var PROJECT_REPORT_URL = 'http://cdms-sql/ReportServer/Pages/ReportViewer.aspx?%2fQuadReport_Prototype%2fQuadReport_Single&rs:Command=Render&Id='; //this is the report called from the "Quad REport" button on the project view page

var ANALYTICS_CODE = ''; //this should be your analytics code for google analytics.

//GIS defaults - change these to point to your own ArcGIS server
var GEOMETRY_SERVICE_URL = "//arcserv.ctuir.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";

var NAD83_SPATIAL_REFERENCE = 'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]';
var DEFAULT_LOCATION_PROJECTION_ZONE = {
    Projection: "NAD83",
    UTMZone: "11",
};   //Used as default when creating a new location

var BING_KEY = ""; //get a public/free one and use it
//var DEFAULT_BASEMAP = "BingMapsRoad";

//ag-grid license - allowed for our CDMS partners - request key from CTUIR
//AG_GRID_LICENSE = ""

//constants -- you might need to change these to match index values in your own database
var DEFAULT_PROJECT_LOCATION_TYPE = 3; // Primary Project Location, from table LocationTypes
var PRIMARY_PROJECT_LOCATION_TYPEID = 3;

var LOCATION_TYPE_AdultWeir = 4;
var LOCATION_TYPE_ArtificialProduction = 110;
var LOCATION_TYPE_Benthic = 116;
var LOCATION_TYPE_BSample = 113;
var LOCATION_TYPE_CreelSurvey = 109;
var LOCATION_TYPE_Drift = 117;
var LOCATION_TYPE_Electrofishing = 101;
var LOCATION_TYPE_FishScales = 104;
var LOCATION_TYPE_Genetic = 115;
var LOCATION_TYPE_Hab = 112;
var LOCATION_TYPE_JvRearing = 114;
var LOCATION_TYPE_Metrics = 112;
var LOCATION_TYPE_SpawningGroundSurvey = 7;
var LOCATION_TYPE_ScrewTrap = 103;
var LOCATION_TYPE_SnorkelFish = 102;
var LOCATION_TYPE_StreamNet_RperS = 106;
var LOCATION_TYPE_StreamNet_NOSA = 107;
var LOCATION_TYPE_StreamNet_SAR = 108;
var LOCATION_TYPE_WaterQuality = 105;
var LOCATION_TYPE_WaterTemp = 6;
var LOCATION_TYPE_FishTransport = 118;

var SDE_FEATURECLASS_TAXLOTQUERY = 4;
var NUM_FLOAT_DIGITS = 3;
var FIELD_ROLE_HEADER = 1;
var FIELD_ROLE_DETAIL = 2;
var FIELD_ROLE_SUMMARY = 3;
var FIELD_ROLE_CALCULATED = 4;
var FIELD_ROLE_VIRTUAL = 5;
var METADATA_ENTITY_PROJECTTYPEID = 1;
var METADATA_ENTITY_HABITATTYPEID = 2;
var METADATA_ENTITY_DATASETTYPEID = 5;

var METADATA_PROPERTY_MAPIMAGE = 26;
var METADATA_PROPERTY_MAPIMAGE_HTML = 25;
var METADATA_PROPERTY_SUMMARYIMAGE = 11;
var METADATA_PROPERTY_SUMMARYIMAGE_HTML = 13;
var METADATA_PROPERTY_PROGRAM = 23;
var METADATA_PROPERTY_SUBPROGRAM = 24;

var USER_PREFERENCE_LANDINGPAGE = "LandingPage"; //Name of UserPreference that contains a user's landing page (if specified)

var CDMS_DOCUMENTATION_URL = "https://github.com/CTUIR/CDMS/wiki";

var profile = null;
var LOGIN_URL = serverUrl + '/login.html';
var WHOAMI_URL = serviceUrl + '/api/v1/account/whoami';
//var WHOAMI_URL = serviceUrl + '/action/whoami';
var date_pattern = "/[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}/";

//login-controller
var successUrl = serverUrl + '/index.html';
var loginUrl = serverUrl + '/login.html'


//import-controller uses these constants
// note: we did have to hard-code these on the dataset-import.html page in ng-disabled attributes
var DO_NOT_MAP = 0;
var ACTIVITY_DATE = 1;
var INDEX_FIELD = 2;
var LOCATION_ID = 2;
var ROW_QA_STATUS_ID = 3;
var FISHERMAN = 3;

var DEFAULT_IMPORT_QACOMMENT = "Initial Import";


//System Timezones
var millis_per_h = 3600000;
var SystemTimezones = [
    {
        "Id": 0,
        "Name": "Pacific Standard Time (GMT-08:00)",
        "Description": "(GMT-08:00) Pacific Standard Time (US & Canada)",
        "TimezoneOffset": -8 * millis_per_h,
    },
    {
        "Id": 1,
        "Name": "Pacific Daylight Time (GMT-07:00)",
        "Description": "(GMT-07:00) Pacific Daylight Time (US & Canada)",
        "TimezoneOffset": -7 * millis_per_h,
    },
    //{
    //  "Name" : "Mountain Standard Time (GMT-07:00)",
    //  "Description" : "(GMT-07:00) Mountain Standard Time (US & Canada)",
    //  "TimezoneOffset" : -7 * millis_per_h,
    //},
    //{
    //  "Name" : "Central Standard Time",
    //  "Description" : "(GMT-06:00) Central Standard Time (US & Canada)",
    //  "TimezoneOffset" : -6 * millis_per_h,
    //},
    //{
    //  "Name" : "Eastern Standard Time",
    //  "Description" : "(GMT-05:00) Eastern Standard Time (US & Canada)",
    //  "TimezoneOffset" : -5 * millis_per_h,
    //},
    //{
    //  "Name" : "Mountain Daylight Time (GMT-06:00)",
    //  "Description" : "(GMT-06:00) Mountain Daylight Time (US & Canada)",
    //  "TimezoneOffset" : -6 * millis_per_h,
    //},

    {
        "Id": 7,
        "Name": "Greenwich Mean Time (GMT-00:00)",
        "Description": "(GMT-00:00) Greenwich Mean Time",
        "TimezoneOffset": 0,
    },


    //{
    //  "Name" : "Central Daylight Time",
    //  "Description" : "(GMT-05:00) Central Daylight Time (US & Canada)",
    //  "TimezoneOffset" : -5 * millis_per_h,
    // }, {
    //  "Name" : "Eastern Daylight Time",
    //  "Description" : "(GMT-04:00) Eastern Daylight Time (US & Canada)",
    //  "TimezoneOffset" : -4 * millis_per_h,
    //}
];

//Data Grade Methods -- shows up as a select list in accuracy check
var DataGradeMethods = [];
DataGradeMethods.push(""); // 0
DataGradeMethods.push("NIST check in BOTH warm and ice baths");
DataGradeMethods.push("NIST check in ice bath only");
DataGradeMethods.push("Manufacturer Calibration");
DataGradeMethods.push("No Accuracy Check Conducted");
DataGradeMethods.push("Unknown Accuracy Method");

var security_token = "";
var defaultLayer = "imageryLayer";

//used for dataset-activities (standard datasets)
var datasetActivitiesBasemapConfig = {
    // { library: "Esri", type: 'streets', title: 'ESRI Roads'},
    //{ library: "Esri", type: 'topo', title: 'Topographical'},
    //{ library: "Esri", type: 'hybrid', title: 'Hybrid' },

    // We had problems with Bing, down below, so we switched back to the ESRI map.
    // Note:  The roadsLayer, imageryLayer, and hybridLayer constants are not in the ESRI map,
    // but we use the library to tell which map service to call ~/js/directives/Maps.js
    roadsLayer: { library: "Esri", type: "https://www.arcgis.com/home/webmap/viewer.html?url=http%3A%2F%2Fserver.arcgisonline.com%2Farcgis%2Frest%2Fservices%2FWorld_Street_Map%2FMapServer&source=sd", Display: 'Roads' },
    imageryLayer: { library: "Esri", type: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer", Display: 'Aerial' },

    // The Bing map is better, but we had problems with it.
    //roadsLayer: { library: "Bing", type: 'BingMapsRoad', Display: 'Roads' },
    //imageryLayer: { library: "Bing", type: 'BingMapsAerial', Display: 'Aerial' },
    //hybridLayer: { library: "Bing", type: 'BingMapsHybrid', Display: 'Hybrid' },
};

