import { playerData } from '../../../data/index.js';
import { helpers } from '../../../utils/index.js';

export class PopularTracksComponent {
    constructor({ tracks = [], container, playerController, onTrackSelect }) {
        this.tracks = tracks;
        this.container = container; // DOM node để gắn UI
        this.playerController = playerController; // Lưu instance vào class -> LẤY AUDIO QUA playerController
        this.onTrackSelect = onTrackSelect; // callback, sẽ được gọi khi người dùng chọn bài mới -> Player xử lý
    }

    render(tracks) {
        this.tracks = tracks;
        const currentIndex = playerData.getCurrentIndex();

        const trackItems = tracks
            .map((track, index) => {
                const isPlaying = index === currentIndex;

                const id = helpers.escapeHTML(track.id);
                const title = helpers.escapeHTML(track.title);
                const albumCover = helpers.escapeHTML(
                    track.album_cover_image_url ||
                        'https://placehold.co/40x40?text=IMG'
                );
                const playCount = helpers.formatCount(track.play_count);
                const duration = helpers.formatTime(track.duration);

                return `
                <div class="track-item ${
                    isPlaying ? 'playing' : ''
                }" data-id="${id}">
                    <div class="track-number">${
                        isPlaying
                            ? '<i class="fas fa-volume-up playing-icon"></i>'
                            : index + 1
                    }</div>
                    <div class="track-image">
                        <img src="${albumCover}" alt="${title}" />
                    </div>
                    <div class="track-info">
                        <div class="track-name ${
                            isPlaying ? 'playing-text' : ''
                        }">${title}</div>
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

        this.container.innerHTML = trackItems;
        this.bindTrackListEvent();
    }

    bindTrackListEvent() {
        this.container.addEventListener('click', (e) => {
            const trackItem = e.target.closest('.track-item');
            if (!trackItem) return;

            const trackId = trackItem.dataset.id;
            const trackIndex = this.tracks.findIndex(
                (track) => trackId === track.id
            );
            if (trackIndex === -1) return;

            // Check nếu đang click bài đang phát thì play lại từ đầu, ko update UI
            const currentIndex = playerData.getCurrentIndex();
            if (trackIndex === currentIndex) {
                // LẤY AUDIO QUA playerController
                const audio = this.playerController?.getAudio();
                if (audio) {
                    audio.currentTime = 0;
                    audio.play();
                }
                return;
            }

            // Nếu click bài khác, gọi callback để logic phía ngoài xử lý (chuyển bài, load track mới)
            if (typeof this.onTrackSelect === 'function') {
                this.onTrackSelect(trackIndex);
            }
        });
    }
}
