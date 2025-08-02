import * as playerData from '../data/playerData.js';
import * as artistData from '../data/artistData.js';
import { helpers } from '../utils/index.js';

// export function renderPopularTracks(tracks) {
//     const playlist = document.querySelector('.track-list');
//     const currentIndex = playerData.getCurrentIndex();

//     const trackItems = tracks
//         .map((track, index) => {
//             const isPlaying = index === currentIndex;

//             // Escape cho tất cả trường string
//             const id = helpers.escapeHTML(track.id);
//             const title = helpers.escapeHTML(track.title);
//             const albumCover = helpers.escapeHTML(
//                 track.album_cover_image_url ||
//                     'https://placehold.co/40x40?text=IMG'
//             );
//             const playCount = helpers.formatCount(track.play_count);
//             const duration = helpers.formatTime(track.duration);

//             return `
//          <div class="track-item ${isPlaying ? 'playing' : ''}" data-id=${id}>
//             <div class="track-number">${
//                 isPlaying
//                     ? '<i class="fas fa-volume-up playing-icon"></i>'
//                     : index + 1
//             }</div>
//             <div class="track-image">
//                 <img
//                     src=${albumCover}
//                     alt=${title}
//                 />
//             </div>
//             <div class="track-info">
//                 <div class="track-name ${isPlaying ? 'playing-text' : ''}">
//                     ${title}
//                 </div>
//             </div>
//             <div class="track-plays">${playCount}</div>
//             <div class="track-duration">${duration}</div>
//             <button class="track-menu-btn">
//                 <i class="fas fa-ellipsis-h"></i>
//             </button>
//         </div>

//         `;
//         })
//         .join('');

//     playlist.innerHTML = trackItems;
// }

// export async function renderHeroSection(track) {
//     const artistInfo = await artistData.getArtistById(track.artist_id);

//     const heroImage = document.querySelector('.hero-image');
//     const verifiedBadge = document.querySelector('.verified-badge');
//     const artistName = document.querySelector('.artist-name');
//     const monthlyListeners = document.querySelector('.monthly-listeners');
//     const isArtistVerified = artistInfo?.is_verified;

//     isArtistVerified
//         ? (verifiedBadge.style.display = 'flex')
//         : (verifiedBadge.style.display = 'none');

//     heroImage.src = helpers.escapeHTML(track.album_cover_image_url);
//     artistName.textContent = helpers.escapeHTML(track.artist_name);
//     monthlyListeners.textContent = helpers.formatCount(track.play_count);
// }

// export function renderMiniPlayerInfo(track) {
//     const playerImage = document.querySelector('.player-image');
//     const playerTitle = document.querySelector('.player-title');
//     const playerArtist = document.querySelector('.player-artist');

//     playerImage.src = track.album_cover_image_url
//         ? helpers.escapeHTML(track.album_cover_image_url)
//         : 'https://placehold.co/40x40?text=IMG';
//     playerTitle.textContent = helpers.escapeHTML(track.title);
//     playerArtist.textContent = helpers.escapeHTML(track.artist_name);
// }
