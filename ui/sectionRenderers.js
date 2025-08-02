import { artistData, playerData } from '../data/index.js';
import {
    PlayerControllerComponent,
    ArtistHeroComponent,
    MiniPlayerInfoComponent,
    PopularArtistsComponent,
    PopularTracksComponent,
} from './components/index.js';

// Biến lưu instance từng component
let playerController = null;
let artistHeroComponent = null;
let miniPlayerComponent = null;
let popularTracksComponent = null;

export function getPlayerControllerInstance() {
    if (!playerController) {
        const playerContainer = document.getElementById('player');
        playerController = new PlayerControllerComponent({
            container: playerContainer,
        });

        // Gắn event delegation cho tất cả toggle-play-btn
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-play-btn')) {
                playerController.togglePlay();
            }
        });
    }
    return playerController;
}

// export function renderPopularTracksSection(tracks) {
//     const trackListContainer = document.querySelector('.track-list');
//     const playerController = getPlayerControllerInstance();

//     if (!popularTracksComponent) {
//         popularTracksComponent = new PopularTracksComponent({
//             tracks,
//             container: trackListContainer,
//             playerController,
//             onTrackSelect: (trackIndex) => {
//                 playerData.setCurrentIndex(trackIndex);
//                 playerController.loadCurrentTrack();

//                 // Đổi bài hát, update UI playlist
//                 popularTracksComponent.render(tracks);
//             },
//         });
//     } else {
//         // Update lại tracks & callback nếu cần
//         popularTracksComponent.tracks = tracks;
//         popularTracksComponent.onTrackSelect = (trackIndex) => {
//             playerData.setCurrentIndex(trackIndex);
//             playerController.loadCurrentTrack();
//             popularTracksComponent.render(tracks);
//         };
//     }

//     // Chỉ render lần đầu để hiển thị playlist, sau đó sẽ render lại mỗi khi đổi bài/callback trong onTrackSelect!
//     popularTracksComponent.render(tracks);
// }

export function renderPopularTracksSection(tracks, onTrackSelect) {
    const trackListContainer = document.querySelector('.track-list');
    const playerController = getPlayerControllerInstance();

    if (!popularTracksComponent) {
        popularTracksComponent = new PopularTracksComponent({
            tracks: tracks,
            container: trackListContainer,
            playerController: playerController,
            onTrackSelect: onTrackSelect,
        });
    } else {
        // Update lại tracks & callback nếu cần
        popularTracksComponent.tracks = tracks;
        popularTracksComponent.onTrackSelect = onTrackSelect;
    }

    // Chỉ render lần đầu để hiển thị playlist, sau đó sẽ render lại mỗi khi đổi bài/callback trong onTrackSelect!
    popularTracksComponent.render(tracks);
}

export async function renderArtistHeroSection(track) {
    const heroSection = document.getElementById('artist-hero');

    if (!artistHeroComponent) {
        artistHeroComponent = new ArtistHeroComponent(heroSection);
    }

    await artistHeroComponent.render(track);
}

export function renderMiniPlayerSection(track) {
    const container = document.getElementById('player-left');

    if (!miniPlayerComponent) {
        miniPlayerComponent = new MiniPlayerInfoComponent(container);
    }

    miniPlayerComponent.render(track);
}

export async function renderPopularArtistsSection() {
    const { artists } = await artistData.getAllArtist();
    const artistsContainer = document.querySelector('.artists-grid');

    // Tạo instance component và truyền callback
    const popularArtistsComponent = new PopularArtistsComponent({
        artists,
        onArtistPlay: (artistId) => {
            // Đây là callback khi bấm nút play trên artist-card
            alert('Clicked play for artist: ' + artistId);
            // Bạn có thể redirect, show artist detail, hoặc fetch track v.v ở đây!
        },
    });

    // 4. Render vào UI
    popularArtistsComponent.render(artistsContainer);
}
