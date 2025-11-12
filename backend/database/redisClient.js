// config/redisClient.js
import { createClient } from 'redis';
/* la siguieente configuracion es para conectarse en local, despues de haber abierto el servidor con redis-server en la terminal
const redis = createClient();

redis.on('error', (err) => console.error('Redis error:', err));

await redis.connect();

export default redis;

*/

//la siguiente configuracion es para conectarse a la base de datos redis de rediscloud

console.log("Conectando a Redis Cloud");
const redis = createClient({
    username: 'default',
    password: '9mzsPiko0MLfIfdp0540pWjtHJ3gmxWo',
    socket: {
        host: 'redis-15876.c74.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 15876
    }
});
redis.on('error', err => console.log('Redis Client Error', err));

await redis.connect();

await redis.set('foo', 'bar');
const result = await redis.get('foo');
//console.log(result)  // >>> bar

export default redis;

