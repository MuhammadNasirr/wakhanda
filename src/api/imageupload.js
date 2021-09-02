export const uploadImage = (body) => {
    const headers = {
        "content-type": 'application/json'
    }
    return fetch(`https://api.cloudinary.com/v1_1/zaafir-solutions/upload`, { // give something like https://xx.yy.zz/upload/whatever
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    }
    )
}

