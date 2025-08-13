import { httpRequest } from '../utils/index.js';

export async function getAllPlaylists() {
    return await httpRequest.get('playlists');
}

export async function getPlaylistById(id) {
    return await httpRequest.get(`playlists/${id}`);
}

export async function getPlaylistTracks(id) {
    return await httpRequest.get(`playlists/${id}/tracks`);
}

export async function getUserPlaylists() {
    return await httpRequest.get('me/playlists');
}

export async function deleteUserPlaylistById(id) {
    return await httpRequest.del(`playlists/${id}`);
}

// export async function getTrendingTracks() {
//     return await httpRequest.get('tracks/trending');
// }
