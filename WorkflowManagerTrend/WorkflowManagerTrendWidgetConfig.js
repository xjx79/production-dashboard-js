/* 
2  * Copyright 2016 Esri 
3  * 
4  * Licensed under the Apache License, Version 2.0 (the "License"); 
5  * you may not use this file except in compliance with the License. 
6  * You may obtain a copy of the License at 
7  *   http://www.apache.org/licenses/LICENSE-2.0 
8  
9  * Unless required by applicable law or agreed to in writing, software 
10  * distributed under the License is distributed on an "AS IS" BASIS, 
11  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
12  * See the License for the specific language governing permissions and 
13  * limitations under the License. 
14  */

 define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dijit/Dialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dijit/form/Select",
  "dijit/form/CheckBox",
  "dojox/form/BusyButton",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojox/layout/TableContainer",  
  "dojo/text!./WorkflowManagerTrendWidgetConfigTemplate.html",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/ColorPickerWidget",
  "esri/productiondashboard/WMXQueriesWidget",
  "esri/productiondashboard/D3Charts/D3TrendChart",
  "dojo/domReady!"  
], function (declare, 
             lang,
             Dialog,
             BorderContainer,
             TabContainer,
             ContentPane,
             ValidationTextBox,
             regexp,
             Select,
             CheckBox,
             Button,
             Memory,
             ObjectStore,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin,
             TableContainer, 
             templateString,
             WidgetConfigurationProxy,
             PDInit,
             WMXEnum,
             WMXRequest,             
             ColorPickerWidget,
             WMXQueriesWidget,
             pdChartPreview
             ){

    return declare("WorkflowManagerTrendWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,    
          margin : {top: 05, right: 15, bottom: 15, left: 0},      
          widgetConfig: {},

          defaultSelectValuesStore : [
          { value: "loading", label: ""}],          

          groupDateByStoreData: [
              {value:PDInit.GROUP_BY_DAY, label: "Day"},
              {value:PDInit.GROUP_BY_MONTH, label: "Month"},
              {value:PDInit.GROUP_BY_YEAR, label: "Year"}
          ],

           calculationMethodStoreData: [
              {value:PDInit.CALCULATE_BY_COUNT, label: "Count"},
              {value:PDInit.CALCULATE_BY_SUM, label: "Sum"},
              {value:PDInit.CALCULATE_BY_AVERAGE, label: "Average"}
          ],

          labelOrientationSelectValuesStore : [            
               { value: 90, label: "Vertical"},
               { value: 0, label: "Horizontal"}
          ],          
          
          postCreate: function(){            
            this.inherited(arguments);                      
          },

          setSelectStore: function(selectId, store, idProperty, attributeLabel,selectedValue){
            var memStore = new Memory({
                idProperty: idProperty,
                data: store
               });

             var objectStore =  new ObjectStore({
                objectStore: memStore
             })
             selectId.set("labelAttr",attributeLabel);
             selectId.setStore(objectStore);
             if (selectedValue != undefined && 
                 store != undefined  && 
                 store.length > 0){
                selectId.set("value", selectedValue);            
             }
          
          },

          dataSourceSelectionChanged: function (dataSourceProxy, dataSourceConfig) {            
            this.dataSourceConfig = dataSourceConfig;                        
            this.initWidgetConfig(this.dataSourceConfig.widgetConfig);

          },
          
          initWidgetConfig: function(currentConfig){
           if (currentConfig == undefined) {
             this.wmxUrl.set('value', PDInit.WMX_SERVICE.url);   
             this.wmxUsername.set('value', PDInit.WMX_SERVICE.username);     
             this.widgetConfig = {
                  wmxUrl: this.wmxUrl.get('value'),
                  userName: this.wmxUsername.value,
                  connectionTested        :false, // values : true for life/ false for broken;
                  queryId: null,
                  valueField: null,                  
                  groupByField:null,  
                  datasourceId: null,               
                  groupValueField: true,                                    
                  idGroupBy: null,
                  vGroupBy: null,
                  method: PDInit.CALCULATE_BY_COUNT,
                  chartConfig : {               
                    showHorizontalGridLines: false,
                    show_horizontal_axis: true,
                    horizontal_ticks_orientation: 0,
                    wrapHAxisText:false,
                    show_vertical_axis: true,
                    from_color: "#134f5c",
                    to_color: "#00ff83",
                    add_chart_tip: true,
                    select_on_map:false 
                  }                  
              };              
           } else {
              this.widgetConfig.connectionTested = false;
              this.widgetConfig = currentConfig;  
              this.wmxUrl.set('value',this.widgetConfig.wmxUrl);
              this.wmxUsername.set('value', this.widgetConfig.userName);
           }                      
           this.WMXQueriesTree.on('selected', lang.hitch(this, this.onWMXQueryDropDownChanged));
           this.WMXQueriesTree.on('error', lang.hitch(this, this.onWMXQueryDropDownErrored));
           this.WMXQueriesTree.on('loaded', lang.hitch(this, this.onWMXQueryDropDownLoaded));  
           this.initQueryTab();
           this.intializeAppearanceTab();
           this.dataSourceConfig.widgetConfig = this.widgetConfig;            
          },

          initQueryTab: function(){
            if (this.widgetConfig.wmxUrl == ""){
              this.setConnectionStatus(false, "No WMX Service Url")
            } else {
              var request = new WMXRequest({url:this.widgetConfig.wmxUrl, proxyURL: PDInit.WmxProxy});
              this.WMXQueriesTree.wmxRequest = request;
              this.WMXQueriesTree.load();              
            }
          },

          enablegGroupeDate: function(status){
            this.gGroupDateBy.set('disabled', !status);           
          },

          enablevGroupDate: function(status){
            this.vGroupDateBy.set('disabled', !status);         
          },

          enableValueField: function(status){
            this.valueField.set('disabled', !status);
          },

          checkgroupDateBystatus: function(){

            var selectedItem = this.getSelectSelectedItem(this.groupByField);
            if (selectedItem) {
                this.enablegGroupeDate((selectedItem.type == WMXEnum.DATE_DATATYPE));            
            }
            selectedItem = this.getSelectSelectedItem(this.valueField);  
            if (selectedItem) {
              this.enablevGroupDate((selectedItem.type == WMXEnum.DATE_DATATYPE));                          
            }            
          },

          checkValueFieldStatus: function(){
            var selectedItem = this.getSelectSelectedItem(this.calculationMethod);
            if (selectedItem) {
              this.enableValueField((selectedItem.value != PDInit.CALCULATE_BY_COUNT));                          
            }
          },

          intializeAppearanceTab: function(){
           this.showHorizontalGridLinesCB.set('checked', this.widgetConfig.chartConfig.showHorizontalGridLines);
           this.showHorizontalAxisCB.set('checked', this.widgetConfig.chartConfig.show_horizontal_axis);
           this.showVerticalAxisCB.set('checked', this.widgetConfig.chartConfig.show_vertical_axis);           
           this.setSelectStore(this.labelOrientation,this.labelOrientationSelectValuesStore,"value","label",this.widgetConfig.chartConfig.horizontal_ticks_orientation); 
           this.colorPicker.setSelectedSwatchColor(this.widgetConfig.chartConfig.from_color);
           this.colorPicker.on('selectedColor', lang.hitch(this,this.colorChangeEventHandler));
           this.previewChart();
          },
          
          setQueryTabStatus: function(status){
            this.queryTab.set('disabled', !status);
          },

          setApperanceTabStatus: function(status){
            this.appearanceTab.set('disabled', !status);
          },

          showErrorDialog: function(errorMsg){
            if (errorMsg == undefined || errorMsg == "") errorMsg = 'Error encountered';
            var last = errorMsg[errorMsg.length-1]
            if (last == '!' || last == '.' || last == ',' || last == '?') {
              errorMsg = errorMsg.substring(0,errorMsg.length-1)
            }
            var errorDialog = new Dialog({
              title: "Error Message",
              style: "width: 300px;",
              content: "<strong>"+errorMsg+"!</strong>"
            });
            errorDialog.show();
          },

          showConnectionError: function (errorMsg){
            if (errorMsg == undefined || errorMsg == "") errorMsg = 'Connection error';
            this.connectionTab.set('selected',true);
            this.setQueryTabStatus(false);
            this.setApperanceTabStatus(false);
            this.connectBtn.cancel();
            this.showErrorDialog(errorMsg);
            
          },

          setConnectionStatus: function(status, errorMsg){
            var con_status = Boolean(status);
            if (con_status){             
              this.setQueryTabStatus(true);
              this.setApperanceTabStatus(true);
              this.checkgroupDateBystatus();
              this.checkValueFieldStatus(); 
              this.widgetConfig.connectionTested = true;
              this.connectBtn.cancel();        
              // persist                  
              this.validateConfig();   
            } else {             
              if (!this.widgetConfig.connectionTested){
                this.widgetConfig.connectionTested = true;
                this.showConnectionError(errorMsg);
              }
            }
            
          },

          colorChangeEventHandler: function(color){            
            this.widgetConfig.chartConfig.from_color = color;
            this.validateConfig();
            this.previewChart();
          },

          resetSelectStore: function(selectId){
             this.setSelectStore(selectId,this.defaultSelectValuesStore,"value","label");             
          },

          getSelectSelectedItem: function(selectId){
            if (selectId instanceof Select && selectId.store != undefined) {               
               return selectId.store.objectStore.get(selectId.get("value"));
            }
            return null;
          }, 

          isValidSelectValue: function(value) {
              return (value == undefined)? 
                       false: 
                       !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
          },
          
          captureWidgetConfig: function() {

            var status = this.wmxUrl.isValid();         
            if (!status) {
              this.connectBtn.set('disabled', true);
              return false;
            }

            status = this.wmxUsername.isValid();
            if (!status) {
              this.connectBtn.set('disabled', true);
              return false;
            }

            this.connectBtn.set('disabled', false);

            this.widgetConfig.wmxUrl = this.wmxUrl.get('value');
            this.widgetConfig.userName = this.wmxUsername.get('value');
           
            selectedItem = this.WMXQueriesTree.selectedQuery;
            if (selectedItem == undefined || selectedItem.type != 'query') return false;
             this.widgetConfig.queryId = selectedItem.id;  
                        
            selectedItem = this.getSelectSelectedItem(this.valueField);
            if (selectedItem == undefined || !this.isValidSelectValue(this.valueField.get("value"))) return false;
            this.widgetConfig.valueField = selectedItem;                
            
            selectedItem = this.getSelectSelectedItem(this.groupByField);
            if (selectedItem == undefined || !this.isValidSelectValue(this.groupByField.get("value"))) return false;
            this.widgetConfig.groupByField = selectedItem;

            selectedItem = this.getSelectSelectedItem(this.vGroupDateBy);
            if (selectedItem == undefined || !this.isValidSelectValue(this.vGroupDateBy.get("value"))) return false;
            this.widgetConfig.vGroupBy = selectedItem.value;

            selectedItem = this.getSelectSelectedItem(this.gGroupDateBy);
            if (selectedItem == undefined || !this.isValidSelectValue(this.gGroupDateBy.get("value"))) return false;
            this.widgetConfig.idGroupBy = selectedItem.value;
          
             selectedItem  = this.getSelectSelectedItem(this.calculationMethod);
            if (selectedItem == undefined || !this.isValidSelectValue(this.calculationMethod.get("value"))) return false;
            this.widgetConfig.method = selectedItem.value;
            return true;
          },
          

          unValidateConfig: function() {           
            this.readyToPersistConfig(false);
          },
                
          validateConfig: function () {           
            this.readyToPersistConfig(this.captureWidgetConfig());                 
          },

          onWMXQueryDropDownChanged: function(data){
            if (data != undefined && data.type == 'query'){              
              this.fillFieldNames(data.id);
              return;
             }  
             this.unValidateConfig();
          },

          onWMXQueryDropDownErrored: function(error){
            this.setConnectionStatus(false, error);
            this.unValidateConfig();
          },
          
          onWMXQueryDropDownLoaded: function(){
            if (this.widgetConfig.queryId != undefined) {                
                this.fillFieldNames(this.widgetConfig.queryId);
                this.WMXQueriesTree.setSelectedQuery(this.widgetConfig.queryId);                
              }
            this.setSelectStore(this.gGroupDateBy,this.groupDateByStoreData,"value","label",this.widgetConfig.idGroupBy);
            this.setSelectStore(this.vGroupDateBy,this.groupDateByStoreData,"value","label",this.widgetConfig.vGroupBy);
            this.setSelectStore(this.calculationMethod,this.calculationMethodStoreData,"value","label",this.widgetConfig.method);
            this.setConnectionStatus(true);  
          },

          onWMXUrlChange: function(){            
            this.validateConfig()
          },

          onWMXUsernameChange: function(){            
            this.validateConfig()
          },

          onValueFieldChange: function(){
            this.checkgroupDateBystatus();            
            this.validateConfig();
            this.previewChart();
          },

          onGroupByFieldChange: function(){ 
            this.checkgroupDateBystatus();     
            this.validateConfig();
          },

          onCalculationMethodChange: function(){
            this.checkValueFieldStatus();
            this.validateConfig(); 
          },

          onVgroupDateByChange: function(){
            this.validateConfig();
            this.previewChart();
          },

          onGgroupDateByChange: function(){
            this.validateConfig(); 
          },

          onShowHorizontalGridLinesCBClick: function(e){
            this.widgetConfig.chartConfig.showHorizontalGridLines = e.currentTarget.checked;
            this.previewChart();
            this.validateConfig(); 
          },
          onShowHorizontalAxisClick: function(e){
            this.widgetConfig.chartConfig.show_horizontal_axis = e.currentTarget.checked;
            this.previewChart();
            this.validateConfig(); 
          },
          onLabelOrientationChange: function(e){
            this.widgetConfig.chartConfig.horizontal_ticks_orientation = this.labelOrientation.getValue();
            this.previewChart();
            this.validateConfig(); 
          },

          onShowVerticalAxisCBClick: function(e){
            this.widgetConfig.chartConfig.show_vertical_axis = e.currentTarget.checked;
            this.previewChart();
            this.validateConfig();
          },

          onDatasourceIdChange: function(){
            this.validateConfig();  
          },
          
          onChangeWMXConnection: function(event){
            this.validateConfig();
            this.setQueryTabStatus(false);
            this.setApperanceTabStatus(false);
            this.widgetConfig.connectionTested = false;
            this.initQueryTab();             
          },
         
          previewChart: function(){                        
            var vfield = this.widgetConfig.groupByField;
            if (vfield != undefined){
              if (vfield.type == WMXEnum.DATE_DATATYPE) {
                this.chartPreview.dateInterval = this.widgetConfig.idGroupBy;
                this.chartPreview.dataType = 'date';
              } else{
                this.chartPreview.dataType = 'number';
              }
            }
            this.chartPreview.margin = this.margin;
            this.chartPreview.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
            this.chartPreview.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
            this.chartPreview.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
            this.chartPreview.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
            this.chartPreview.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;
            this.chartPreview.endColor = this.widgetConfig.chartConfig.to_color;
            this.chartPreview.startColor = this.widgetConfig.chartConfig.from_color;
            this.chartPreview.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
            this.chartPreview.showSampleData = true;
            this.chartPreview.showChart();     
          },

          fillFieldNames: function(queryId) {            
            this.resetSelectStore(this.valueField);
            this.resetSelectStore(this.groupByField);
            var self = lang.hitch(this);            
            var request = new WMXRequest({url:this.widgetConfig.wmxUrl, proxyURL: PDInit.WmxProxy });
            request.runQuery(queryId,
                this.widgetConfig.userName,
                function(data){ 
                  var dataFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type == WMXEnum.SHORT_DATATYPE || 
                          field.type == WMXEnum.LONG_DATATYPE ||
                          field.type == WMXEnum.DATE_DATATYPE ||
                          field.type == WMXEnum.DOUBLE_DATATYPE ||
                          field.type == WMXEnum.TEXT_DATATYPE) {
                        dataFields.push(field);
                      }
                  }); 
                                                           
                  self.setSelectStore(self.valueField, dataFields,"name","alias",(self.widgetConfig.valueField != undefined)?self.widgetConfig.valueField.name: "");                   
                  dataFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type !=  WMXEnum.OBJECTID_DATATYPE && 
                          field.type != WMXEnum.TEXT_DATATYPE) {
                         dataFields.push(field);
                      }                      
                  });  
                  self.setSelectStore(self.groupByField,dataFields,"name","alias",(self.widgetConfig.groupByField != undefined)? self.widgetConfig.groupByField.name: ""); 
                   ObjectIDFields = [];
                  var firstItem = {name: self.defaultSelectValuesStore[0].value, alias: self.defaultSelectValuesStore[0].label+ 'None'};
                  ObjectIDFields.push(firstItem);
                  data.fields.forEach(function(field) {
                      if (field.type ==  WMXEnum.OBJECTID_DATATYPE) {
                         ObjectIDFields.push(field);
                      }
                  });
                  self.setConnectionStatus(true);
                },function(error){
                  self.widgetConfig.connectionTested = false;
                  console.log(error.message);
                  self.setConnectionStatus(false, error.message); 
             });        
          }
          
    	  });
});