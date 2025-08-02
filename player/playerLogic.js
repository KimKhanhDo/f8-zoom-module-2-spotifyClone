/**
 * playerLogic.js: "Tôi điều khiển hành vi, render UI, play audio, gọi dữ liệu từ playerData để thao tác."

- Xử lý logic điều khiển, kết nối với UI và Audio: 
setupAudio, togglePlay, loadCurrentTrack, startPlayer, update UI, play/pause nhạc…

- Không tự thay đổi state của tracks, chỉ gọi qua playerData để lấy dữ liệu hoặc cập nhật dữ liệu.
 */

import * as playerData from '../data/playerData.js';
import * as playerUI from './playerUI.js';
import * as playerNavigationUI from './playerNavigationUI.js';
import * as trackListEvent from '../events/trackListEvent.js';
import {
    renderArtistHeroSection,
    renderMiniPlayerSection,
    renderPopularTracksSection,
} from '../ui/sectionRenderers.js';

let audio = null;
let isLoop = false;
let isRandom = false;
const PREV_RESTART_THRESHOLD = 2; // Nếu bấm "Previous" khi bài hát đã phát quá số giây này, player sẽ tua về đầu bài thay vì chuyển bài trước.

export function startPlayer() {
    const tracks = playerData.getAllTracks();
    renderPopularTracksSection(tracks, (trackIndex) => {
        // Render playlist và gắn callback khi chọn bài
        playerData.setCurrentIndex(trackIndex); // Cập nhật currentIndex trong data
        startPlayer(); // Gọi lại startPlayer để load lại UI & play track mới
    });
    // renderAndSetupPlaylist(tracks);
    playerNavigationUI.updateProgressUI(null);
    loadCurrentTrack();
}

// function renderAndSetupPlaylist(tracks) {
//     playerUI.renderPopularTracks(tracks);
//     trackListEvent.setupTrackListEvent();
// }

function loadCurrentTrack() {
    const currentTrack = playerData.getCurrentTrack();

    if (!currentTrack || !currentTrack.audio_url) {
        console.error('File audio is not valid');
        return;
    }

    // playerUI.renderMiniPlayerInfo(currentTrack);

    renderArtistHeroSection(currentTrack);
    renderMiniPlayerSection(currentTrack);
    setupAudio(currentTrack.audio_url);
}

function bindAudioEvents(audio) {
    // Gắn event xử lý icon play/pause
    audio.onplay = () => {
        playerNavigationUI.updatePlayPauseIcon(true);
    };

    audio.onpause = () => {
        playerNavigationUI.updatePlayPauseIcon(false);
    };

    // Cập nhật progress mỗi khi currentTime thay đổi
    audio.ontimeupdate = () => {
        playerNavigationUI.updateProgressUI(audio);
    };

    audio.onended = () => {
        handleNextTrack();
    };
}

function setupAudio(url) {
    // Nếu đang có audio cũ thì pause trước khi tạo audio mới!
    if (audio) audio.pause();

    audio = new Audio(url);
    audio.loop = isLoop;

    // LUÔN auto play khi next/prev hoặc load bài mới
    audio.oncanplay = () => {
        // audio.play();
    };

    bindAudioEvents(audio);
}

export function getAudio() {
    return audio;
}

export function togglePlay() {
    if (!audio) return; // Chưa có audio thì bỏ qua

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function navigateTrack(action) {
    if (isRandom) {
        playerData.getRandomTrack();
    } else {
        switch (action) {
            case 'next':
                playerData.getNextTrack();
                break;

            case 'previous':
                // Nếu bài hiện tại phát > 2 giây thì reset về đầu, KHÔNG chuyển bài
                if (audio && audio.currentTime > PREV_RESTART_THRESHOLD) {
                    audio.currentTime = 0;
                    audio.play();
                    return;
                }

                // Nếu chưa vượt PREV_RESET_TIME thì chuyển sang bài trước như bình thường
                playerData.getPrevTrack();
                break;

            default:
                console.warn('Invalid action:', action);
        }
    }

    loadCurrentTrack();
    renderAndSetupPlaylist(playerData.getAllTracks());
}

export function handleNextTrack() {
    navigateTrack('next');
}

export function handlePreviousTrack() {
    navigateTrack('previous');
}

export function handleLoopState() {
    isLoop = !isLoop;
    audio.loop = isLoop;
    playerNavigationUI.toggleLoopState(isLoop);
    console.log(isLoop);
}

export function handleRandomState() {
    isRandom = !isRandom;
    playerNavigationUI.toggleRandomState(isRandom);
}

// Need to check again
export function handleSeekTrack(e, progressBar) {
    if (!audio || !audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percent = x / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    audio.currentTime = percent * audio.duration;
    playerNavigationUI.updateProgressUI(audio);
}

export function setVolume(percent) {
    // Thuộc tính audio.volume chỉ nhận giá trị từ 0 đến 1
    if (audio) {
        audio.volume = Math.max(0, Math.min(percent / 100, 1));
    }
}
