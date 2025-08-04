import { playlists, artists } from '../../../mockSidebarData.js';
import { SearchLibraryComponent } from './SearchLibraryComponent.js';

const TAB_ALL = 'all';
const TAB_PLAYLISTS = 'playlists';
const TAB_ARTISTS = 'artists';

export class SidebarComponent {
    constructor(container) {
        this.container = container; // DOM element cha -> '.sidebar'
        this.currentTab = TAB_ALL;

        // Khởi tạo state: danh sách kết quả hiện tại (mặc định là toàn bộ)
        this.playlistResults = playlists;
        this.artistResults = artists;
        this.searchQuery = '';

        // Tạo SearchLibraryComponent và truyền callback updateResults vào để nhận kết quả tìm kiếm mới
        this.searchLibrary = new SearchLibraryComponent(
            container.querySelector('.search-library'),
            this.updateResults.bind(this)
        );

        // Luôn render lần đầu toàn bộ giao diện sidebar
        this.renderSidebar();
    }

    // Callback được SearchLibraryComponent gọi khi có kết quả tìm kiếm mới
    updateResults(filteredPlaylists, filteredArtists, searchQuery) {
        this.playlistResults = filteredPlaylists;
        this.artistResults = filteredArtists;
        this.searchQuery = searchQuery;
        this.renderSidebar();
    }

    renderSidebar() {
        let contentHtml = '';

        // Xác định dữ liệu thực tế sẽ render ra UI (có thể là tất cả hoặc đã được lọc)
        const displayedPlaylists = this.playlistResults;
        const displayedArtists = this.artistResults;
        const isSearching = !!this.searchQuery;

        // Kiểm tra: nếu đang search mà không tìm thấy kết quả nào
        // User đã nhập search & ko tìm được playlist hoặc artist nào
        const nothingFound =
            this.searchQuery &&
            displayedPlaylists.length === 0 &&
            displayedArtists.length === 0;

        if (nothingFound) {
            // Thông báo không tìm thấy kết quả
            contentHtml = this._renderNoResults();
        } else {
            // Nếu có kết quả, render list theo tab (ALL, PLAYLISTS, ARTISTS)
            contentHtml = this._renderLibraryItems(
                displayedPlaylists,
                displayedArtists
            );
        }

        // Cập nhật nội dung vào DOM
        this.container.querySelector('.library-content').innerHTML =
            contentHtml;

        this.container.querySelector('.nav-tabs').innerHTML = this._renderTabs(
            this.currentTab,
            displayedPlaylists,
            displayedArtists,
            isSearching
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

        // Nếu tab hiện tại là ALL hoặc PLAYLISTS thì render danh sách playlist
        if (this.currentTab === TAB_ALL || this.currentTab === TAB_PLAYLISTS) {
            items += displayedPlaylists
                .map((item) => this._renderPlaylistItem(item))
                .join('');
        }

        // Nếu tab hiện tại là ALL hoặc ARTISTS thì render danh sách artist
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

    _renderTabs(currentTab, displayedPlaylists, displayedArtists, isSearching) {
        // Đặt các biến trạng thái rõ ràng, ngắn gọn
        const noResult =
            isSearching &&
            displayedPlaylists.length === 0 &&
            displayedArtists.length === 0;

        const onlyArtist =
            isSearching &&
            displayedPlaylists.length === 0 &&
            displayedArtists.length > 0;

        const onlyPlaylist =
            isSearching &&
            displayedArtists.length === 0 &&
            displayedPlaylists.length > 0;

        const isFilterTab = !isSearching && currentTab !== TAB_ALL;

        // 1. Nếu đang search và không có kết quả → ẩn tabs
        if (noResult) {
            return '';
        }

        // 2. Nếu chỉ có artist
        if (onlyArtist) {
            return `
            <button class="nav-tab active" data-tab="artists">Artists</button>
        `;
        }

        // 3. Nếu chỉ có playlist
        if (onlyPlaylist) {
            return `
            <button class="nav-tab active" data-tab="playlists">Playlists</button>
        `;
        }

        // 4. Nếu đang chọn playlist hoặc artist → chỉ hiện tab active + nút close
        if (isFilterTab) {
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

        // 5. Trường hợp mặc định TAB_ALL hoặc có cả 2 loại kết quả (both)
        return `
            <button class="nav-tab" data-tab="${TAB_PLAYLISTS}">Playlists</button>
            <button class="nav-tab" data-tab="${TAB_ARTISTS}">Artists</button>
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
                this.renderSidebar();
            };
        });

        // check null cho closeFilterBtn ở trạng thái TAB_ALL
        if (closeFilterBtn) {
            closeFilterBtn.onclick = () => {
                this.currentTab = TAB_ALL;
                this.renderSidebar();
            };
        }
    }
}
