/**
 * uiSrvc - reusable application service library
 *
 * QUERY STRING VALUES:
 * Easily retrieve url parameters from the query string.
 * @example var id = ui.qs['id'];
 *
 *
 * LOGGING SERVICE:
 * Extends the AngularJS $log functionality by adding support for colors, timestamps and arrays
 *      Features:
 *          1. Include a timestamp on a string message by adding [ts] to the string.
 *          2. Create multiple log entries in a single call by passing the msg param as an array
 *          3. The type param refers to the type of log message:
 *              d: Debug
 *              i: Information
 *              w: Warning
 *              e: Error
 *          4. The style param can be any of the following:
 *              1. Any color specified in the switch statement
 *              2. A hex color with or without the # symbol. This will be used as the
 *                  background-color. The default font-color is white.
 *              3. CSS - Any valid css can be used to stylize the log entry.
 *                  The tags {baseCss} and {baseClr} will be replaced by the variable values.
 *                      baseCss = 'font-weight: bold; padding: 3px;'
 *                      baseClr = 'color: #fff;'
 *      Examples:
 *          Same as calling console.log()     : log('foo: '+foo);
 *          Debug message                     : log('foo: '+foo, 'd');
 *          Warning with an orange background : log('foo: '+foo, 'w', 'orange');
 *          Decorative: log('foo: '+foo, 'i', '{baseCss} background-color: gold; color: #444;');
 *          Array containing [Informational with green background] and [an object]:
 *              log([['data.results','i','green'], data.results]);
 *
 *
 * CONFIRM DIALOG:
 * A generic confirm dialog that uses the ui-bootstrap modal.
 *
 *
 * STATUS:
 * A feature rich library for displaying real-time data from multi-part $http calls.  Features include
 * simple form validation, simple and complex error handling, built in log viewer with an advanced system
 * for defining each log, two animations, excellent debug tools and more.
 *
 * The concept behind Status is that better UI/UX design is achieved when large server side functions
 * are split into several smaller functions.  Each smaller function returns an array that contains data
 * such as the number of records selected or changed, an object containing all of the records it pulled,
 * the sql statement that was generated by the function or anything else that could be useful.
 *
 * A spinning hourglass lets the user know the current progress, then when the api returns, and it's
 * data is saved, the UI is automatically updated with the results.
 *
 * The service isn't difficult to setup and, while it can be a bit more time consuming to implement than
 * a single $http call, the end result is stunning.  It can also be an incredible tool for debugging, both
 * for a developer and for a user.  This system provides 100% accountability of the work being done by the
 * server and provides them with everything they need to discover problems arising in their data.
 *
 * Easy to Setup! Setup consists mostly of copying/pasting 3 code sections and then updating them as necessary
 * to fit your needs.  Those sections are a javascript function, html template and server side functions.
 *
 * Easy to Learn! This libary is utilized in full by those code sections, meaning that you don't have to
 * learn anything about it!  The only direct contact you have is setting up a couple parts of it's config
 * object located in the javascript function.
 *
 * In addition, it supports simple text status animation without the use of the status template.
 *
 *
 * PANELS:
 * A generic panels div can be used any number of times on a page, such as once per module.
 * One way it's useful is to display information such as $http success and error message in a single
 * directive on a page having multiple directives.  Each directive can have it's own panel.
 *      Features:
 *          1. Uses the Bootstrap 3 Alerts component. http://getbootstrap.com/components/#alerts
 *          2. Supports 4 types of panels: success, info, warning, danger
 *          3. Includes 4 methods for controlling a panel:
 *              1. open(id, type, text) - display's a <type> panel with your <text>
 *              2. close(id) - hides the panel
 *              3. append(id, type, text) - Opens the panel if it's not already, otherwise,
 *                  the text will be appended to the end of the current text and the panel
 *                  type will be changed the type variable is set to one of the 4 types.
 *              4. reset() - resets every panel on the page to it's default state. This is
 *                  useful when your page is reloaded using $http.
 *      Usage:
 *          -- VIEW --
 *          1. Add the directive html to your view:
 *              @attrs {string}  idx  - a unique indentifier
 *              @attrs {string=} mrgn - any valid css margin: ie: (top, right, btm, left) or (top/btm, left/right)
 *              <ui-panel idx="presacct"></ui-panel>
 *              <ui-panel idx="compliance" mrgn="0 15px"></ui-panel>
 *          -- CONTROLLER --
 *          2. Create a local variable set to the same value as the idx attribute. Give the
 *              variable any name you want:  var uiPanelIdx = 'user_address';
 *          3. Add the code as necessary to control it:
 *              Open: ui.panel.open(uiPanelIdx, 'success', '<span class="strong">SUCCESS!</span> Address Saved');
 *                    ui.panel.open(uiPanelIdx, 'danger', 'Server error: '+data.message);
 *                    ui.panel.open(uiPanelIdx, 'warning', 'Address 1 cannot be blank');
 *              Append: ui.panel.append(uiPanelIdx, null, 'Address Geolocation completed successfully');
 *                      ui.panel.append(uiPanelIdx, 'danger', '<span class="strong">ERROR:</span> Geolocation Failed');
 *              Close: ui.panel.close(uiPanelIdx);
 *              Reset: ui.panel.reset();
 *
 *      Example Implementation: Add the close method to the top of any function that makes a remote api call.
 *          Then add the open method to both the $http success and error handlers.  If another call is made
 *          after the api returns, use the append method to update the panel as necessary.
 */
