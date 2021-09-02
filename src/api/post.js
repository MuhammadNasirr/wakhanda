import { axiosInstance } from './requestBuilder'

export const getPost = (token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/posts`, { headers });
}

export const getsinglePost = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.get(`api/post/${id}`, { headers });
}

export const createPost = (body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.post(`api/posts`, body, { headers });
}

export const updatePost = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/post/${id}`, body, { headers });
}

export const deletePost = (id, body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.delete(`api/post/${id}`, { headers }, body);
}

export const likePost = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/post/${id}/like`, {}, { headers });
}

export const unlikePost = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/post/${id}/unlike`, {}, { headers });
}

export const commentPost = (body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.post(`api/comment`, body, { headers });
}

export const likeComment = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/comment/${id}/like`, {}, { headers });
}

export const unlikeComment = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/comment/${id}/unlike`, {}, { headers });
}

export const replyComment = (body, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.post(`api/comment/reply`, body, { headers });
}


export const likeReply = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/comment/reply/${id}/like`, {}, { headers });
}

export const unlikeReply = (id, token) => {
    const headers = {
        'Content-Type': 'application/json',
        "Authorization": token
    }
    return axiosInstance.patch(`api/comment/reply/${id}/unlike`, {}, { headers });
}
