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
                return `
            <div class="hit-card" data-id=${helpers.escapeHTML(item.id)}>
                            <div class="hit-card-cover">
                                <img
                                    src=${
                                        item.image_url
                                            ? helpers.escapeHTML(item.image_url)
                                            : 'placeholder.svg?height=160&width=160'
                                    }
                                    alt=${helpers.escapeHTML(item.name)}
                                />
                                <button class="hit-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <div class="hit-card-info">
                                <h3 class="hit-card-title">${helpers.escapeHTML(
                                    item.name
                                )}</h3>
                                <p class="hit-card-artist">${helpers.escapeHTML(
                                    item.user_display_name || item.user_username
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
