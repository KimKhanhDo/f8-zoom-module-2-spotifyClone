// PlayerControllerComponent.js
import { playerData } from '../../../data/index.js';
import { helpers } from '../../../utils/index.js';
import {
    renderArtistHeroSection,
    renderMiniPlayerSection,
} from '../../sectionRenderers.js';

export class PlayerControllerComponent {
    constructor({ container, onTrackChange }) {
        this.container = container;
        this.audio = null;
        this.isLoop = false;
        this.isRandom = false;
        this.isAutoPlayEnabled = false;
        this.PREV_RESTART_THRESHOLD = 2;
        this.onTrackChange = onTrackChange; // Lưu callback

        this._dragHandler = this.handleVolumeAdjustment.bind(this);
        this._stopDragHandler = this._stopDrag.bind(this);

        this._initElements();
        this._bindEvents();
    }

    // Cache DOM elements
    _initElements() {
        // KHÔNG query .toggle-play-btn ở đây nữa!
        this.nextBtn = this.container.querySelector('.next-btn');
        this.prevBtn = this.container.querySelector('.previous-btn');
        this.progressBar = this.container.querySelector('.progress-bar');
        this.loopBtn = this.container.querySelector('.loop-btn');
        this.randomBtn = this.container.querySelector('.random-btn');
        this.volumeBar = this.container.querySelector('.volume-bar');
        this.volumeFill = this.container.querySelector('.volume-fill');
        this.volumeHandle = this.container.querySelector('.volume-handle');
        this.currentTimeEl = this.container.querySelector('.current-time');
        this.totalTimeEl = this.container.querySelector('.total-time');
    }

    // Gắn toàn bộ event (trừ play/pause - sẽ gắn ngoài class!)
    _bindEvents() {
        // Events for navigation buttons
        this.nextBtn.addEventListener('click', () => this.handleNextTrack());
        this.prevBtn.addEventListener('click', () =>
            this.handlePreviousTrack()
        );

        this.loopBtn.addEventListener('click', () => this.handleLoopState());
        this.randomBtn.addEventListener('click', () =>
            this.handleRandomState()
        );

        this.progressBar.addEventListener('click', (e) =>
            this.handleSeekTrack(e)
        );

        // Volume events
        this.volumeBar.addEventListener('click', (e) =>
            this.handleVolumeAdjustment(e)
        );
        this.volumeBar.addEventListener('mousedown', (e) => this._startDrag(e));
        this.volumeHandle.addEventListener('mousedown', (e) =>
            this._startDrag(e)
        );
    }

    // ======================= Audio setup & control ======================
    setupAudio(trackUrl) {
        // Nếu đang có audio cũ thì pause trước khi tạo audio mới!
        if (this.audio) this.audio.pause();

        this.audio = new Audio(trackUrl);
        this.audio.loop = this.isLoop;

        // LUÔN auto play khi next/prev hoặc load bài mới
        this.audio.oncanplay = () => {
            if (this.isAutoPlayEnabled) {
                this.audio.play();
            }
        };

        this.audio.onplay = () => this._updatePlayPauseIcon(true);
        this.audio.onpause = () => this._updatePlayPauseIcon(false);
        this.audio.ontimeupdate = () => this.updateProgressUI();
        this.audio.onended = () => this.handleNextTrack();
    }

    play() {
        if (this.audio) this.audio.play();
    }

    pause() {
        if (this.audio) this.audio.pause();
    }

