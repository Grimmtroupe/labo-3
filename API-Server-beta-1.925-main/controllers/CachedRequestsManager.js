export default class CachedRequestsManager {

    static async startCachedRequestsCleaner() 
    {
        const cacheWhitelist = ['v1', 'v2'];
        const cacheNames = await caches.keys();

        return Promise.all(
            cacheNames.map(async (cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) 
                {
                    console.log(`Suppression de la cache périmée : ${cacheName}`);
                    return caches.delete(cacheName);
                }
            })
        );
    }

    static async add(url, content, ETag= "") 
    {
        const cache = await caches.open('v1');
        const headers = ETag ? { 'ETag': ETag } : {};

        await cache.put(
            new Request(url),
            new Response(content, { headers })
        );
        
        console.log(`Ajouter à la cache: ${url}`);
    }

    static async find(url) 
    {
        const cache = await caches.open('v1');
        const response = await cache.match(url);

        if (response) 
        {
            console.log(`Cache trouvée pour l'URL: ${url}`);
            return response;
        } 
        else 
        {
            console.log(`Aucune cache trouvée pour l'URL: ${url}`);
            return null;
        }
    }

    static async clear(url) 
    {
        const cache = await caches.open('v1');
        const response = await cache.match(url);

        if (response) 
        {
            await cache.delete(url);
            console.log(`Cache effacée pour l'URL: ${url}`);
        } 
        else 
        {
            console.log(`Aucune cache à effacer pour l'URL: ${url}`);
        }
    }

    static async flushExpired() 
    {
        const cacheWhitelist = ['v1', 'v2'];
        const cacheNames = await caches.keys();

        return Promise.all(
            cacheNames.map(async (cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) 
                {
                    console.log(`Effacement de la cache expirée : ${cacheName}`);
                    return caches.delete(cacheName);
                }
            })
        );
    }

    static async get(HttpContext) 
    {
        const url = HttpContext.req.url;
        const cache = await caches.open('v1');
        const response = await cache.match(url);

        if (response) 
        {
            const content = await response.text();
            const headers = HttpContext.response.ETag;
            console.log(`Cache trouvée pour l'URL: ${url}`);
            HttpContext.response.JSON(content, headers, true); 
        } 
        else 
        {
            console.log(`Aucune cache trouvée pour l'URL: ${url}`);
        }
    }
}