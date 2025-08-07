import { artistsData, playerData, playlistsData } from '../data/index.js';
import { handleTrackSelect } from '../main.js';

import {
    PopularArtistsComponent,
    ArtistHeroComponent,
    PopularTracksComponent,
    BiggestHitsComponent,
    PlayerControllerComponent,
    MiniPlayerInfoComponent,
    SidebarComponent,
} from './components/index.js';

// Biến lưu instance từng component
let playerController = null;
let artistHeroComponent = null;
let miniPlayerComponent = null;
let popularTracksComponent = null;
let sidebarComponent = null;

export function getPlayerControllerInstance(onTrackChange) {
    if (!playerController) {
        const playerContainer = document.getElementById('player');
        playerController = new PlayerControllerComponent({
            container: playerContainer,
            onTrackChange,
        });

        // Gắn event delegation cho tất cả toggle-play-btn
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-play-btn')) {
                playerController.togglePlay();
            }
        });
    } else if (onTrackChange) {
        // Nếu đã có controller, cập nhật lại callback
        playerController.onTrackChange = onTrackChange;
    }

    return playerController;
}

// ========== RENDER OTHER SECTIONS ==========
export function renderSidebarLeftSection() {
    const sidebarContainer = document.querySelector('.sidebar');

    if (!sidebarComponent) {
        sidebarComponent = new SidebarComponent(sidebarContainer);
    }

    sidebarComponent.renderSidebar();
}

export function renderPopularTracksSection(tracks, onTrackSelect) {
    const trackListContainer = document.querySelector('.track-list');
    const playerController = getPlayerControllerInstance();

    if (!popularTracksComponent) {
        popularTracksComponent = new PopularTracksComponent({
            tracks: tracks,
            container: trackListContainer,
            playerController,
            onTrackSelect,
        });
    }
    // Update lại tracks & callback nếu cần
    // render lần đầu để hiển thị playlist, sau đó sẽ render lại mỗi khi đổi bài/callback trong onTrackSelect!
    Object.assign(popularTracksComponent, { tracks, onTrackSelect });
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

// ========== BIGGEST HITS & POPULAR ARTIST ==========

function updateUIWithInfoAndTracks(info, tracks) {
    if (!tracks || tracks.length === 0) {
        // alert('Không có bài hát!');
        playerData.setTracks([]);
        renderArtistHeroSection(info);
        renderPopularTracksSection([], handleTrackSelect);
        renderMiniPlayerSection(null);
        return;
    }

    playerData.setTracks(tracks);
    playerData.setCurrentIndex(0);

    renderArtistHeroSection(info);
    renderPopularTracksSection(tracks, handleTrackSelect);

    const playerController = getPlayerControllerInstance();
    playerController.loadCurrentTrack();
}

export function toggleDetailPanel(forceShow = false) {
    const detailPanel = document.querySelector('.content-bottom');
    const hitsSection = document.querySelector('.hits-section');
    const artistsSection = document.querySelector('.artists-section');

    if (forceShow) {
        detailPanel.classList.add('active');
        hitsSection.classList.add('hidden');
        artistsSection.classList.add('hidden');
    } else {
        detailPanel.classList.remove('active');
        hitsSection.classList.remove('hidden');
        artistsSection.classList.remove('hidden');
    }
}

function getScrollbarWidth() {
    // Tạo 1 div ẩn ra ngoài màn hình để đo scrollbar thật
    const div = document.createElement('div');
    div.style.visibility = 'hidden';
    div.style.overflow = 'scroll';
    div.style.position = 'absolute';
    div.style.top = '-9999px';

    document.body.appendChild(div);
    // Hiệu giữa offsetWidth và clientWidth chính là chiều rộng scrollbar
    const scrollbarWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);
    return scrollbarWidth;
}

// callback truyền vào BiggestHitsComponent
async function handleHitCardClick(playlistId) {
    try {
        if (!playlistId || playlistId === 'undefined') return;
        // const albumInfo = await albumsData.getAlbumById(playlistId);
        // const { tracks } = await albumsData.getAlbumTracks(playlistId);

        const playlistInfo = await playlistsData.getPlaylistById(playlistId);
        // console.log('Playlist Info:', playlistInfo);

        const tracks = await playlistsData.getPlaylistTracks(playlistId);
        // console.log('Playlist Tracks:', tracks);

        toggleDetailPanel(true);
        updateUIWithInfoAndTracks(playlistInfo, tracks);
    } catch (error) {
        console.error('Error in handleHitCardClick:', error);
        toggleDetailPanel(true);
        // Update UI với info rỗng và tracks rỗng
        updateUIWithInfoAndTracks({}, []);
    }
}

export async function renderBiggestHitsSection() {
    const { playlists } = await playlistsData.getAllPlaylists();

    const hitsContainer = document.querySelector('.hits-grid');

    const biggestHitsComponent = new BiggestHitsComponent({
        container: hitsContainer,
        biggestHits: playlists,
        onTrackClick: handleHitCardClick,
    });

    biggestHitsComponent.render();
}

export async function renderPopularArtistsSection() {
    const { artists } = await artistsData.getAllArtist();
    const artistsContainer = document.querySelector('.artists-grid');

    // Tạo instance component và truyền callback
    const popularArtistsComponent = new PopularArtistsComponent({
        container: artistsContainer,
        artists: artists,
        onArtistClick: handleArtistCardClick,
    });

    // 4. Render vào UI
    popularArtistsComponent.render();
}

// callback truyền vào ArtistsComponent
async function handleArtistCardClick(playlistId) {
    try {
        if (!playlistId || playlistId === 'undefined') return;
        const artistInfo = await artistsData.getArtistById(playlistId);

        const { tracks } = await artistsData.getArtistTracks(playlistId);

        toggleDetailPanel(true);
        updateUIWithInfoAndTracks(artistInfo, tracks);
    } catch (error) {
        console.error('Error in handleHitCardClick:', error);
        toggleDetailPanel(true);
        // Update UI với info rỗng và tracks rỗng
        updateUIWithInfoAndTracks({}, []);
    }
}