    togglePlay() {
        if (!this.audio) return;

        if (this.audio.paused) {
            this.isAutoPlayEnabled = true;
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    // ======================= Track navigation ======================
    handleNextTrack() {
        this.isAutoPlayEnabled = true;
        this._navigateTrack('next');
    }

    handlePreviousTrack() {
        this.isAutoPlayEnabled = true;
        this._navigateTrack('previous');
    }

    _navigateTrack(action) {
        if (this.isRandom) {
            playerData.getRandomTrack();
        } else {
            switch (action) {
                case 'next':
                    playerData.getNextTrack();
                    break;

                case 'previous':
                    // Nếu bài hiện tại phát > 2 giây thì reset về đầu, KHÔNG chuyển bài
                    if (
                        this.audio &&
                        this.audio.currentTime > this.PREV_RESTART_THRESHOLD
                    ) {
                        this.audio.currentTime = 0;
                        this.audio.play();
                        return;
                    }

                    // Nếu chưa vượt PREV_RESET_TIME thì chuyển sang bài trước như bình thường
                    playerData.getPrevTrack();
                    break;
            }
        }
        this.loadCurrentTrack();
    }

    handleLoopState() {
        this.isLoop = !this.isLoop;

        if (this.audio) {
            this.audio.loop = this.isLoop;
        }

        this._toggleLoopStateUI(this.isLoop);
    }

    handleRandomState() {
        this.isRandom = !this.isRandom;
        this._toggleRandomStateUI(this.isRandom);
    }

    // ======================= Render & Update UI ======================
    loadCurrentTrack() {
        const currentTrack = playerData.getCurrentTrack();

        if (!currentTrack || !currentTrack.audio_url) {
            renderMiniPlayerSection(null);
            console.error('File audio is not valid');
            return;
        }

        // Render các phần UI khác
        renderMiniPlayerSection(currentTrack);

        // Setup và play audio
        this.setupAudio(currentTrack.audio_url);

        // Nếu click bài khác, gọi callback playerController xử lý logic update index, phát nhạc
        if (typeof this.onTrackChange === 'function') {
            this.onTrackChange(currentTrack);
            // render popular playlist here tại callback
        }
    }

    _updatePlayPauseIcon(isPlaying) {
        // Tìm tất cả icon play/pause trong trang (dù nằm ở đâu)
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

    _toggleLoopStateUI(isLoop) {
        this.loopBtn.classList.toggle('active', isLoop);
    }

    _toggleRandomStateUI(isRandom) {
        this.randomBtn.classList.toggle('active', isRandom);
    }

    updateProgressUI() {
        const audio = this.audio;
        if (!audio || !audio.duration) {
            this._resetProgressUI();
            return;
        }
        // Tính phần trăm đã phát
        const percent = audio.currentTime / audio.duration;
        const barWidth = this.progressBar.offsetWidth;
        const handleWidth =
            this.container.querySelector('.progress-handle').offsetWidth;

        // Vị trí handle từ 0 đến barWidth - handleWidth
        const handlePos = percent * (barWidth - handleWidth);

        // Fill đến giữa handle
        this.container.querySelector('.progress-fill').style.width =
            handlePos + handleWidth / 2 + 'px';
        this.container.querySelector('.progress-handle').style.left =
            handlePos + 'px';

        // Cập nhật thời gian
        this.currentTimeEl.textContent = helpers.formatTime(audio.currentTime);
        this.totalTimeEl.textContent = helpers.formatTime(audio.duration);
    }

    _resetProgressUI() {
        this.container.querySelector('.progress-fill').style.width = '0px';
        this.container.querySelector('.progress-handle').style.left = '0px';
        this.currentTimeEl.textContent = helpers.formatTime(0);
        this.totalTimeEl.textContent = helpers.formatTime(0);
    }

    // ======================= Seek, Volume ======================
    handleSeekTrack(e) {
        if (!this.audio || !this.audio.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;

        let percent = x / rect.width;
        percent = Math.max(0, Math.min(percent, 1));

        this.audio.currentTime = percent * this.audio.duration;
        this.updateProgressUI();
    }

    handleVolumeAdjustment(e) {
        const percent100 = this._getVolumePercent(e);
        this.setVolume(percent100);
        this._updateVolumeUI(percent100);
    }

    setVolume(percent) {
        // Thuộc tính audio.volume chỉ nhận giá trị từ 0 đến 1
        if (this.audio)
            this.audio.volume = Math.max(0, Math.min(percent / 100, 1));
    }

    _getVolumePercent(e) {
        // Lấy vị trí & kích thước thật của volumeBar
        const barRect = this.volumeBar.getBoundingClientRect();
        // Tính phần trăm vị trí click trên thanh
        let percent = (e.clientX - barRect.left) / barRect.width;
        // Đảm bảo giá trị nằm trong khoảng 0 tới 1 -> đổi thành %
        return Math.max(0, Math.min(percent, 1)) * 100;
    }

    _updateVolumeUI(percent) {
        this.volumeFill.style.width = percent + '%';

        const handleWidth = this.volumeHandle.offsetWidth;
        const barWidth = this.volumeBar.offsetWidth;

        // Tính toán vị trí chính giữa của handle nằm đúng vị trí fill
        let left = (percent / 100) * barWidth - handleWidth / 2;

        // Chặn tràn mép
        left = Math.max(
            -handleWidth / 2,
            Math.min(left, barWidth - handleWidth / 2)
        );

        // Gán giá trị sau khi tính toán
        this.volumeHandle.style.left = left + 'px';
    }

    _startDrag(e) {
        e.preventDefault();
        this.handleVolumeAdjustment(e); // Cập nhật volume 1 lần khi bấm

        // Thêm event listener mousemove và mouseup cho document
        document.addEventListener('mousemove', this._dragHandler);
        document.addEventListener('mouseup', this._stopDragHandler);
    }

    _onDragVolume(e) {
        this.handleVolumeAdjustment(e);
    }

    _stopDrag(e) {
        // Remove event listener khi kết thúc kéo
        document.removeEventListener('mousemove', this._dragHandler);
        document.removeEventListener('mouseup', this._stopDragHandler);
    }

    // ======================= Tiện ích / Getters ======================
    getAudio() {
        return this.audio;
    }

    // Có thể bổ sung thêm emit/callback ra ngoài nếu muốn khi next/prev/seek...
}
