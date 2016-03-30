/* global baseApp */

// LAYOUT SERVICE
baseApp.factory('LayoutSrvc', [function () 
{
    var base = {},
        log  = function(m){console.log(m);},
        apiEndpoint = 'layouts/get/all',
        readyState  = false;


    var extend = function (services) {
        base = services;
        log  = base.log;
    };

    /**
     * Create the data object
     * @param {object} layouts
     */
    var init = function (layouts) {
        var createModel = function () {
            log([['layouts', 'i', 'silver'], layouts]);
            var k = Object.keys(layouts), l = k.length, i = 0, layout, data = {};
            for (; i < l; i++) {
                layout               = layouts[k[i]];
                data[layout['name']] = {
                    'xyz': chart['xyz']
                };
            }
            base.model.save('layouts', data);
            readyState = true;
        };

        //createModel();
    };

    // return this factories services
    return {
        'service': {
            'ready' : readyState
        },
        'onready': {
            'api'   : apiEndpoint,
            'init'  : init,
            'extend': extend
        }
    };
}]);
