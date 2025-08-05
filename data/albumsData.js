import { httpRequest } from '../utils/index.js';

export async function getAllAlbums() {
    return await httpRequest.get('albums');
}

export async function getAlbumById(id) {
    return await httpRequest.get(`albums/${id}`);
}

export async function getAlbumTracks(id) {
    return await httpRequest.get(`albums/${id}/tracks`);
}
