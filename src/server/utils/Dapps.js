import * as config from 'config';
import * as https from 'https';
/**
 * Load dapps
 *
 * @returns {promise} resolves to object
 */
function loadDapps() {
    return new Promise((resolve, reject) => {
        const emptyDapps = {};

        if (!config.dapps_url) {
            resolve(emptyDapps);
            return;
        }

        const request = https.get(config.dapps_url, (resp) => {
            console.log('Ressssp', resp);
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                const json = JSON.parse(data);
                console.info('Received dapps payload', json);
                if (json === Object(json)) {
                    resolve(json);
                }
            });
        });

        request.on('error', (e) => {
            console.error('Could not load dapps', e);
            resolve(emptyDapps);
        });
    });
}
/**
 * [async] Get dapps from Gitlab
 *
 * @returns {object} object of dapps
 */
export async function Dapps() {
    const dapps = await loadDapps();
    console.info('Loading dapps', dapps);
    return dapps;
}
