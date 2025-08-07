import { helpers } from '../../../utils/index.js';

export class ArtistHeroComponent {
    constructor(container) {
        this.container = container; // section .artist-hero
    }

    render(data) {
        // Set default nếu không có data

        let artistName = data.name || 'Unknown Artist';
        let coverImage = data.image_url || 'placeholder.svg';
        // let playCount = data.monthly_listeners || '';
        let isVerified = data.is_verified;

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
                    ${
                        'monthly_listeners' in data
                            ? `${helpers.formatCount(
                                  data.monthly_listeners
                              )} monthly listeners`
                            : `${helpers.formatCount(
                                  data.followers_count ?? 0
                              )} followers`
                    } 
                </p>
            </div>
        `;
    }
}
