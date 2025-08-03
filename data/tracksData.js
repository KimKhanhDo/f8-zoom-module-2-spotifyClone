import { httpRequest } from '../utils/index.js';

export async function getTrendingTracks() {
    return await httpRequest.get('tracks/trending');
}
