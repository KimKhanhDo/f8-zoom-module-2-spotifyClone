import { httpRequest } from '../utils/index.js';

export async function getAllArtist() {
    return await httpRequest.get('artists');
}

export async function getArtistById(id) {
    return await httpRequest.get(`artists/${id}`);
}
