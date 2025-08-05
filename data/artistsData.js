import { httpRequest } from '../utils/index.js';

export async function getAllArtist() {
    return await httpRequest.get('artists');
}

export async function getArtistById(id) {
    return await httpRequest.get(`artists/${id}`);
}

export async function getArtistTracks(id) {
    return await httpRequest.get(`artists/${id}/tracks/popular`);
}

export async function getArtistAlbums(id) {
    return await httpRequest.get(`artists/${id}/albums`);
}
