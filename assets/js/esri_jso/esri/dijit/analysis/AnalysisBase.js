//>>built
define("esri/dijit/analysis/AnalysisBase","require dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/json dojo/has dojo/json dojo/Deferred dojo/promise/all dojo/data/ItemFileWriteStore dojo/string dojo/Evented dojo/_base/kernel dojo/Stateful ../../kernel ../../lang ../../request ../../tasks/Geoprocessor dojo/i18n!../../nls/jsapi ./utils ../../IdentityManager".split(" "),function(s,n,d,g,h,w,B,p,t,x,q,y,z,A,k,l,m,u,r,v){n=n([A,y],{declaredClass:"esri.dijit.analysis.AnalysisBase",isOutputLayerItemUpdated:!1,
analysisGpServer:null,toolName:null,portalUrl:null,jobParams:null,itemParams:null,gp:null,resultParameter:null,signInPromise:null,_jobInfo:null,_popupInfo:null,_toolServiceUrl:null,_counter:null,constructor:function(a){this.isOutputLayerItemUpdated=!1;this._rids=[];this._counter=0;this._popupInfo=[];a.analysisGpServer?this._signIn(a.analysisGpServer):a.portalUrl&&(this.portalUrl=a.portalUrl,this._signIn(a.portalUrl,!0))},postMixInProperties:function(){this.inherited(arguments);this.i18n={};d.mixin(this.i18n,
r.common);d.mixin(this.i18n,r.analysisTools);d.mixin(this.i18n,r.analysisMsgCodes)},execute:function(a){this.jobParams=a.jobParams;this.itemParams=this.jobParams.OutputName?a.itemParams:null;this.signInPromise.then(d.hitch(this,this._checkUser))},_checkUser:function(){var a;if(a=k.id.findCredential(this.portalUrl).userId)a=this.portalUrl+"/sharing/community/users/"+a,m({url:a,content:{f:"json"}}).then(d.hitch(this,this._handleUserProfileResponse),d.hitch(this,function(a){this.emit("job-fail",{message:a.message+
(a.details?a.details.toString():""),jobParams:this.jobParams})}))},_handleUserProfileResponse:function(a){a.accountId?"account_admin"===a.role||"account_publisher"===a.role||"org_admin"===a.role||"org_publisher"===a.role?this.itemParams?this._checkServiceName(a.accountId):(this._submitGpJob(),this.emit("start",this.jobParams)):this.emit("job-fail",{message:this.i18n.pubRoleMsg,messageCode:"AB_0001",jobParams:this.jobParams}):this.emit("job-fail",{message:this.i18n.orgUsrMsg,jobParams:this.jobParams})},
_checkServiceName:function(a){var b;k.id.findCredential(this.portalUrl);a=this.portalUrl+"/sharing/portals/"+a+"/isServiceNameAvailable";b={name:h.fromJson(this.jobParams.OutputName).serviceProperties.name,type:"Feature Service",f:"json"};m({url:a,content:b}).then(d.hitch(this,function(a){a.available?(this._createService(),this.emit("start",this.jobParams)):this.emit("job-fail",{message:this.i18n.servNameExists,type:"warning",messageCode:"AB_0002",jobParams:this.jobParams})}),d.hitch(this,function(a){this.emit("job-fail",
{message:a.message+(a.details?a.details.toString():""),jobParams:this.jobParams})}))},_createService:function(){var a,b,c;a=k.id.findCredential(this.portalUrl).userId;b=h.fromJson(this.jobParams.OutputName);a&&(c=this.itemParams.folder,a=this.portalUrl+"/sharing/content/users/"+a+(c&&"/"!==c?"/"+c:"")+"/createService",b={createParameters:h.toJson({currentVersion:10.2,serviceDescription:"",hasVersionedData:!1,supportsDisconnectedEditing:!1,hasStaticData:!0,maxRecordCount:2E3,supportedQueryFormats:"JSON",
capabilities:"Query",description:"",copyrightText:"",allowGeometryUpdates:!1,syncEnabled:!1,editorTrackingInfo:{enableEditorTracking:!1,enableOwnershipAccessControl:!1,allowOthersToUpdate:!0,allowOthersToDelete:!0},xssPreventionInfo:{xssPreventionEnabled:!0,xssPreventionRule:"InputOnly",xssInputRule:"rejectInvalid"},tables:[],name:b.serviceProperties.name}),outputType:"featureService",f:"json"},m({url:a,content:b},{usePost:!0}).then(d.hitch(this,this._submitGpJob),d.hitch(this,this._handleCreateServiceError)))},
_handleCreateServiceError:function(a){this.emit("job-fail",{message:a.message+(a.details?a.details.toString():""),jobParams:this.jobParams})},_getSelf:function(a){return m({url:a+"/sharing/rest/portals/self",content:{culture:z.locale,f:"json"},callbackParamName:"callback",timeout:0},{})},_submitGpJob:function(a){var b;this.itemParams&&(this.currentGpItemId=a.itemId,b=h.fromJson(this.jobParams.OutputName),b.serviceProperties&&(b.serviceProperties.serviceUrl=a.serviceurl),b.itemProperties={itemId:a.itemId},
this.jobParams.OutputName=h.toJson(b));this.analysisGpServer?((!this._toolServiceUrl||!this.gp)&&this.set("toolServiceUrl",this.analysisGpServer+"/"+this.toolName),this.gp.setUpdateDelay(3E3),this.gp.submitJob(this.jobParams,d.hitch(this,this._gpJobComplete),d.hitch(this,this._gpJobStatus),d.hitch(this,this._gpJobFailed)),this.emit("job-submit",this.jobParams)):this._getSelf(this.portalUrl).then(d.hitch(this,function(a){this.analysisGpServer=a.helperServices.analysis&&a.helperServices.analysis.url?
a.helperServices.analysis.url:null;this.set("toolServiceUrl",this.analysisGpServer+"/"+this.toolName);this.gp.setUpdateDelay(3E3);this.gp.submitJob(this.jobParams,d.hitch(this,this._gpJobComplete),d.hitch(this,this._gpJobStatus),d.hitch(this,this._gpJobFailed));this.emit("job-submit",this.jobParams)}))},_updateItem:function(){var a,b,c;if(a=k.id.findCredential(this.portalUrl).userId)return b=this.itemParams.folder,a=this.portalUrl+"/sharing/content/users/"+a+(b&&"/"!==b?"/"+b:"")+"/items/"+this.currentGpItemId+
"/update",this.itemParams.typeKeywords="jobUrl:"+this._toolServiceUrl+"/jobs/"+this._jobInfo.jobId,b=d.mixin({f:"json"},this.itemParams),c={},this._popupInfo&&0<this._popupInfo.length&&(c.layers=g.map(this._popupInfo,function(a,b){a.description=null;return{id:b,popupInfo:a}},this)),b.text=h.toJson(c),a=m({url:a,content:b},{usePost:!0}),a.then(d.hitch(this,this._handleItemUpdate),d.hitch(this,this._handleUpdateItemError)),a},_handleItemUpdate:function(a){this.isOutputLayerItemUpdated=!0},_handleItemDataUpdate:function(a){},
_handleUpdateItemError:function(a){this.isOutputLayerItemUpdated=!0;this.emit("job-fail",{message:a.message+(a.details?a.details.toString():""),jobParams:this.jobParams})},_handleErrorResponse:function(a){this.emit("job-fail",a)},_refreshItem:function(){var a,b;if(a=k.id.findCredential(this.portalUrl).userId)return b=this.itemParams.folder,a=this.portalUrl+"/sharing/content/users/"+a+(b&&"/"!==b?"/"+b:"")+"/items/"+this.currentGpItemId+"/refresh",m({url:a,content:{f:"json"}},{usePost:!0})},_handleItemRefresh:function(a){},
_gpJobStatus:function(a){var b="",c=[],e,f;a.jobParams=this.jobParams;if("esriJobFailed"===a.jobStatus||"esriJobSucceeded"===a.jobStatus)a.message?b=a.message:a.messages&&(c=g.filter(a.messages,function(a){if(("esriJobMessageTypeError"===a.type||"esriJobMessageTypeWarning"===a.type)&&a.description&&-1!==a.description.indexOf("messageCode"))return a.description}),0<c.length&&g.forEach(c,function(c){e=h.fromJson(c.description);f="";"esriJobMessageTypeWarning"===c.type&&(a.type="warning");e.messageCode?
(f=l.isDefined(this.i18n[e.messageCode])?this.i18n[e.messageCode]:e.message,f=l.isDefined(e.params)?q.substitute(f,e.params):f,b+=f+"\x26nbsp;"):e.error&&e.error.messageCode&&(f=l.isDefined(this.i18n[e.error.messageCode])?this.i18n[e.error.messageCode]:e.message,f=l.isDefined(e.error.params)?q.substitute(f,e.error.params):f,b+=f+"\x26nbsp;")},this)),a.message=b,"esriJobFailed"===a.jobStatus&&this._deleteItem(!1);this.emit("job-status",a);this._jobInfo=a;this.itemParams&&!this.isOutputLayerItemUpdated&&
this._updateItem()},_updateRefreshItem:function(a){var b=[];b.push(this._refreshItem());b.push(this._updateItem());t(b).then(d.hitch(this,function(b){a.outputLayerName=h.fromJson(this.jobParams.OutputName).serviceProperties.name;a.value.itemId=this.currentGpItemId;a.analysisInfo={toolName:this.toolName,jobParams:this.jobParams};this.emit("job-result",a)}),d.hitch(this,this._handleDeleteItemError))},_gpJobComplete:function(a){var b;"esriJobSucceeded"===a.jobStatus&&(a.jobParams=this.jobParams,this.emit("job-success",
a),t(this._getGpResultData(a)).then(d.hitch(this,function(c){c=g.filter(c,function(a){if(a.value&&!a.value.empty)return a});0===c.length?(this.currentGpItemId&&this._deleteItem(!1),this.emit("job-fail",{message:this.i18n.emptyResultInfoMsg,type:"warning",jobParams:this.jobParams})):(g.forEach(c,function(a){if(a.value.featureSet&&!a.value.url)a.value.featureSet.spatialReference=a.value.layerDefinition.spatialReference;else if(a.value.url&&-1!==a.value.url.indexOf("/FeatureServer/")&&a.value.layerInfo&&
a.value.layerInfo.popupInfo){var b=a.value.url.match(/[0-9]+$/g)[0];this._popupInfo[b]=a.value.layerInfo.popupInfo}},this),b=c[0],this.jobParams.isProcessInfo?this.gp.getResultData(a.jobId,"ProcessInfo").then(d.hitch(this,function(a){var c=[];g.forEach(a.value,function(a){c.push(h.fromJson(a))},this);this.currentGpItemId?(this.itemParams.description=v.buildReport(c),this._updateRefreshItem(b)):(b.analysisReport=v.buildReport(c),this.emit("job-result",b))})):this.currentGpItemId?this._updateRefreshItem(b):
this.emit("job-result",b))})))},_gpJobFailed:function(a){var b="",c=[],e,f;d.clone(a).jobParams=this.jobParams;a.message?b=a.message:a.messages&&(c=g.filter(a.messages,function(a){if(("esriJobMessageTypeError"===a.type||"esriJobMessageTypeWarning"===a.type)&&a.description&&-1!==a.description.indexOf("messageCode"))return a.description}),0<c.length&&g.forEach(c,function(a){e=h.fromJson(a.description);f="";e.messageCode?(f=l.isDefined(this.i18n[e.messageCode])?this.i18n[e.messageCode]:e.message,f=l.isDefined(e.params)?
q.substitute(f,e.params):f,b+=f+"\x26nbsp;"):e.error&&e.error.messageCode&&(f=l.isDefined(this.i18n[e.error.messageCode])?this.i18n[e.error.messageCode]:e.message,f=l.isDefined(e.params)?q.substitute(f,e.error.params):f,b+=f+"\x26nbsp;")},this));a.message=b;this.emit("job-fail",a)},_getGpResultData:function(a){var b=[],c=[];"string"===typeof this.resultParameter?c.push(this.resultParameter):this.resultParameter instanceof Array&&(c=this.resultParameter);g.forEach(c,function(c,d){b.push(this.gp.getResultData(a.jobId,
c))},this);return b},cancel:function(a){this.gp.cancelJob(a.jobId).then(d.hitch(this,function(a){"esriJobCancelled"===a.jobStatus&&(this.itemParams?this._deleteItem(!0):this.emit("job-cancel",a))}),function(a){})},_deleteItem:function(a){var b,c;if((b=k.id.findCredential(this.portalUrl).userId)&&this.itemParams)c=l.isDefined(this.itemParams.folder)?this.itemParams.folder:"",b=this.portalUrl+"/sharing/content/users/"+b+(c&&"/"!==c?"/"+c:"")+"/items/"+this.currentGpItemId+"/delete",m({url:b,content:{f:"json"}},
{usePost:!0}).then(d.hitch(this,this._handleItemDelete,a),d.hitch(this,this._handleDeleteItemError))},_handleItemDelete:function(a,b){a&&this.emit("job-cancel",b)},_handleDeleteItemError:function(a){this.emit("job-fail",{message:a.message+(a.details?a.details.toString():""),jobParams:this.jobParams})},_initFolderStore:function(a,b){this._fportal=new a.Portal(this.portalUrl);this._fportal.signIn().then(d.hitch(this,function(a){this.portalUser=a;this.portalUser.getFolders().then(d.hitch(this,function(a){var c=
new x({data:{identifier:"id",label:"name",items:[]}});c.newItem({name:this.portalUser.username,id:""});g.forEach(a,function(a){c.newItem({name:a.title,id:a.id})});b.resolve(c)}))}))},getFolderStore:function(){var a=new p,b,c,e,f;this.signInPromise.then(d.hitch(this,function(d){k.id.findCredential(this.portalUrl);b=["../../arcgis/Portal"];c=this._counter++;e=this;this._rids&&this._rids.push(c);s(b,function(b){f=e._rids?g.indexOf(e._rids,c):-1;-1!==f&&(e._rids.splice(f,1),e._initFolderStore(b,a))})}));
return a},_checkToolUrl:function(){var a=new p;this.analysisGpServer?((!this._toolServiceUrl||!this.gp)&&this.set("toolServiceUrl",this.analysisGpServer+"/"+this.toolName),a.resolve({success:!0})):this._getSelf(this.portalUrl).then(d.hitch(this,function(b){(this.analysisGpServer=b.helperServices.analysis&&b.helperServices.analysis.url?b.helperServices.analysis.url:null)&&this.set("toolServiceUrl",this.analysisGpServer+"/"+this.toolName);a.resolve({success:!0})}));return a},getCreditsEstimate:function(a,
b){var c,e,f,g,k;e=new p;this._checkToolUrl().then(d.hitch(this,function(h){this._toolServiceUrl?k=this._toolServiceUrl:(g=this.portalUrl&&-1!==this.portalUrl.indexOf("dev")?"dev":this.portalUrl&&-1!==this.portalUrl.indexOf("qa")?"qa":"",k="http://analysis"+g+".arcgis.com/arcgis/rest/services/tasks/GPServer/"+this.toolName);c=k.replace("/"+a,"/exts/Estimate/"+a);f=d.mixin({f:"json"},b);m({url:c,content:f},{usePost:!0}).then(function(a){e.resolve(a)},function(a){e.resolve(a)})}));return e},_signIn:function(a,
b){var c,e,f,h,l;this.signInPromise=new p;b?(c=["../../arcgis/Portal"],e=this._counter++,f=this,this._rids&&this._rids.push(e),s(c,d.hitch(this,function(b){h=f._rids?g.indexOf(f._rids,e):-1;-1!==h&&(f._rids.splice(h,1),this._portal=new b.Portal(a),this._portal.signIn().then(d.hitch(this,function(a){this._portal.helperServices&&this._portal.helperServices.analysis&&this._portal.helperServices.analysis.url?(this.analysisGpServer=this._portal.helperServices.analysis.url,m({url:this.analysisGpServer,
content:{f:"json"},callbackParamName:"callback"}).then(d.hitch(this,function(a){l=k.id.findCredential(this.analysisGpServer);this.signInPromise.resolve(l)}),d.hitch(this,function(a){this.signInPromise.reject(a)}))):this.signInPromise.resolve(a)}),d.hitch(this,function(a){this.signInPromise.reject(a)})))}))):m({url:a,content:{f:"json"},callbackParamName:"callback"}).then(d.hitch(this,function(b){b=k.id.findCredential(a);this.portalUrl=k.id.findServerInfo(this._toolServiceUrl).owningSystemUrl;this.signInPromise.resolve(b)}),
d.hitch(this,function(a){this.signInPromise.reject(a)}));return this.signInPromise},_toolServiceUrlSetter:function(a){this._toolServiceUrl=a;this.gp=new u(a)},_setToolServiceUrlAttr:function(a){this._toolServiceUrl=a;this.gp=new u(a)}});w("extend-esri")&&d.setObject("dijit.analysis.AnalysisBase",n,k);return n});