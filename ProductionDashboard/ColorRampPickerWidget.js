/**
 * COPYRIGHT 2013 ESRI
 *
 * TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 * Unpublished material - all rights reserved under the
 * Copyright Laws of the United States and applicable international
 * laws, treaties, and conventions.

 * For additional information, contact:
 * Environmental Systems Research Institute, Inc.
 * Attn: Contracts and Legal Services Department
 * 380 New York Street
 * Redlands, California, 92373
 * USA

 * email: contracts@esri.com
 */

/**
* Run Query, 
* count records for the same value of "Value Field"
* for each value label with the "Label Field"
*/
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
  	"dojo/dom-class",
	"dojo/dom-style",
  	"dojo/Evented",
  	"dijit/form/Select",
	"esri/productiondashboard/PDWidget"
	
 ],
 function(declare, 
 		 lang,
 		 domConstruct,
 		 domClass,
 		 domStyle,
 		 Evented,
 		 Select,
 		 PDWidget){

 	(function (){
  		var css = [
                    require.toUrl("esri/productiondashboard/mp-dashboard.css")
                          ];
                var head = document.getElementsByTagName("head").item(0), link;
                for (var i = 0, il = css.length; i < il; i++) {
                    link = document.createElement("link");
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.href = css[i].toString();
                    head.appendChild(link);
                }
  	}());

  	return declare("esri.productiondashboard.ColorRampPickerWidget", [PDWidget, Evented], {
  		baseClass : 'ColorRampPickerWidget',
  		templateString: '<span><span class="${baseClass}" data-dojo-type="dijit/form/Select" data-dojo-attach-point="colorRampsSelect">${!selectBody}</span></span>',
  		
  		colorRamps:  [
                ["#6cb4e2","#7f794a","#ff9500","#005e95","#95692a","#4897c8","#eba748","#247aae","#ca924a","#ffa835"],
                ["#9081bc","#24d0e5","#b082d2","#f185ff","#48c2e3","#c494f5","#6cb4e2","#d083e8","#98a4eb","#00dee7"],
                ["#c93100","#cfea24","#5dc05a","#fff000","#49a247","#db7000","#71de6e","#a0e449","#edb000","#358534"],
                ["#a5e800","#968dd6","#69dcff","#87e27f","#97b861","#b096ff","#2794d9","#8a89c2","#48b8ec","#a391ea"],
                ["#b78a54","#7fc596","#90d322","#e7ab63","#92d64b","#cf9a5b","#ffbc6b","#6cb4e2","#b3b268","#a5e800"],
                ["#fff000","#67a966","#b096ff","#6aba68","#c7b85e","#99c044","#a08bdd","#6dcc6b","#9081bc","#71de6e"],
                ["#005e95","#338bb8","#67b9db","#9be7ff","#8bd6f5","#7bc5eb","#6bc1eb","#55a9df","#3e9edc","#2794d9"],
                ["#005529","#258240","#4bb057","#71de6e","#6dcc6b","#6aba68","#67a966","#569d55","#459144","#358534"],
                ["#634ca8","#925fc5","#c172e2","#f185ff","#db8aff","#c590ff","#b096ff","#a58fe8","#9a88d2","#9081bc"],
                ["#8a581e","#b17937","#d89a51","#ffbc6b","#f3ac57","#e79c43","#db8d2f","#cf8c3b","#c38b47","#b78a54"],
                ["#fad817","#b78a54","#d96807","#5e4f3d","#bd6c38","#c93100","#8a6c48","#e9a00f","#c34e1c","#323232"]
              ],
        selectBody: '',
        selectedRamp: null,
        
        postMixInProperties: function(){
        	this.inherited(arguments);
        	var content = this.buildSelect().toString();
        	this.selectBody = content;
        	this.selectedRamp = this.colorRamps[0];
        }, 

    	buildRendering: function(){
            this.inherited(arguments); 
        },      
    
        postCreate: function(){
          this.inherited(arguments);
          this.colorRampsSelect.on('change', lang.hitch(this,function(e){
          	  //alert('received a change event!')
          	  this.selectedRamp = this.colorRamps[e]
          	  this.emit("selectedColorRamp", this.selectedRamp);
          }));
          this.emit("selectedColorRamp", this.selectedRamp);
      	},

        buildSelect: function(){
        	var options = "";
        	for(var i=0;i<this.colorRamps.length;i++){
        		var option = '<span data-dojo-value="'+i+'">';
        		option+='<span class="ColorRampPickerWidget cpSwatchRow">'
        		var rowColors = this.colorRamps[i];
        		for (var cIndex=0;cIndex < rowColors.length;cIndex++){
        			option+='<span style="background-color:'+rowColors[cIndex]+';" class="ColorRampPickerWidget cpSwatch"></span>';
        		}
        		option+='</span>';
        		option+='</span>'
        		options+=option;
        	}
        	return options;
        },

        getSelectedColorRamp:function(){
        	return this.selectedRamp;
        }
  	});
});
