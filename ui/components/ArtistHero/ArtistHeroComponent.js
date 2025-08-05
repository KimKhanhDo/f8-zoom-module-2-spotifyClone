import { artistsData } from '../../../data/index.js';
import { helpers } from '../../../utils/index.js';

export class ArtistHeroComponent {
    constructor(container) {
        this.container = container; // section .artist-hero
    }

    async render(data) {
        // Set default nếu không có data
        let artistId = '';
        let artistName = 'Unknown Artist';
        let coverImage = 'placeholder.svg';
        let playCount = 0;
        let isVerified = false;

        // Nếu có data thì lấy field từ data
        if (data) {
            artistId = data.artist_id || data.id || '';

            artistName = data.artist_name || data.name || 'Unknown Artist';

            coverImage =
                data.cover_image_url || data.image_url || 'placeholder.svg';

            playCount = data.play_count || data.monthly_listeners || 0;

            // Dùng is_verified trực tiếp nếu có, chỉ fetch nếu chưa có
            // is_verified cần fetch cho case obj trả về là album detail
            isVerified = data.is_verified;
            if (typeof isVerified === 'undefined' && artistId) {
                const artistInfo = await artistsData.getArtistById(artistId);
                isVerified = artistInfo?.is_verified;
            }
        }

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
                    ${helpers.formatCount(playCount)} monthly listeners
                </p>
            </div>
        `;
    }
}
