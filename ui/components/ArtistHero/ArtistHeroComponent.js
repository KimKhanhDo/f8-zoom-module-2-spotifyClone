import { helpers } from '../../../utils/index.js';
import { artistsData } from '../../../data/index.js';

export class ArtistHeroComponent {
    constructor(container) {
        this.container = container; // section .artist-hero
    }

    async render(data) {
        const isTrackPayload = !('is_verified' in data) && 'artist_id' in data;
        const view = isTrackPayload
            ? { ...data, ...(await artistsData.getArtistById(data.artist_id)) }
            : data;

        // Set default nếu không có data
        const artistName = (view.name || view.artist_name) ?? 'Unknown Artist';
        const coverImage =
            (view.image_url || view.album_cover_image_url) ?? 'placeholder.svg';
        const isVerified = view.is_verified;
        const monthlyListener =
            'monthly_listeners' in view
                ? `${helpers.formatCount(
                      view.monthly_listeners
                  )} monthly listeners`
                : `${helpers.formatCount(view.followers_count ?? 0)} followers`;

        // Tạo HTML string (template)
        this.container.innerHTML = `
            <div class="hero-background">
                <img
                    src="${helpers.escapeHTML(coverImage)}"
                    alt="${helpers.escapeHTML(artistName)} artist background"
                    class="hero-image"
                />
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                ${
                    isVerified
                        ? `
                <div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>Verified Artist</span>
                </div>
                `
                        : ''
                }
                <h1 class="artist-name">${helpers.escapeHTML(artistName)}</h1>
                <p class="monthly-listeners">
                    ${monthlyListener} 
                </p>
            </div>
        `;
    }
}
