import { axiosInstance } from './requestBuilder'

export const getConversations = (limit, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/conversations?limit=${limit}`, { headers });
}

export const getMessages = (id, token, limit) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/message/${id}?limit=${limit}`, { headers });
}

export const createMessage = (body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.post(`api/message`, body, { headers });
}

