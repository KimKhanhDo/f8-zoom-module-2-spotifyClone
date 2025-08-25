import { helpers } from '../../../utils/index.js';

export class BiggestHitsComponent {
    constructor({ container, biggestHits = [], onTrackClick }) {
        this.container = container;
        this.biggestHits = biggestHits;
        this.onTrackClick = onTrackClick; /// callback nhận playlistId
    }

    render() {
        const hitCards = this.biggestHits
            .map((item) => {
                const id = helpers.escapeHTML(item.id);
                const image = item.image_url
                    ? helpers.escapeHTML(item.image_url)
                    : 'placeholder.svg?height=160&width=160';
                const title = (item.name || item.title) ?? 'Unknown Album';
                const name =
                    (item.user_display_name ||
                        item.user_username ||
                        item.artist_name) ??
                    'Unknown';

                return `
            <div class="hit-card" data-id=${id}>
                            <div class="hit-card-cover">
                                <img
                                    src=${image}
                                    alt=${helpers.escapeHTML(title)}
                                />
                                <button class="hit-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <div class="hit-card-info">
                                <h3 class="hit-card-title">${helpers.escapeHTML(
                                    title
                                )}</h3>
                                <p class="hit-card-artist">${helpers.escapeHTML(
                                    name
                                )}</p>
                            </div>
                        </div>
            `;
            })
            .join('');

        this.container.innerHTML = hitCards;

        this._bindBiggestHitsEvent();
    }

    _bindBiggestHitsEvent() {
        this.container.onclick = (e) => {
            const hitCard = e.target.closest('.hit-card');
            if (!hitCard) return;
            const playlistId = hitCard.dataset.id;

            // Gọi callback khi có
            if (typeof this.onTrackClick === 'function') {
                this.onTrackClick(playlistId);
            }
        };
    }
}
