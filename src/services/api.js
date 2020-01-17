import axios from 'axios';
//"exp://5c-btb.rmontelo.mobile.exp.direct:3333"
const api = axios.create({
    baseURL: 'http://localhost:3333'
})

export default api;