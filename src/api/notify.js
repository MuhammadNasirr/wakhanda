import { axiosInstance } from './requestBuilder'


export const craeteNotify = (data, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.post(`api/notify`, data, { headers });
}

