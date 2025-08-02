import { artistData } from '../../data/index.js';
import { helpers } from '../../utils/index.js';

export class ArtistHeroComponent {
    constructor(container) {
        this.container = container; // section .artist-hero
    }

    async render(track) {
        // Fetch artist info (chỉ để lấy is_verified)
        const artistInfo = await artistData.getArtistById(track.artist_id);

        // Tạo HTML string (template)
        this.container.innerHTML = `
            <div class="hero-background">
                <img
                    src="${
                        helpers.escapeHTML(track.album_cover_image_url) ||
                        'placeholder.svg'
                    }"
                    alt="${helpers.escapeHTML(
                        track.artist_name
                    )} artist background"
                    class="hero-image"
                />
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                ${
                    artistInfo?.is_verified
                        ? `
                <div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>Verified Artist</span>
                </div>
                `
                        : ''
                }
                <h1 class="artist-name">${helpers.escapeHTML(
                    track.artist_name
                )}</h1>
                <p class="monthly-listeners">
                    ${helpers.formatCount(track.play_count)} monthly listeners
                </p>
            </div>
        `;
    }
}
