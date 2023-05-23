import {io} from 'socket.io-client';
const URL = 'https://socketchat-8g9k.onrender.com';

export const socket = io(URL);