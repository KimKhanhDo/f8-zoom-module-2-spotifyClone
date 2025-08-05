export class PopularArtistsComponent {
    constructor({ container, artists = [], onArtistClick }) {
        this.container = container;
        this.artists = artists;
        this.onArtistClick = onArtistClick; // callback khi click vào 1 artist
    }

    // Tạo HTML string cho tất cả artist
    render() {
        const html = this.artists

            .map(
                (artist) => `
            <div class="artist-card" data-id="${artist.id}">
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

        this.container.innerHTML = html;
        this._bindArtistCardEvent();
    }

    _bindArtistCardEvent() {
        this.container.onclick = (e) => {
            const card = e.target.closest('.artist-card');
            if (!card) return;
            const artistId = card.dataset.id;

            if (typeof this.onArtistClick === 'function') {
                this.onArtistClick(artistId);
            }
        };
    }
}
