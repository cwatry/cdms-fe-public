//>>built
define("dojox/mobile/ToolBarButton","dojo/_base/declare dojo/_base/lang dojo/_base/window dojo/dom-class dojo/dom-construct dojo/dom-style dojo/dom-attr ./sniff ./_ItemBase dojo/has!dojo-bidi?dojox/mobile/bidi/ToolBarButton".split(" "),function(h,k,g,b,f,p,l,c,m,n){g=h(c("dojo-bidi")?"dojox.mobile.NonBidiToolBarButton":"dojox.mobile.ToolBarButton",m,{selected:!1,arrow:"",light:!0,defaultColor:"mblColorDefault",selColor:"mblColorDefaultSel",baseClass:"mblToolBarButton",_selStartMethod:"touch",_selEndMethod:"touch",
buildRendering:function(){!this.label&&this.srcNodeRef&&(this.label=this.srcNodeRef.innerHTML);this.label=k.trim(this.label);this.domNode=this.srcNodeRef&&"SPAN"===this.srcNodeRef.tagName?this.srcNodeRef:f.create("span");l.set(this.domNode,"role","button");this.inherited(arguments);if(this.light&&!this.arrow&&(!this.icon||!this.label))this.labelNode=this.tableNode=this.bodyNode=this.iconParentNode=this.domNode,b.add(this.domNode,this.defaultColor+" mblToolBarButtonBody"+(this.icon?" mblToolBarButtonLightIcon":
" mblToolBarButtonLightText"));else{this.domNode.innerHTML="";if("left"===this.arrow||"right"===this.arrow)this.arrowNode=f.create("span",{className:"mblToolBarButtonArrow mblToolBarButton"+("left"===this.arrow?"Left":"Right")+"Arrow "+(10>c("ie")?"":this.defaultColor+" "+this.defaultColor+"45")},this.domNode),b.add(this.domNode,"mblToolBarButtonHas"+("left"===this.arrow?"Left":"Right")+"Arrow");this.bodyNode=f.create("span",{className:"mblToolBarButtonBody"},this.domNode);this.tableNode=f.create("table",
{cellPadding:"0",cellSpacing:"0",border:"0"},this.bodyNode);!this.label&&this.arrow&&(this.tableNode.className="mblToolBarButtonText");var a=this.tableNode.insertRow(-1);this.iconParentNode=a.insertCell(-1);this.labelNode=a.insertCell(-1);this.iconParentNode.className="mblToolBarButtonIcon";this.labelNode.className="mblToolBarButtonLabel";this.icon&&("none"!==this.icon&&this.label)&&(b.add(this.domNode,"mblToolBarButtonHasIcon"),b.add(this.bodyNode,"mblToolBarButtonLabeledIcon"));b.add(this.bodyNode,
this.defaultColor)}},startup:function(){this._started||(this.connect(this.domNode,"onkeydown","_onClick"),this.inherited(arguments),this._isOnLine||(this._isOnLine=!0,this.set("icon",void 0!==this._pendingIcon?this._pendingIcon:this.icon),delete this._pendingIcon))},_onClick:function(a){(!a||!("keydown"===a.type&&13!==a.keyCode))&&!1!==this.onClick(a)&&this.defaultClickAction(a)},onClick:function(){},_setLabelAttr:function(a){this.inherited(arguments);b.toggle(this.tableNode,"mblToolBarButtonText",
a||this.arrow)},_setSelectedAttr:function(a){this.inherited(arguments);if(a){if(b.replace(this.bodyNode,this.selColor,this.defaultColor),!(10>c("ie"))&&this.arrowNode){var d=this.selColor,e=this.defaultColor;b.replace(this.arrowNode,d+" "+d+"45",e+" "+e+"45")}}else b.replace(this.bodyNode,this.defaultColor,this.selColor),!(10>c("ie"))&&this.arrowNode&&(d=this.defaultColor,e=this.selColor,b.replace(this.arrowNode,d+" "+d+"45",e+" "+e+"45"));b.toggle(this.domNode,"mblToolBarButtonSelected",a);b.toggle(this.bodyNode,
"mblToolBarButtonBodySelected",a)}});return c("dojo-bidi")?h("dojox.mobile.ToolBarButton",[g,n]):g});