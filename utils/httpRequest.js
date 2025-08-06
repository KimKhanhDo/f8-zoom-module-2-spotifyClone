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

            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                _config.headers.Authorization = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${this.baseUrl}${path}`, _config);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(`HTTP error: ${response.status}`);
                error.response = data;
                error.status = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            console.log(error);
            throw error;
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

    async patch(path, payload, options) {
        return await this._send(path, 'PATCH', payload, options);
    }

    async del(path, options) {
        return await this._send(path, 'DELETE', null, options);
    }
}

const httpRequest = new HttpRequest();

export default httpRequest;
