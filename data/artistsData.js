import { httpRequest } from '../utils/index.js';

export async function getAllArtist() {
    return await httpRequest.get('artists');
}

export async function getArtistById(id) {
    return await httpRequest.get(`artists/${id}`);
}

export async function unfollowArtist(id) {
    return await httpRequest.del(`artists/${id}/follow`);
}

export async function getArtistTracks(id) {
    return await httpRequest.get(`artists/${id}/tracks/popular`);
}

export async function getArtistAlbums(id) {
    return await httpRequest.get(`artists/${id}/albums`);
}

export async function getFollowedArtists() {
    const { artists } = await getAllArtist();
    const artistList = artists || [];

    const results = await Promise.allSettled(
        artistList.map((artist) => getArtistById(artist.id))
    );

    // console.log('Promise all: ', results);

    const followedArtists = [];

    results.forEach((result) => {
        if (result.status !== 'fulfilled') return;

        const artistDetail = result?.value;
        if (artistDetail.is_following) {
            followedArtists.push({ ...artistDetail });
        }
    });

    return followedArtists;
}
