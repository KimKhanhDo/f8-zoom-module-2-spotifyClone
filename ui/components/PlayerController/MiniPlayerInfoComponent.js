import { helpers } from '../../../utils/index.js';

export class MiniPlayerInfoComponent {
    constructor(container) {
        this.container = container;
    }

    render(track) {
        this.container.innerHTML = `
             <img
                        src=${
                            track.album_cover_image_url
                                ? helpers.escapeHTML(
                                      track.album_cover_image_url
                                  )
                                : 'https://placehold.co/40x40?text=IMG'
                        }
                        alt="Current track"
                        class="player-image"
                    />
                    <div class="player-info">
                        <div class="player-title">
                           ${helpers.escapeHTML(track.title)}
                        </div>
                        <div class="player-artist">${helpers.escapeHTML(
                            track.artist_name
                        )}</div>
                    </div>
                    <button class="add-btn">
                        <i class="fa-solid fa-plus"></i>
                    </button>
        `;
    }
}