siteApp.factory('uiSrvc',
['$rootScope', '$log', '$filter', 'uiConfirm',
function ($rootScope, $log, $filter, uiConfirm) {

    // get url parameter: var url_user_id = ui.qs['user_id']
    var qs = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    // Console Logging - enhances the angularjs $log functionality
    var log = function (msg, type, style) {

        // allows multiple logs to be passed in using an array
        if (Array.isArray(msg)) {
            for (var i = 0, l = msg.length; i < l; i++) {
                if (Array.isArray(msg[i])) {
                    switch (msg[i].length) {
                        case 3: log(msg[i][0], msg[i][1], msg[i][2]); break;
                        case 2: log(msg[i][0], msg[i][1]);            break;
                        case 1: log(msg[i][0]);                       break; // shouldn't be called this way
                      //default: log([['log: invalid msg array. expected: [msg, (opt)type, (opt)style]','e'], msg[i]]);
                    }
                }
                else log(msg[i]);
            }
            return true;
        }

        // replace [ts] in msg with a timestamp
        if (typeof msg === 'string' && msg.indexOf('[ts]') !== -1) {
            msg = msg.replace(/(\[ts])(\s)?/, $filter('date')(new Date(), 'HH:mm:ss:sss') + ' - ');
        }

        // type of log to output
        var method;
        switch (type) {
            case 'd': method = 'debug'; break;
            case 'e': method = 'error'; break;
            case 'i': method = 'info';  break;
            case 'w': method = 'warn';  break;
            default : method = 'log';
        }

        // if type resulted in default method, it's likely related to color/style
        if (style !== undefined) {
            var css, baseCss = 'font-weight: bold; padding: 3px;', baseClr = 'color: #fff;';
            switch (style) {
                case 'black'    : css = baseCss + ' background-color: #111111; ' + baseClr;        break;
                case 'blue'     : css = baseCss + ' background-color: #0000ff; ' + baseClr;        break;
                case 'green'    : css = baseCss + ' background-color: #008000; ' + baseClr;        break;
                case 'grey'     : css = baseCss + ' background-color: #808080; ' + baseClr;        break;
                case 'maroon'   : css = baseCss + ' background-color: #800000; ' + baseClr;        break;
                case 'pink'     : css = baseCss + ' background-color: #ffc0cb; ' + baseClr;        break;
                case 'purple'   : css = baseCss + ' background-color: #800080; ' + baseClr;        break;
                case 'orange'   : css = baseCss + ' background-color: #ffa500; ' + baseClr;        break;
                case 'red'      : css = baseCss + ' background-color: #ff0000; ' + baseClr;        break;
                case 'silver'   : css = baseCss + ' background-color: #e5e5e5; color: #333';       break;
                case 'broadcast': css = 'background-color: #eedc82; color: #004600; padding:3px;'; break;
                default:
                    var len = style.length;
                    if (len === 6 || len === 7) {
                        var bgclr = len === 6 ? '#' + style : style;
                        css = baseCss + ' background-color: ' + bgclr + '; ' + baseClr;
                    }
                    else if (len > 7) css = style.replace('{baseCss}',baseCss).replace('{baseClr}',baseClr);
                break;
            }
        }

        if (css === undefined) $log[method](msg);
        else {
            var minWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                msgLen   = msg.length,
                padding  = '';
            for (; msgLen < minWidth; msgLen++) padding += ' ';
            msg = '%c' + msg + padding;

            $log[method](msg, css);
        }
    };

    // Confirm Dialog - a generic confirm dialog using the ui-bootstrap modal
    var confirm = function (options, defaults) {
        if (defaults === undefined) defaults = {};
        uiConfirm.showModal(defaults, options).then(
          function () {
              options.action(true);
          },
          function () {
              if (!!options.sendCxl === true) options.action(false);
          }
        );
    };

    // Status UI library - promotes small-chunk api calls and enables verbose client/server communication.
    var status = {
        $scope       : undefined,
        init         : function ($scope, config) {
            var BASECFG = {
                dbug : false,
                ani  : undefined,
                opts : {},
                stage: false,
                log  : false,
                data : {}
            };
            var STAGE   = {
                HTML  : {
                    hidden  : true,
                    label   : '',
                    template: ''
                },
                GLYPHS: {
                    1: {glyph: 'glyphicon-hourglass spin'},
                    2: {glyph: 'glyphicon-minus-sign'},
                    3: {glyph: 'glyphicon-minus-sign'},
                    4: {glyph: 'glyphicon-minus-sign'},
                    5: {glyph: 'glyphicon-minus-sign'},
                    6: {glyph: 'glyphicon-minus-sign'}
                }
            };
            var LOG     = {
                $modal: undefined,
                ctrl  : undefined,
                open  : function (opts) { status.openLog(opts); }
            };

            // process the config if supplied
            if (!!config && typeof config === 'object') {
                // setup the stage if it's being used
                if (!!config.stage) {
                    config.stage = STAGE.GLYPHS;
                    if (!!config.html) config.html = angular.merge(STAGE.HTML, config.html);
                    else config.html = STAGE.HTML;
                }

                // check the log viewer vars if set
                if (typeof config.log !== 'undefined') {
                    /**
                     * This is a quick and very dirty way of implementing a reusable modal log viewer.  It was built while
                     * working on productController.js.  In that script the $modal dependency is inject into the
                     * searchProducts controller and there is an existing, generic modal controller: ModalInstanceCtrl.
                     */
                    var logerr = false;
                    if (typeof config.log.$modal !== 'object' || config.log.$modal === null) logerr = 'The log.$modal param is invalid';
                    else if (typeof config.log.ctrl !== 'function') logerr = 'The log.ctrl param is invalid';

                    if (logerr !== false) {
                        config.log = null;
                        log(logerr, 'e');
                        alert(logerr);
                    }
                    else config.log = angular.merge(LOG, config.log);
                }

                // merge the custom config into the BASECFG
                $scope.statui = angular.merge(BASECFG, config);
            }
            else $scope.statui = BASECFG;

            status.$scope = $scope;
        },
        validateOpts : function (options) {
            // validate that we have received options
            if (!!options === false) return status.handleError('Empty options parameter.');

            // validate the options
            var errs = [], k = Object.keys(options), l = k.length, i = 0;
            for (; i < l; i++) {
                var v = options[k[i]];
                if (v === '') errs.push("'" + k[i] + "'");
            }
            if (errs.length > 0) return status.handleError('Invalid Option' + (errs.length > 1 ? 's' : '') + ': ' + errs.join(' & '));

            return true;
        },
        updateStatus : function (type, message, stage) {
            var prefix = '';
            switch (type) {
                case 'danger' : prefix = 'ERROR: ';   break;
                case 'success': prefix = 'SUCCESS: '; break;
                case 'warning': prefix = 'WARNING: '; break;
            }

            status.$scope.ajaxResultMessage = prefix + message;
            status.$scope.ajaxResultType    = 'text-' + type;

            if (type === 'info') {
                if (status.$scope.statui.stage !== false && stage !== undefined)
                    status.$scope.statui.stage[stage].glyph = 'glyphicon-hourglass spin';

                status.aniStart();
            }
        },
        handleError  : function (errmsg, meta) {
            var message, msgtype = typeof errmsg,
                response, callback;

            if (msgtype === undefined || msgtype === 'number') {
                if (msgtype === 'number') {
                    status.aniStop();
                    if (status.$scope.statui.stage !== false)
                        status.$scope.statui.stage[errmsg].glyph = 'glyphicon-remove-sign';
                    if (typeof meta === 'function') callback = meta;
                }
                message = 'An unknown server error occured.';
            }
            else if (errmsg === null) {
                response = meta;
                message  = 'Invalid response from server.';
                if (status.$scope.statui.dbug) log([['invalid response', 'e', 'red'], response]);
            }
            else message = errmsg;

            status.updateStatus('danger', message);
            return typeof callback === 'function' ? status.error(null, callback) : false;
        },
        logResponse  : function (response, stage) {
            if (!status.$scope.statui.dbug) return;
            var color = response.result.type === 'success' ? 'green' : 'red',
                label = stage === undefined ? 'response' : 'stage ' + stage + ' response';
            log([[label, 'i', color], response]);
        },
        checkResponse: function (response, stage) {
            status.aniStop();

            var retval = false;

            if (!!response.result === false) {
                status.handleError(null, response);
            }
            else if (response.result.type === 'error') {
                if (typeof response.result.data === 'string')
                    status.handleError(response.result.data);
                else if (typeof response.result.data.errmsg === 'string')
                    status.handleError(response.result.data.errmsg);
                else
                    status.handleError(null, response);
            }
            else {
                retval = true;
                status.logResponse(response, stage);
            }

            if (status.$scope.statui.stage !== false && stage !== undefined)
                status.$scope.statui.stage[stage].glyph = retval ? 'glyphicon-ok-sign' : 'glyphicon-remove-sign';

            return retval;
        },
        aniStart     : function ($scope) {
            // this makes it possible to use the animation without init()
            if ($scope !== undefined) {
                if (typeof $scope.statui === 'undefined') $scope.statui = {ani: undefined};
                status.$scope = $scope;
            }
            var parts, dots = '.';
            status.$scope.statui.ani = setInterval(function () {
                parts = /^(.+?)(\.{1,3})$/.exec(status.$scope.ajaxResultMessage);
                if (parts[2].length === 3) dots = '.'; else dots = dots + '.';
                status.$scope.ajaxResultMessage = parts[1] + dots;
                status.$scope.$apply();
            }, 1000);
        },
        aniStop      : function () {
            if (typeofObject(status, '$scope.statui.ani') === 'number') {
                clearInterval(status.$scope.statui.ani);
                status.$scope.statui.ani = undefined;
                // self destruct the $scope stuff if it was created by aniStart
                if (Object.keys(status.$scope.statui).length === 1) {
                    delete status.$scope.statui;
                }
            }
        },
        openLog      : function (opts) {
            if (!!status.$scope.statui.log === false) {
                var logerr = 'undefined error in log viewer';
                if (status.$scope.statui.log === false) logerr = 'The log viewer must be configured during initialization.';
                if (status.$scope.statui.log === null) logerr = 'The log viewer has been disabled due to an invalid configuration.';
                log(logerr, 'e');
                alert(logerr);
                return;
            }

            // variable definitions
            var statui = {}, data, l, i,
                label  = typeofObject(status, '$scope.statui.html.label') === 'string' ? copyObject(status.$scope.statui.html.label).trim() : 'RESULTS';

            // create output array: special processing for the 'only' option
            if (typeofObject(opts, 'only') === 'object') {
                l = opts['only'].length;
                for (i = 0; i < l; i++) {
                    if (typeofObject(status, '$scope.statui.' + opts['only'][i]) === 'undefined')
                        data = {'undefined': opts['only'][i]}
                    else
                        data = copyObject(eval('status.$scope.statui.' + opts['only'][i]));

                    statui = angular.merge(statui, data);
                }
            }
            // create output array: default method
            else {
                statui = copyObject(status.$scope.statui);

                // remove everything added by this class except opts and data
                delete statui.dbug;
                delete statui.ani;
                delete statui.stage;
                delete statui.html;
                delete statui.log;
            }

            // remove everything in the exclusion list
            if (typeofObject(opts, 'excl') === 'object') {
                l = opts['excl'].length;
                for (i = 0; i < l; i++) eval('delete statui.' + opts['excl'][i]);
            }

            // create a parent object for statui
            if (typeofObject(opts, 'name') === 'string' && opts['name'].trim().length > 0) {
                var tmp              = copyObject(statui);
                statui               = {};
                statui[opts['name']] = tmp;

                if (label === '' || label === 'RESULTS') label = opts['name'].replace(/_/, ' ');
                else label += ' "' + opts['name'].replace(/_/, ' ') + '"';
            }

            // create a pretty print json string
            statui = angular.toJson(statui, true);

            // open a modal to show the json string
            status.$scope.statui.log.$modal.open({
                template   : '<div class="modal-header text-uppercase" ng-controller="searchProducts"><h3>{{vars.label}} LOG</h3></div>' +
                '<div class="modal-body"><div class="col-md-12"><pre>{{vars.data}}</pre></div></div>' +
                '<div class="modal-footer"><button type="submit" class="btn btn-default" ng-click="cancel()">Close</button></div>',
                controller : status.$scope.statui.log.ctrl,
                size       : 'lg',
                windowClass: 'statui-log',
                resolve    : {
                    vars: function () {
                        return {'data': statui, 'label': label}
                    }
                }
            });
        },
        error        : function (data, cb) {
            if (!!data && status.$scope.statui.dbug) log([['data @ error', 'w'], status.$scope.statui.data]);
            if (typeof cb === 'function') cb();
            return false;
        }
    };

    // a generic panels div that's easy to use
    var panels = {
        data  : { base: {show: false, type: '', text: ''} },
        types : {
            success: 'alert-success',
            info   : 'alert-info',
            warning: 'alert-warning',
            danger : 'alert-danger'
        },
        // directive functions
        init  : function (id) { this.data[id] = this.data.base; },
        show  : function (id) { return !!this.data[id].show; },
        type  : function (id) { return !!this.data[id].type ? this.data[id].type : ''; },
        text  : function (id) { return !!this.data[id].text ? this.data[id].text : ''; },
        // programmable functions
        reset : function () {
            var k = Object.keys(this.data),
                l = k.length,
                i = 0;
            for (; i < l; i++) {
                if (k[i] === 'base') continue;
                this.init(k[i]);
            }
        },
        close : function (id) { this.init(id); },
        open  : function (id, type, text) {
            if (type === undefined || typeof this.types[type] === 'undefined') type = 'success';
            this.data[id] = {
                show: true,
                type: this.types[type],
                text: text
            }
        },
        append: function (id, type, text) { // type is optional
            if (!!this.data[id].show === false) this.open(id, type, text);
            else {
                if (type !== undefined && typeof this.types[type] !== 'undefined') this.data[id].type = this.types[type];
                this.data[id].text = this.data[id].text + '<br><br>' + text;
            }
        }
    };

    // a simple object with the various functions
    var services = {
        qs     : qs,
        log    : log,
        confirm: confirm,
        status : status,
        panel  : panels
    };

    return services;
}]);

