import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('token');
        const token = 'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjowLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDAxNSwiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTIxNzQ4NjI0MTE5fQ.pMb2i2AQ2rTQWMcLejkvtU43XHQUgm47lLBu-oG6BVzp4-7UDcGNn_s1id8mfF1zq-lqaIwYHY4vlYUyVF8OQA';
        // console.log(`Token: ${token}`); // Debugging line to check token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    router.push('/');
                    break;
                case 403:
                    break;
                case 500:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
