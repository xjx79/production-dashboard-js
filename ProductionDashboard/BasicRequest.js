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
		"esri/config",
		"esri/request"
],function(declare,esriConfig,esriRequest)
{
	return declare("esri.productiondashboard.BasicRequest", [],  {

		url: null,
        token: null,
        proxyURL: null,
        disableClientCaching: true,

        constructor: function(args) {
            this.url = args.url;
            this.token = args.token;
            this.proxyURL = args.proxyURL;
            this.disableClientCaching = args.disableClientCaching;
        },
        
        sendRequest: function(inputParams, appendURL, successCallBack, errorCallBack) {
            //var requestUrl = (this.proxyURL) ? this.proxyURL + "?" + this.url : this.url;
            var useProxy = (this.proxyURL && (this.proxURL != ""))

            esriConfig.defaults.io.proxyUrl = null
            if (useProxy) {
                esriConfig.defaults.io.proxyUrl = this.proxyURL
            }

            var requestUrl = this.url
            var token = this.getTokenParam()
            if (token){
                requestUrl = requestUrl.replace('token='+token, '')
                if (requestUrl.lastIndexOf('?') == requestUrl.length-1)
                    requestUrl = requestUrl.replace('?', '')
                this.token = token
            }
            requestUrl += appendURL;
            inputParams.f = "json";
            if (this.token) {
                inputParams.token = this.token;
            }
            if (this.disableClientCaching) {
               inputParams._ts = new Date().getTime();
            }
            var request = esriRequest({
                url: requestUrl,                
                content: inputParams,
                handleAs: "json",
                callbackParamName: "callback"
            }, { useProxy: (this.proxyURL && (this.proxURL != "")) });
            request.then(successCallBack, errorCallBack);
        },


        getTokenParam: function() {
            var params = {};
            var search =  this.url.slice( this.url.indexOf( '?' ) + 1 );
            var definitions = search.split( '&' );

            definitions.forEach( function( val, key ) {
                var parts = val.split( '=', 2 );
                params[ parts[ 0 ] ] = parts[ 1 ];
            } );
           return ( "token" && "token" in params ) ? params[ "token" ] : undefined;
        },

        formatDomainUsername: function(username) {
            if (username && username.length > 0)
            {
                // replace all occurences of backslash with "*" in the string
                username = username.replace(/\\/g, '*');
            }
            return username;
        }
	
	});
});