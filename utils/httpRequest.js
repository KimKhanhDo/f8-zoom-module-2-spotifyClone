class HttpRequest {
    constructor() {
        this.baseUrl = 'https://spotify.f8team.dev/api/';
    }

    async _send(path, method, payload, options = {}) {
        try {
            const _config = {
                ...options,
                method,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                },
            };

            if (payload) {
                _config.body = JSON.stringify(payload);
            }

            const response = await fetch(`${this.baseUrl}${path}`, _config);

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();

            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async get(path, options) {
        return await this._send(path, 'GET', null, options);
    }

    async post(path, payload, options) {
        return await this._send(path, 'POST', payload, options);
    }

    async put(path, payload, options) {
        return await this._send(path, 'PUT', payload, options);
    }

    async put(path, payload, options) {
        return await this._send(path, 'PATCH', payload, options);
    }

    async del(path, options) {
        return await this._send(path, 'DELETE', null, options);
    }
}

const httpRequest = new HttpRequest();

export default httpRequest;
