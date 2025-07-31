/**
 * playerLogic.js: "Tôi điều khiển hành vi, render UI, play audio, gọi dữ liệu từ playerData để thao tác."

- Xử lý logic điều khiển, kết nối với UI và Audio: 
setupAudio, togglePlay, loadCurrentTrack, startPlayer, update UI, play/pause nhạc…

- Không tự thay đổi state của tracks, chỉ gọi qua playerData để lấy dữ liệu hoặc cập nhật dữ liệu.
 */

import * as playerData from './playerData.js';
import * as playerUI from './playerUI.js';

let audio = null;
let isLoop = false;
let isRandom = false;
const PREV_RESTART_THRESHOLD = 2; // Nếu bấm "Previous" khi bài hát đã phát quá số giây này, player sẽ tua về đầu bài thay vì chuyển bài trước.

export function startPlayer() {
    const tracks = playerData.getAllTracks();
    playerUI.renderTrackList(tracks);
    playerUI.updateProgressUI(null);
    loadCurrentTrack();
}

function loadCurrentTrack() {
    const currentTrack = playerData.getCurrentTrack();

    if (!currentTrack || !currentTrack.audio_url) {
        console.error('File audio is not valid');
        return;
    }

    playerUI.renderHeroSection(currentTrack);
    playerUI.renderMiniPlayer(currentTrack);
    setupAudio(currentTrack.audio_url);
}

function bindAudioEvents(audio) {
    // Gắn event xử lý icon play/pause
    audio.onplay = () => {
        playerUI.updatePlayPauseIcon(true);
    };

    audio.onpause = () => {
        playerUI.updatePlayPauseIcon(false);
    };

    // Cập nhật progress mỗi khi currentTime thay đổi
    audio.ontimeupdate = () => {
        playerUI.updateProgressUI(audio);
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
        audio.play();
    };

    bindAudioEvents(audio);
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
    playerUI.renderTrackList(playerData.getAllTracks());
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
    playerUI.toggleLoopState(isLoop);
    console.log(isLoop);
}

export function handleRandomState() {
    isRandom = !isRandom;
    playerUI.toggleRandomState(isRandom);
}

// Need to check again
export function handleSeekTrack(e, progressBar) {
    if (!audio || !audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percent = x / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    audio.currentTime = percent * audio.duration;
    playerUI.updateProgressUI(audio);
}
