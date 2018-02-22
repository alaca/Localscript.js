/* localscript.js [c]2017 Ante Laca */
(function(w){ 
    
    'use strict';

    const d = w.document,
        ls = w.localStorage || false,
        self = d.currentScript || d.querySelector('script[data-expire]');

    const get = scripts => {

        let promises = [];

        scripts.forEach(script => {

            let promise = new Promise((resolve, reject) => {

                // inline script
                if ( ! script.url) {
                    return resolve(script.code);
                }

                // cache only external scripts
                let code = ls ? ls.getItem(script.url) : null; 
                // url is not in storage or local storage is not supported
                if (code === null) { 

                    let xhr = new XMLHttpRequest();

                    xhr.open('get', script.url);
                    xhr.onload = function(){

                        // check status
                        if (xhr.status == 200) {
                            // if local storage
                            if (ls) {
                                try {
                                    ls.setItem(script.url, JSON.stringify(xhr.response));  
                                } catch(e) {
                                    ls.clear(); // storage is probably full, flush it
                                }
                            }

                            return resolve(xhr.response);

                        }

                        return reject(new Error(xhr.responseURL + ' ' + xhr.statusText));

                    };

                    // xhr never timeout, so we do it ourselves
                    setTimeout(() => {
                        if (xhr.readyState < 4) {
                            xhr.abort();
                            return reject(new Error(script.url + ' timeout'));
                        }
                    }, 10000);

                    xhr.send();
    
                } else {
                    return resolve(JSON.parse(code));
                }
                    
            });
            
            // add promise
            promises.push(promise);

        });

        // return promises
        return Promise.all(promises);
    };

    // hook up
    d.addEventListener('DOMContentLoaded', function(){

        let scripts = [],
            tags = d.getElementsByTagName('script');

        // check if local storage is supported
        if (ls) {
            const time = Math.floor(new Date().getTime() / 1000),
                expire = ls.getItem('ls-expire'),
                expire_in = self.getAttribute('data-expire') || 3600;  // expire in seconds
            // clear if data is expired
            if (null === expire || time > expire) {
                ls.clear();
                ls.setItem('ls-expire', parseInt(time) + parseInt(expire_in));
            }
        }

        // process all script tags
        for(let i in tags) {
            if (tags[i].type == 'text/localscript') {
                scripts.push({
                    url : tags[i].getAttribute('data-src') || false,
                    code : tags[i].innerHTML || null
                });
            }
        }

        // run
        get(scripts).then(codes => {

            for(let i in codes) {
                try {
                    // execute scripts in global scope
                    (0, eval)(codes[i]); 
                    
                } catch(e) {
                    console.log(e.name, e.message);
                }
            }

        }).catch(error => {
            console.log(error);
        });

    }, false);

})(this);