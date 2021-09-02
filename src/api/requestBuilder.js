import axios from 'axios';

// window.env = window.env || {};
// export const host = 'https://wakandha32.herokuapp.com/';
export const host = 'https://ecommerce-appp.herokuapp.com/';

export const axiosInstance = axios.create({
    baseURL: host
});