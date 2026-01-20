import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: any };
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface FileUploadOptions {
  file: File | File[];
  fieldName?: string;
  additionalData?: { [key: string]: any };
  headers?: HttpHeaders | { [header: string]: string | string[] };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Выполняет GET запрос
   * @param endpoint - endpoint относительно baseUrl
   * @param options - опции запроса (headers, params, responseType)
   */
  public get<T = any>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const responseType = options?.responseType || 'json';

    if (responseType === 'json') {
      return this.http.get<T>(url, {
        headers: options?.headers,
        params: options?.params,
      });
    } else if (responseType === 'text') {
      return this.http.get(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'text',
      }) as Observable<T>;
    } else if (responseType === 'blob') {
      return this.http.get(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'blob',
      }) as Observable<T>;
    } else {
      return this.http.get(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'arraybuffer',
      }) as Observable<T>;
    }
  }

  /**
   * Выполняет POST запрос
   * @param endpoint - endpoint относительно baseUrl
   * @param body - тело запроса
   * @param options - опции запроса (headers, params, responseType)
   */
  public post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const responseType = options?.responseType || 'json';

    if (responseType === 'json') {
      return this.http.post<T>(url, body, {
        headers: options?.headers,
        params: options?.params,
      });
    } else if (responseType === 'text') {
      return this.http.post(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'text',
      }) as Observable<T>;
    } else if (responseType === 'blob') {
      return this.http.post(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'blob',
      }) as Observable<T>;
    } else {
      return this.http.post(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'arraybuffer',
      }) as Observable<T>;
    }
  }

  /**
   * Выполняет PUT запрос
   * @param endpoint - endpoint относительно baseUrl
   * @param body - тело запроса
   * @param options - опции запроса (headers, params, responseType)
   */
  public put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const responseType = options?.responseType || 'json';

    if (responseType === 'json') {
      return this.http.put<T>(url, body, {
        headers: options?.headers,
        params: options?.params,
      });
    } else if (responseType === 'text') {
      return this.http.put(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'text',
      }) as Observable<T>;
    } else if (responseType === 'blob') {
      return this.http.put(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'blob',
      }) as Observable<T>;
    } else {
      return this.http.put(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'arraybuffer',
      }) as Observable<T>;
    }
  }

  /**
   * Выполняет PATCH запрос
   * @param endpoint - endpoint относительно baseUrl
   * @param body - тело запроса
   * @param options - опции запроса (headers, params, responseType)
   */
  public patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const responseType = options?.responseType || 'json';

    if (responseType === 'json') {
      return this.http.patch<T>(url, body, {
        headers: options?.headers,
        params: options?.params,
      });
    } else if (responseType === 'text') {
      return this.http.patch(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'text',
      }) as Observable<T>;
    } else if (responseType === 'blob') {
      return this.http.patch(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'blob',
      }) as Observable<T>;
    } else {
      return this.http.patch(url, body, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'arraybuffer',
      }) as Observable<T>;
    }
  }

  /**
   * Выполняет DELETE запрос
   * @param endpoint - endpoint относительно baseUrl
   * @param options - опции запроса (headers, params, responseType)
   */
  public delete<T = any>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const responseType = options?.responseType || 'json';

    if (responseType === 'json') {
      return this.http.delete<T>(url, {
        headers: options?.headers,
        params: options?.params,
      });
    } else if (responseType === 'text') {
      return this.http.delete(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'text',
      }) as Observable<T>;
    } else if (responseType === 'blob') {
      return this.http.delete(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'blob',
      }) as Observable<T>;
    } else {
      return this.http.delete(url, {
        headers: options?.headers,
        params: options?.params,
        responseType: 'arraybuffer',
      }) as Observable<T>;
    }
  }

  /**
   * Загружает файл(ы) на сервер
   * @param endpoint - endpoint относительно baseUrl
   * @param options - опции загрузки файла
   */
  public uploadFile<T = any>(
    endpoint: string,
    options: FileUploadOptions,
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();

    // Добавляем файл(ы)
    if (Array.isArray(options.file)) {
      options.file.forEach((file, index) => {
        const fieldName = options.fieldName || 'files';
        formData.append(`${fieldName}[${index}]`, file, file.name);
      });
    } else {
      const fieldName = options.fieldName || 'file';
      formData.append(fieldName, options.file, options.file.name);
    }

    // Добавляем дополнительные данные
    if (options.additionalData) {
      const additionalData = options.additionalData;
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else if (typeof value === 'object' && !(value instanceof Date)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    // Создаем headers, исключая Content-Type (браузер установит его автоматически с boundary)
    let headers = new HttpHeaders();
    if (options.headers) {
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        const headersObj = options.headers as {
          [header: string]: string | string[];
        };
        Object.keys(headersObj).forEach((key) => {
          const value = headersObj[key];
          if (Array.isArray(value)) {
            value.forEach((v) => (headers = headers.append(key, v)));
          } else {
            headers = headers.set(key, value);
          }
        });
      }
    }

    // Удаляем Content-Type, если он был установлен, чтобы браузер мог установить multipart/form-data с boundary
    if (headers.has('Content-Type')) {
      headers = headers.delete('Content-Type');
    }

    return this.http.post<T>(url, formData, {
      headers,
      params: options.additionalData?.params,
    });
  }

  /**
   * Скачивает файл с сервера
   * @param endpoint - endpoint относительно baseUrl
   * @param options - опции запроса (headers, params)
   */
  public downloadFile(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'responseType'>,
  ): Observable<Blob> {
    return this.get<Blob>(endpoint, {
      ...options,
      responseType: 'blob',
    });
  }

  /**
   * Строит полный URL из endpoint
   * @param endpoint - endpoint относительно baseUrl
   */
  private buildUrl(endpoint: string): string {
    // Убираем начальный слэш из endpoint, если он есть
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    // Убираем конечный слэш из baseUrl, если он есть
    const cleanBaseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }
}
