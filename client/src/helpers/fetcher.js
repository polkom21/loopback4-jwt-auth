const baseAPIUrl = 'http://localhost:3000';

export default function fetcher(method, url, data) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data) {
      requestOptions.body = JSON.stringify(data)
    }

    fetch(baseAPIUrl + url, requestOptions)
      .then(response => {
        if (response.status === 200) {
          response.json()
            .then(resolve)
            .catch(reject)
        } else {
          response.json()
            .then(err => {
              reject(err?.error?.message)
            })
            .catch(err => {
              reject(`${method} ${url} | ${response.status} - ${response.statusText}`)
            })
        }
      })
      .catch(reject)
  })
}
