import axios from 'axios';
//"exp://5c-btb.rmontelo.mobile.exp.direct:3333"
const api = axios.create({
    baseURL: 'http://192.168.0.26:3333',
    headers: {
        'Accept':'application/json',
        'Content-Type':'application/json'
    }
})

export default api;