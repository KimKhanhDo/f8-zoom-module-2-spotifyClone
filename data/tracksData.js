import { httpRequest } from '../utils/index.js';

export async function getAllTrendingTracks() {
    return await httpRequest.get('tracks/trending');
}

export async function getTrackById(id) {
    return await httpRequest.get(`tracks/${id}`);
}
