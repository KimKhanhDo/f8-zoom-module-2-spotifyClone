import { playlists, artists } from '../../../mockSidebarData.js';
import { SearchLibraryComponent } from './SearchLibraryComponent.js';

const TAB_ALL = 'all';
const TAB_PLAYLISTS = 'playlists';
const TAB_ARTISTS = 'artists';

export class SidebarComponent {
    constructor(container) {
        this.container = container; // DOM element cha -> .sidebar
        this.currentTab = TAB_ALL;

        // Kết quả hiện tại sau search (mặc định là data gốc)
        this.playlistResults = playlists;
        this.artistResults = artists;
        this.searchQuery = '';

        // Tạo SearchLibraryComponent và truyền callback updateResults vào để nhận kết quả tìm kiếm mới
        this.searchLibrary = new SearchLibraryComponent(
            container.querySelector('.search-library'),
            this.updateResults.bind(this)
        );

        this.render();
    }

    // Callback được SearchLibraryComponent gọi khi có kết quả tìm kiếm mới
    updateResults(playlistResults, artistResults, searchQuery) {
        this.playlistResults = playlistResults;
        this.artistResults = artistResults;
        this.searchQuery = searchQuery;
        this.render();
    }

    render() {
        let contentHtml = '';

        // Xác định dữ liệu thực tế sẽ render ra UI (có thể là tất cả hoặc đã được lọc)
        const displayedPlaylists = Array.isArray(this.playlistResults)
            ? this.playlistResults
            : playlists;

        const displayedArtists = Array.isArray(this.artistResults)
            ? this.artistResults
            : artists;

        // Nếu đang search và không có kết quả nào (bất kể tab nào), hiển thị thông báo
        const nothingFound =
            this.searchQuery &&
            displayedPlaylists.length === 0 &&
            displayedArtists.length === 0;

        if (nothingFound) {
            // Thông báo không tìm thấy kết quả, nhưng vẫn render đủ tab
            contentHtml = this._renderNoResults();
        } else {
            // Render theo tab đang chọn (logic cũ vẫn giữ nguyên)
            contentHtml = this._renderLibraryItems(
                displayedPlaylists,
                displayedArtists
            );
        }

        // Cập nhật nội dung UI
        this.container.querySelector('.library-content').innerHTML =
            contentHtml;
        this.container.querySelector('.nav-tabs').innerHTML = this._renderTabs(
            this.currentTab
        );

        // Gán lại event cho tab & nút đóng filter
        this._bindEvents();
    }

    _renderNoResults() {
        return `
            <div class="no-results-wrapper">
                <div class="no-results">
                    <div class="no-results-title">Couldn't find ‘${this.searchQuery}’</div>
                    <div class="no-results-desc">
                        Try searching again using a different spelling or keyword.
                    </div>
                </div>
            </div>
        `;
    }

    // Render list theo tab đang chọn
    _renderLibraryItems(displayedPlaylists, displayedArtists) {
        let items = '';

        if (this.currentTab === TAB_ALL || this.currentTab === TAB_PLAYLISTS) {
            items += displayedPlaylists
                .map((item) => this._renderPlaylistItem(item))
                .join('');
        }

        if (this.currentTab === TAB_ALL || this.currentTab === TAB_ARTISTS) {
            items += displayedArtists
                .map((item) => this._renderArtistItem(item))
                .join('');
        }

        return items;
    }

    // Render từng playlist item
    _renderPlaylistItem(item) {
        if (item.isPinned) {
            return `
             <div class="library-item active">
                <div class="item-icon liked-songs">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="item-info">
                    <div class="item-title">${item.name}</div>
                    <div class="item-subtitle">
                          ${
                              item.isPinned
                                  ? '<i class="fas fa-thumbtack"></i>'
                                  : ''
                          }
                    ${item.subtitle}
                    </div>
                </div>
            </div>
            `;
        } else {
            // Playlist bình thường (có hình đại diện)
            return `
        <div class="library-item">
            <img src="${item.image}" alt="${item.name}" class="item-image"/>
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-subtitle">${item.subtitle}</div>
            </div>
        </div>
        `;
        }
    }

    // Render từng artist item
    _renderArtistItem(item) {
        return `
    <div class="library-item">
        <img src="${item.image}" alt="${item.name}" class="item-image"/>
        <div class="item-info">
            <div class="item-title">${item.name}</div>
            <div class="item-subtitle">${item.subtitle}</div>
        </div>
    </div>
    `;
    }

    // Render tabs theo currentTab
    _renderTabs(currentTab) {
        if (currentTab === TAB_ALL) {
            // Hiện cả hai tab, không có nút close
            return `
            <button class="nav-tab " data-tab="${TAB_PLAYLISTS}">Playlists</button>
            <button class="nav-tab " data-tab="${TAB_ARTISTS}">Artists</button>
        `;
        }

        // Nếu đang chọn playlist hoặc artist → chỉ hiện tab active + nút close
        const isPlaylist = currentTab === TAB_PLAYLISTS;
        return `
          <button class="close-filter-btn">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <button class="nav-tab active" data-tab="${currentTab}">
            ${isPlaylist ? 'Playlists' : 'Artists'}
        </button>
       
    `;
    }

    // Gán lại event cho các tab và nút close filter
    _bindEvents() {
        const tabs = this.container.querySelectorAll('.nav-tab');
        const closeFilterBtn =
            this.container.querySelector('.close-filter-btn');

        tabs.forEach((tab) => {
            const tabValue = tab.dataset.tab;

            tab.onclick = () => {
                this.currentTab = tabValue;
                this.render();
            };
        });

        // check null cho closeFilterBtn ở trạng thái TAB_ALL
        if (closeFilterBtn) {
            closeFilterBtn.onclick = () => {
                this.currentTab = TAB_ALL;
                this.render();
            };
        }
    }
}
