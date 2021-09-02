import { axiosInstance } from './requestBuilder'

export const loginUser = (body) => {
    const headers = {
        'Content-Type': 'application/json',
    }
    return axiosInstance.post('api/login', body, { headers });
}

export const createUser = (body) => {
    const headers = {
        'Content-Type': 'application/json',
    }
    return axiosInstance.post('api/register', body, { headers });
}

