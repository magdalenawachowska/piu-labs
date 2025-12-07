class Ajax {
    constructor(options = {}) {
        this.baseURL = options.baseURL ?? '';
        this.headers = options.headers ?? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        this.timeout = options.timeout ?? 0;
    }

    _buildUrl(url) {
        // _ - oznaczenie metody prywatnej- konwencja. nie powinna byc uzywana przez uzytkownika klasy/biblioteki, sluzy tylko w ramach przygotowania/dostosowania url, wewnatrz ajaxa
        if (!this.baseURL) return url; //gdy user nie podal base url, lub url pusty = '', null, undefined
        return this.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    }

    async _fetch(method, url, { headers = {}, timeout, body } = {}) {
        //helper, robi tylko wysylke requestu
        const finalUrl = this._buildUrl(url);

        const controller = new AbortController();
        const signal = controller.signal;

        const effectiveTimeout = timeout ?? this.timeout;
        let timeoutId = null;

        if (effectiveTimeout && effectiveTimeout > 0) {
            timeoutId = setTimeout(() => {
                //settimeout(callback, delay)
                controller.abort(); //przerywanie requesta po czasie
            }, effectiveTimeout); //czas podany jako parametr- po przekroczeniu wykona sie abort --> dziala jako delay
        }

        try {
            const response = await fetch(finalUrl, {
                method,
                headers: {
                    ...this.headers, //globalne naglowki
                    ...headers, //naglowki z pojedynczego wywolania - spread operator - merguje wartosci zmiennych
                },
                body,
                signal,
            });

            return response;
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }

    async _parseResponse(response) {
        const text = await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    _makeError(method, url, response, data) {
        const err = new Error(
            `${method} ${url} failed: ${response.status} ${response.statusText}`
        );
        err.status = response.status;
        err.data = data; //to co zwraca serwer
        err.url = url;
        err.method = method;
        return err;
    }

    async get(url, options = {}) {
        try {
            const response = await this._fetch('GET', url, options);
            const data = await this._parseResponse(response);

            if (!response.ok) {
                throw this._makeError('GET', url, response, data);
            }

            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`GET ${url} timeout`);
            }

            if (typeof err.status !== 'undefined') {
                throw err;
            }

            const wrapped = new Error(`GET ${url} failed: ${err.message}`);
            wrapped.cause = err;
            throw wrapped;
        }
    }

    async delete(url, options = {}) {
        try {
            const response = await this._fetch('DELETE', url, options);
            const data = await this._parseResponse(response);

            if (!response.ok) {
                throw this._makeError('DELETE', url, response, data);
            }

            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`DELETE ${url} timeout`);
            }

            if (typeof err.status !== 'undefined') {
                throw err;
            }

            const wrapped = new Error(`DELETE ${url} failed: ${err.message}`);
            wrapped.cause = err;
            throw wrapped;
        }
    }

    async post(url, data, options = {}) {
        const { headers = {}, ...rest } = options; //rest -inne parametry przekazane przez usera, potem przekazujemy do fetcha

        // przekazujemy obiekt js, biblioteka robi json
        const body =
            data == null
                ? null
                : typeof data === 'string'
                ? data
                : JSON.stringify(data);

        try {
            const response = await this._fetch('POST', url, {
                ...rest,
                headers, //naglowki z options
                body,
            });

            const parsed = await this._parseResponse(response);

            if (!response.ok) {
                throw this._makeError('POST', url, response, parsed);
            }

            return parsed;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`POST ${url} timeout`);
            }

            if (typeof err.status !== 'undefined') {
                throw err;
            }

            const wrapped = new Error(`POST ${url} failed: ${err.message}`);
            wrapped.cause = err;
            throw wrapped;
        }
    }

    async put(url, data, options = {}) {
        const { headers = {}, ...rest } = options;

        const body =
            data == null
                ? null
                : typeof data === 'string'
                ? data
                : JSON.stringify(data);

        try {
            const response = await this._fetch('PUT', url, {
                ...rest,
                headers,
                body,
            });

            const parsed = await this._parseResponse(response);

            if (!response.ok) {
                throw this._makeError('PUT', url, response, parsed);
            }

            return parsed;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`PUT ${url} timeout`);
            }

            if (typeof err.status !== 'undefined') {
                throw err;
            }

            const wrapped = new Error(`PUT ${url} failed: ${err.message}`);
            wrapped.cause = err;
            throw wrapped;
        }
    }
}
