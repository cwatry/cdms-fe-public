//>>built
define("esri/symbols/jsonUtils","dojo/_base/lang dojo/has ../kernel ./SimpleMarkerSymbol ./PictureMarkerSymbol ./SimpleLineSymbol ./CartographicLineSymbol ./SimpleFillSymbol ./PictureFillSymbol ./TextSymbol".split(" "),function(c,f,g,h,k,l,d,m,n,p){var e={fromJson:function(a){var b=null;switch(a.type){case "esriSMS":b=new h(a);break;case "esriPMS":b=new k(a);break;case "esriTS":b=new p(a);break;case "esriSLS":b=void 0!==a.cap?new d(a):new l(a);break;case "esriCLS":b=new d(a);break;case "esriSFS":b=
new m(a);break;case "esriPFS":b=new n(a)}return b},getShapeDescriptors:function(a){return a&&a.getShapeDescriptors?a.getShapeDescriptors():{defaultShape:null,fill:null,stroke:null}}};f("extend-esri")&&c.mixin(c.getObject("symbol",!0,g),e);return e});