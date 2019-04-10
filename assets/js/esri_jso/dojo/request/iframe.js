//>>built
define("dojo/request/iframe","module require ./watch ./util ./handlers ../_base/lang ../io-query ../query ../has ../dom ../dom-construct ../_base/window ../NodeList-dom".split(" "),function(B,C,D,r,E,x,z,F,s,A,t,d){function G(a){return!this.isFulfilled()}function H(a){return!!this._finished}function I(a,b){if(!b)try{var f=a.options,h=c.doc(c._frame),e=f.handleAs;if("html"!==e){if("xml"===e)if("html"===h.documentElement.tagName.toLowerCase()){F("a",h.documentElement).orphan();var d=h.documentElement.innerText,
d=d.replace(/>\s+</g,"\x3e\x3c");a.text=x.trim(d)}else a.data=h;else a.text=h.getElementsByTagName("textarea")[0].value;E(a)}else a.data=h}catch(g){b=g}b?this.reject(b):this._finished?this.resolve(a):this.reject(Error("Invalid dojo/request/iframe request state"))}function J(a){this._callNext()}function c(a,b,f){var d=r.parseArgs(a,r.deepCreate(K,b),!0);a=d.url;b=d.options;if("GET"!==b.method&&"POST"!==b.method)throw Error(b.method+" not supported by dojo/request/iframe");c._frame||(c._frame=c.create(c._iframeName,
y+"();"));a=r.deferred(d,null,G,H,I,J);a._callNext=function(){this._calledNext||(this._calledNext=!0,c._currentDfd=null,c._fireNextRequest())};a._legacy=f;c._dfdQueue.push(a);c._fireNextRequest();D(a);return f?a:a.promise}var u=B.id.replace(/[\/\.\-]/g,"_"),y=u+"_onload";d.global[y]||(d.global[y]=function(){var a=c._currentDfd;if(a){var b=A.byId(a.response.options.form)||a._tmpForm;if(b){for(var f=a._contentToClean,d=0;d<f.length;d++)for(var e=f[d],l=0;l<b.childNodes.length;l++){var g=b.childNodes[l];
if(g.name===e){t.destroy(g);break}}a._originalAction&&b.setAttribute("action",a._originalAction);a._originalMethod&&(b.setAttribute("method",a._originalMethod),b.method=a._originalMethod);a._originalTarget&&(b.setAttribute("target",a._originalTarget),b.target=a._originalTarget)}a._tmpForm&&(t.destroy(a._tmpForm),delete a._tmpForm);a._finished=!0}else c._fireNextRequest()});var K={method:"POST"};c.create=function(a,b,c){if(d.global[a])return d.global[a];if(d.global.frames[a])return d.global.frames[a];
c||(s("config-useXDomain")&&!s("config-dojoBlankHtmlUrl")&&console.warn("dojo/request/iframe: When using cross-domain Dojo builds, please save dojo/resources/blank.html to your domain and set dojoConfig.dojoBlankHtmlUrl to the path on your domain to blank.html"),c=s("config-dojoBlankHtmlUrl")||C.toUrl("dojo/resources/blank.html"));b=t.place('\x3ciframe id\x3d"'+a+'" name\x3d"'+a+'" src\x3d"'+c+'" onload\x3d"'+b+'" style\x3d"position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden"\x3e',
d.body());return d.global[a]=b};c.doc=function(a){if(a.contentDocument)return a.contentDocument;var b=a.name;if(b){var c=d.doc.getElementsByTagName("iframe");if(a.document&&c[b].contentWindow&&c[b].contentWindow.document)return c[b].contentWindow.document;if(d.doc.frames[b]&&d.doc.frames[b].document)return d.doc.frames[b].document}return null};c.setSrc=function(a,b,c){a=d.global.frames[a.name];a.contentWindow&&(a=a.contentWindow);try{c?a.location.replace(b):a.location=b}catch(h){}};c._iframeName=
u+"_IoIframe";c._notifyStart=function(){};c._dfdQueue=[];c._currentDfd=null;c._fireNextRequest=function(){var a;try{if(!c._currentDfd&&c._dfdQueue.length){do a=c._currentDfd=c._dfdQueue.shift();while(a&&(a.canceled||a.isCanceled&&a.isCanceled())&&c._dfdQueue.length);if(!a||a.canceled||a.isCanceled&&a.isCanceled())c._currentDfd=null;else{var b=a.response,f=b.options,h=a._contentToClean=[],e=A.byId(f.form),l=r.notify,g=f.data||null,n;!a._legacy&&"POST"===f.method&&!e?e=a._tmpForm=t.create("form",{name:u+
"_form",style:{position:"absolute",top:"-1000px",left:"-1000px"}},d.body()):"GET"===f.method&&(e&&-1<b.url.indexOf("?"))&&(n=b.url.slice(b.url.indexOf("?")+1),g=x.mixin(z.queryToObject(n),g));if(e){if(!a._legacy){var k=e;do k=k.parentNode;while(k!==d.doc.documentElement);k||(e.style.position="absolute",e.style.left="-1000px",e.style.top="-1000px",d.body().appendChild(e));e.name||(e.name=u+"_form")}if(g){var k=function(a,b){t.create("input",{type:"hidden",name:a,value:b},e);h.push(a)},p;for(p in g){var q=
g[p];if(x.isArray(q)&&1<q.length)for(n=0;n<q.length;n++)k(p,q[n]);else e[p]?e[p].value=q:k(p,q)}}var v=e.getAttributeNode("action"),m=e.getAttributeNode("method"),w=e.getAttributeNode("target");b.url&&(a._originalAction=v?v.value:null,v?v.value=b.url:e.setAttribute("action",b.url));if(a._legacy){if(!m||!m.value)m?m.value=f.method:e.setAttribute("method",f.method)}else a._originalMethod=m?m.value:null,m?m.value=f.method:e.setAttribute("method",f.method);a._originalTarget=w?w.value:null;w?w.value=c._iframeName:
e.setAttribute("target",c._iframeName);e.target=c._iframeName;l&&l.emit("send",b,a.promise.cancel);c._notifyStart(b);e.submit()}else f="",b.options.data&&(f=b.options.data,"string"!==typeof f&&(f=z.objectToQuery(f))),k=b.url+(-1<b.url.indexOf("?")?"\x26":"?")+f,l&&l.emit("send",b,a.promise.cancel),c._notifyStart(b),c.setSrc(c._frame,k,!0)}}}catch(s){a.reject(s)}};r.addCommonMethods(c,["GET","POST"]);return c});