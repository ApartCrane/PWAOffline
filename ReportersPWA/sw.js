const STATIC = 'staticv1';
const INMUTABLE = 'inmutablev1';
const DYNAMIC = 'dynamicv1';

const APP_SHELL = [
    '/',
    '/index.html',
    '/js/app.js',
    '/img/tw.jpg',
    '/css/styles.css',
    '/pages/offline.html' 
];

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener("install", (e) => {
    const staticCache = caches.open(STATIC).then(cache => {
        cache.addAll(APP_SHELL);
    });

    const staticInmutable = caches.open(INMUTABLE).then(cache => {
        cache.addAll(APP_SHELL_INMUTABLE);
    });

    e.waitUntil(Promise.all([staticCache, staticInmutable]));

    console.log("Instalando");
});

self.addEventListener("activate", (e) => {
    console.log("Activado");
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request)
        .then((response) => {
            const responseClone = response.clone();
            caches.open(DYNAMIC).then((cache) => {
                cache.put(e.request, responseClone);
            });
            return response;
        })
        .catch(() => {
            return caches.match('/pages/offline.html'); 
        })
    );
});
//1Cache Only
    //e.respondWith(caches.matche(e.request));

    //2 Cache with network fallbac. Despacha a cache, si no encuentra va a internet
    /*
    const sourse = caches.match(e.request)
    .then(res=>{
        if(res) return res;
        return fetch(e.request).then(resFetch=>{
            caches.open(DYNAMIC).then(cache=>{
                cache.put(e.request,resFetch);
            });
            return resFetch.clone();
        });
    });
    e.respondWith(sourse);
    */

    //3. Network witch cache fallback Despacha a internet, sino lo manda por cache
    /*
    const source = fetch(e.request)
        .then(res => {
            if (!res) throw Error("Not Found");
            caches.open(DYNAMIC).then(cache => {
                cache.put(e.request, res);
            });
            return res.clone();
        }).catch(err => {
            return caches.match(e.request);
        });
        */
    //e.respondWidth(source)
    // if(e.request.url.includes('pikachu.jpg')){
    //     e.respondWith(fetch('img/piplup.png'));
    // }else e.responWith(fetch(e.request));

    //4. Cache with network update
    /*Primero devuevle todo del cache
    Despues actualiza el recurso
    Rendimiento critico. Siempre se queda un paso atras.
    */
    /*
    const sources = caches.open(STATIC).then(cache => {
        fetch(e.request).then(resFetch =>{
            cache.put(e.request, resFetch);
        })
        return caches.match(e.request);
    });
    e.respondwidth(source);
    */

    //5. Cache and network race
    /*
    const source = new Promise((resolve, reject) => {
        let flag = false;
        const failsOnce = () => {
            if (flag) {
                //Si ya fallo una vez aqui poner la logica para controlarlo
                if (/\.(png|jpg)/i.test(e.request.url)) {
                    resolve(caches.match('/img/not-found.png'))
                }
            } else {
                flag = true;
            }
        }
    })
    fetch(e.request).then(resFetch => {
        resFetch.ok ? resolve(resFetch): failsOnce();
    }).catch(failsOnce);
    caches.match(e.request).then(sourceCache => {
        sourceCache. ok ? resolve(sourceCache) : failsOnce();
    })
    .catch(failsOnce);
    e.respondWidth(source);
    */