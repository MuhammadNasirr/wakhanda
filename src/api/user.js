import { axiosInstance } from './requestBuilder'

export const getUser = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/user/${id}`, { headers });
}

export const getAllUser = (token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/users`, { headers });
}

export const searchUser = (username, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/search?username=${username}`, { headers });
}

export const updateUser = (body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/user`, body, { headers });
}

export const createFriendRequest = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/users/${id}/createrequest`, body, { headers });
}

export const approveFriendRequest = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/users/${id}/approverequest`, body, { headers });
}

export const removeFriendRequest = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/users/${id}/removerequest`, body, { headers });
}

export const rejectFriendRequest = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/users/${id}/rejectrequest`, body, { headers });
}

