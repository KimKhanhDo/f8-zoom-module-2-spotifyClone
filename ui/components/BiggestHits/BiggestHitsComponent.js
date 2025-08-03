import { helpers } from '../../../utils/index.js';

export class BiggestHitsComponent {
    constructor({ container, hitTracks = [], onTrackClick }) {
        this.container = container;
        this.hitTracks = hitTracks;
        this.onTrackClick = onTrackClick; // callback khi click vào 1 hit
    }

    render() {
        const hitCards = this.hitTracks
            .map((track) => {
                return `
            <div class="hit-card" data-id=${helpers.escapeHTML(track.id)}>
                            <div class="hit-card-cover">
                                <img
                                    src=${
                                        track.album_cover_image_url
                                            ? helpers.escapeHTML(
                                                  track.album_cover_image_url
                                              )
                                            : 'placeholder.svg?height=160&width=160'
                                    }
                                    alt=${helpers.escapeHTML(track.title)}
                                />
                                <button class="hit-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <div class="hit-card-info">
                                <h3 class="hit-card-title">${helpers.escapeHTML(
                                    track.title
                                )}</h3>
                                <p class="hit-card-artist">${helpers.escapeHTML(
                                    track.artist_name
                                )}</p>
                            </div>
                        </div>
            `;
            })
            .join('');

        this.container.innerHTML = hitCards;
    }

    bindBiggestHitsEvent() {
        this.container.addEventListener('click', (e) => {
            const hitCard = e.target.closest('.hit-card');
            if (!hitCard) return;

            const cardID = hitCard.dataset.id();
            console.log(cardID);
        });
    }
}
