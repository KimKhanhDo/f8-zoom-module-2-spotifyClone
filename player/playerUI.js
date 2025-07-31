import * as playerData from './playerData.js';
import { helpers } from '../utils/index.js';

export function renderTrackList(tracks) {
    const playlist = document.querySelector('.track-list');
    const currentIndex = playerData.getCurrentIndex();

    const trackItems = tracks
        .map((track, index) => {
            const isPlaying = index === currentIndex;

            // Escape cho tất cả trường string
            const title = helpers.escapeHTML(track.title);
            const albumCover = helpers.escapeHTML(
                track.album_cover_image_url ||
                    'https://placehold.co/40x40?text=IMG'
            );
            const playCount = track.play_count;
            const duration = track.duration;

            return `
         <div class="track-item ${isPlaying ? 'playing' : ''}">
            <div class="track-number">${
                isPlaying
                    ? '<i class="fas fa-volume-up playing-icon"></i>'
                    : index + 1
            }</div>
            <div class="track-image">
                <img
                    src=${albumCover}
                    alt=${title}
                />
            </div>
            <div class="track-info">
                <div class="track-name ${isPlaying ? 'playing-text' : ''}">
                    ${title}
                </div>
            </div>
            <div class="track-plays">${playCount}</div>
            <div class="track-duration">${duration}</div>
            <button class="track-menu-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        
        `;
        })
        .join('');

    playlist.innerHTML = trackItems;
}

export async function renderHeroSection(track) {
    const heroImage = document.querySelector('.hero-image');
    const verifiedBadge = document.querySelector('.verified-badge');
    const artistName = document.querySelector('.artist-name');
    const monthlyListeners = document.querySelector('.monthly-listeners');

    const artistInfo = await playerData.getArtistById(track.artist_id);
    const isArtistVerified = artistInfo?.is_verified;

    isArtistVerified
        ? (verifiedBadge.style.display = 'flex')
        : (verifiedBadge.style.display = 'none');

    heroImage.src = helpers.escapeHTML(track.album_cover_image_url);
    artistName.textContent = helpers.escapeHTML(track.artist_name);
    monthlyListeners.textContent = track.play_count;
}

export function renderMiniPlayer(track) {
    const playerImage = document.querySelector('.player-image');
    const playerTitle = document.querySelector('.player-title');
    const playerArtist = document.querySelector('.player-artist');

    playerImage.src = track.album_cover_image_url
        ? helpers.escapeHTML(track.album_cover_image_url)
        : 'https://placehold.co/40x40?text=IMG';
    playerTitle.textContent = helpers.escapeHTML(track.title);
    playerArtist.textContent = helpers.escapeHTML(track.artist_name);
}

export function updatePlayPauseIcon(isPlaying) {
    const playIcons = document.querySelectorAll('.play-icon');

    if (isPlaying) {
        playIcons.forEach((playIcon) => {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        });
    } else {
        playIcons.forEach((playIcon) => {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        });
    }
}

export function updateProgressUI(audio) {
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const progressHandle = document.querySelector('.progress-handle');
    const currentTime = document.querySelector('.current-time');
    const totalTime = document.querySelector('.total-time');

    if (audio && audio.duration) {
        // Tính phần trăm đã phát
        const percent = audio.currentTime / audio.duration;
        const barWidth = progressBar.offsetWidth;
        const handleWidth = progressHandle.offsetWidth;

        // Vị trí handle từ 0 đến barWidth - handleWidth
        const handlePos = percent * (barWidth - handleWidth);

        // Fill sẽ đến giữa handle
        progressFill.style.width = handlePos + handleWidth / 2 + 'px';
        progressHandle.style.left = handlePos + 'px';

        // Cập nhật thời gian
        currentTime.textContent = helpers.formatTime(audio.currentTime);
        totalTime.textContent = helpers.formatTime(audio.duration);
    } else {
        progressFill.style.width = '0px';
        progressHandle.style.left = '0px';
        currentTime.textContent = helpers.formatTime(0);
        totalTime.textContent = helpers.formatTime(0);
    }
}

export function toggleLoopState(isLoop) {
    const loopBtn = document.querySelector('.loop-btn');
    loopBtn.classList.toggle('active', isLoop);
}

export function toggleRandomState(isRandom) {
    const randomBtn = document.querySelector('.random-btn');
    randomBtn.classList.toggle('active', isRandom);
}