/**
 * Provides the uiSrvc.confirm dialog service.
 */
siteApp.service('uiConfirm',
  ['$uibModal', function ($uibModal) {

      var modalOptions = {
          btnOk : 'OK',
          btnCxl: 'Cancel',
          title : 'Confirmation Required',
          text  : 'Please confirm that you wish to proceed by clicking OK.'
      };

      var modalDefaults = {
          animation  : true,
          backdrop   : 'static',
          keyboard   : true,
          templateUrl: 'components/templates/uiConfirmModal.html'
      };

      this.showModal = function (customModalDefaults, customModalOptions) {
          if (!customModalDefaults) customModalDefaults = {};
          return this.show(customModalDefaults, customModalOptions);
      };

      this.show = function (customModalDefaults, customModalOptions) {
          //Create temp objects to work with since we're in a singleton service
          var tempModalDefaults = {};
          var tempModalOptions  = {};

          //Map angular-ui modal custom defaults to modal defaults defined in service
          angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

          //Map modal.html $scope custom properties to defaults defined in service
          angular.extend(tempModalOptions, modalOptions, customModalOptions);

          if (!tempModalDefaults.controller) {
              tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                  $scope.modalOptions        = tempModalOptions;
                  $scope.modalOptions.ok     = function (/*result*/) { $uibModalInstance.close();   };
                  $scope.modalOptions.cancel = function (/*reason*/) { $uibModalInstance.dismiss(); };
              }
          }

          return $uibModal.open(tempModalDefaults).result;
      };
  }]
);

siteApp.directive('uiPanel',
  ['uiSrvc', function (uiSrvc) {
      return {
          restrict   : 'E',
          scope      : true,
          templateUrl: 'components/templates/uiPanel.html',
          controller : function ($scope, $element, $attrs) {
              var ui = uiSrvc.services;
              ui.panel.init($attrs.idx);
              $scope.canShow = function () { return ui.panel.show($attrs.idx); };
              $scope.getType = function () { return ui.panel.type($attrs.idx); };
              $scope.getText = function () { return ui.panel.text($attrs.idx); };
              $scope.getMrgn = function () { return !!$attrs.mrgn ? {'margin': $attrs.mrgn} : ''; };
          }
      };
  }]
);