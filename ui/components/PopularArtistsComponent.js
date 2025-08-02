export class PopularArtistsComponent {
    constructor({ artists = [], onArtistClick }) {
        this.artists = artists;
        this.onArtistClick = onArtistClick; // callback khi click vào 1 artist
    }

    render(container) {
        // Tạo HTML string cho tất cả artist
        const html = this.artists
            .map(
                (artist) => `
            <div class="artist-card" data-id="${artist.artist_id}">
                <div class="artist-card-cover">
                    <img
                        src="${
                            artist.image_url ||
                            'placeholder.svg?height=160&width=160'
                        }"
                        alt="${artist.name}"
                    />
                    <button class="artist-play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="artist-card-info">
                    <h3 class="artist-card-name">${artist.name}</h3>
                    <p class="artist-card-type">Artist</p>
                </div>
            </div>
        `
            )
            .join('');

        container.innerHTML = html;

        // Gắn event cho nút play từng artist
        container.querySelectorAll('.artist-play-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const artistCard = btn.closest('.artist-card');
                const artistId = artistCard.dataset.id;
                if (typeof this.onArtistPlay === 'function') {
                    this.onArtistPlay(artistId);
                }
            });
        });
    }
}
