import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


export const Api = axios.create({
    baseURL: "https://localhost:7012/api/",
    // baseURL: "https://4bsjlc42-7012.asse.devtunnels.ms/api/",
    headers: {
        'Content-Type': 'application/json'
    }

})


// Add JWT token automatically
Api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const IMAGE_BASE_URL = "https://localhost:7012/";

