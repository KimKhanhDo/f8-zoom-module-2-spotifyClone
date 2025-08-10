class HttpRequest {
    constructor() {
        this.baseUrl = 'https://spotify.f8team.dev/api/';
    }

    // async _send(path, method, payload, options = {}) {
    //     try {
    //         const _config = {
    //             ...options,
    //             method,
    //             headers: {
    //                 ...options.headers,
    //                 'Content-Type': 'application/json',
    //             },
    //         };

    //         if (payload) {
    //             _config.body = JSON.stringify(payload);
    //         }

    //         const accessToken = localStorage.getItem('accessToken');
    //         if (accessToken) {
    //             _config.headers.Authorization = `Bearer ${accessToken}`;
    //         }

    //         const response = await fetch(`${this.baseUrl}${path}`, _config);
    //         const data = await response.json();

    //         if (!response.ok) {
    //             const error = new Error(`HTTP error: ${response.status}`);
    //             error.response = data;
    //             error.status = response.status;
    //             throw error;
    //         }

    //         return data;
    //     } catch (error) {
    //         console.log(error);
    //         throw error;
    //     }
    // }

    /**
     * Mục tiêu của _send() là:
        - Case 1: Nếu FormData → gán nguyên payload vào body, không set Content-Type vì browser sẽ tự thêm.
        - Case 2: Nếu JSON → set Content-Type và stringify.
        - Case 3: Nếu không có payload (GET hoặc DELETE) → Không vào nhánh nào → bỏ qua, không gửi body.
     */
    async _send(path, method, payload, options = {}) {
        try {
            const _config = {
                ...options,
                method,
                headers: {
                    ...options.headers,
                },
            };

            const isForm = payload instanceof FormData;

            if (isForm) {
                _config.body = payload;
            } else if (payload !== undefined && payload !== null) {
                _config.headers['Content-Type'] = 'application/json';
                _config.body = JSON.stringify(payload);
            }

            // Lấy token từ localStorage. Nếu có, thêm vào header Authorization (Bearer ...).
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                _config.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Gửi request
            const res = await fetch(`${this.baseUrl}${path}`, _config);

            // Đọc dưới dạng text trước (tránh lỗi khi không phải JSON).
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : null; // Nếu là JSON → parse thành object.
            } catch {
                data = text; // Nếu không parse được → lỗi → chạy vào catch → giữ nguyên text.
            }

            if (!res.ok) {
                const error = new Error(`HTTP error: ${res.status}`);
                error.response = data;
                error.status = res.status;
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
