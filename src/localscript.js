/* localscript.js [c]2017 Ante Laca */
(function(w){ 
    'use strict';

    var d = w.document,
        ls = w.localStorage,
        self = d.currentScript || d.querySelector('script[data-expire]');

    var get = function(scripts) {

        var promises = [];

        scripts.forEach(function(script){

            var promise = new Promise(function(resolve, reject){

                // cache only external javascript
                if (script.url) {

                    var code = ls ? ls.getItem(script.url) : null; 
                    // url is not in storage or local storage is not supported
                    if (null === code) { 

                        var xhr = new XMLHttpRequest();

                        xhr.open('get', script.url);
                        xhr.onload = function(){
                            // check status
                            if (xhr.status == 200) {
                                // if local storage
                                if (ls) {
                                    try {
                                        ls.setItem(script.url, xhr.response);  
                                    } catch(e) {
                                        // storage is probably full, flush it out
                                        ls.clear();
                                    }
                                }

                                resolve(xhr.response);

                            } else {
                                reject(Error(xhr.statusText));
                            }

                        };

                        xhr.send();

                    } else {
                        resolve(code);
                    }

                } else {
                    resolve(script.code);
                }

            });

            // add promise
            promises.push(promise);

        });

        // return promises
        return Promise.all(promises);

    }

    // hook up
    d.addEventListener('DOMContentLoaded', function(){

        var data = [],
            scripts = d.getElementsByTagName('script');

        // check if local storage is supported
        if (ls) {
            var time = Math.floor(new Date().getTime() / 1000),
                expire = ls.getItem('ls-expire'),
                expire_in = self.getAttribute('data-expire') || 3600;  // expire in seconds
            // clear if data is expired
            if (null === expire || time > expire) {
                ls.clear();
                ls.setItem('ls-expire', parseInt(time) + parseInt(expire_in));
            }
        }

        // process all script tags
        for(var i in scripts) {
            if (scripts[i].type == 'text/localscript') {
                data.push({
                    url : scripts[i].getAttribute('data-src') || null,
                    code : scripts[i].innerHTML || null
                });
            }
        }

        // run
        get(data).then(function(codes){
            for(var i in codes) {
                try {
                    (0, eval)(codes[i]);
                } catch(e) {
                    console.log(e.name, e.message);
                }
            }
        });

    }, false);

})(this);