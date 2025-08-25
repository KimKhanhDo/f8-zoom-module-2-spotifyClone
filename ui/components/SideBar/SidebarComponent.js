import { playlistsData, artistsData } from '../../../data/index.js';
import { SearchLibraryComponent } from './SearchLibraryComponent.js';
import { helpers, httpRequest } from '../../../utils/index.js';

/* ============== TABS OPTIONS ============== */
const TAB_ALL = 'all';
const TAB_PLAYLISTS = 'playlists';
const TAB_ARTISTS = 'artists';

/* ============== SORT OPTIONS ============== */
const SORT_RECENT = 'recent';
const SORT_RECENTLY_ADDED = 'recently-added';
const SORT_ALPHABETICAL = 'alphabetical';
const SORT_CREATOR = 'creator';

const SORT_TEXT = {
    [SORT_RECENT]: 'Recent',
    [SORT_RECENTLY_ADDED]: 'Recently Added',
    [SORT_ALPHABETICAL]: 'Alphabetical',
    [SORT_CREATOR]: 'Creator',
};

/* ============== VIEW MODES ============== */
const VIEW_COMPACT_LIST = 'compact-list';
const VIEW_DEFAULT_LIST = 'default-list';
const VIEW_COMPACT_GRID = 'compact-grid';
const VIEW_DEFAULT_GRID = 'default-grid';

/* Icon nhỏ trên cùng, cạnh sort-text */
const VIEW_ICON = {
    [VIEW_COMPACT_LIST]: 'fa-bars',
    [VIEW_DEFAULT_LIST]: 'fa-list',
    [VIEW_COMPACT_GRID]: 'fa-th',
    [VIEW_DEFAULT_GRID]: 'fa-th-large',
};

export class SidebarComponent {
    constructor(container, onOpenPlaylistEditor = null) {
        this.container = container; // DOM element cha -> '.sidebar'
        this.currentTab = TAB_ALL;

        // Sort & View
        this.sortMode = SORT_RECENT;
        this.viewMode = VIEW_DEFAULT_LIST;

        this.onOpenPlaylistEditor = onOpenPlaylistEditor; // ← callback mở modal edit

        // Khởi tạo state
        this.playlistResults = [];
        this.artistResults = [];
        this.searchQuery = '';

        // Cache DOM & gắn event cho menu Sort + View
        this._initSortDom();
        this._bindSortEvents();

        // Cache các DOM liên quan context menu & gắn event
        this._initContextMenuDom();
        this._bindContextMenuEvents();

        // Tạo SearchLibraryComponent và truyền callback updateResults vào để nhận kết quả tìm kiếm mới
        this.searchLibrary = new SearchLibraryComponent(
            container.querySelector('.search-library'),
            this.updateResults.bind(this)
        );

        // Đồng bộ UI lần đầu (icon view + active + container class + nhãn sort)
        this._syncUiState();
        this.reloadLibrary();

        // lắng sự kiện đồng bộ lại library khi playlist đổi
        // e.detail = { action: 'created'|'updated', playlist: {...} }
        this._onPlaylistChanged = (e) => this.reloadLibrary();
        document.addEventListener('playlist:changed', this._onPlaylistChanged);
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

        /**
            Xác định dữ liệu thực tế sẽ render ra UI (có thể là tất cả hoặc đã được lọc)
            Clone mảng gốc để sort/filter mà không ảnh hưởng tới state gốc
         */
        const displayedPlaylists = this.playlistResults.slice();
        const displayedArtists = this.artistResults.slice();
        const isSearching = !!this.searchQuery;

        // Áp sort dựa trên mode hiện tại
        this._applySort(displayedPlaylists, displayedArtists, this.sortMode);

        /**
         * CSS theo view mode:
            - Gắn data-view để CSS trong index.html áp layout tương ứng
            - Toggle class 'grid' cho 2 mode grid
        */
        this.libraryContentEl.dataset.view = this.viewMode;

        const isGrid =
            this.viewMode === VIEW_COMPACT_GRID ||
            this.viewMode === VIEW_DEFAULT_GRID;

        this.libraryContentEl.classList.toggle('grid', isGrid);

        /**
            - Kiểm tra: nếu đang search mà không tìm thấy kết quả nào
            - User đã nhập search & ko tìm được playlist hoặc artist nào
         */
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

    _renderItem(item, type) {
        const name = helpers.escapeHTML(
            item.name || (type === 'artist' ? 'Unknown Artist' : 'My Playlist')
        );
        const image = helpers.escapeHTML(item.image_url || 'placeholder.svg');
        const id = helpers.escapeHTML(item.id);

        // Owner chỉ áp dụng cho playlist
        const owner =
            type === 'artist'
                ? ''
                : helpers.escapeHTML(
                      item.user_display_name || item.user_username || 'Me'
                  );

        switch (this.viewMode) {
            // ----- Compact list -----
            case VIEW_COMPACT_LIST: {
                return `
        <div class="library-item compact-item" data-type="${type}" data-id="${id}">
          <p class="item-title compact-title">${name}</p>
          <span class="item-subtitle compact-subtitle">${
              type === 'artist' ? 'Artist' : `Playlist • ${owner}`
          }</span>
        </div>
      `;
            }

            // ----- Default list -----
            case VIEW_DEFAULT_LIST: {
                return `
        <div class="library-item" data-type="${type}" data-id=${id}>
          <img src="${image}" alt="${name}" class="item-image"/>
          <div class="item-info">
            <div class="item-title">${name}</div>
            <div class="item-subtitle">
              ${type === 'artist' ? '' : '<i class="fas fa-thumbtack"></i>'}
              ${type === 'artist' ? 'Artist' : `Playlist • ${owner}`}
            </div>
          </div>
        </div>
      `;
            }

            // ----- Compact grid -----
            case VIEW_COMPACT_GRID: {
                return `
        <div class="library-item compact-grid" data-type="${type}" data-id="${id}">
          <img src="${image}" alt="${name}" class="compact-img"/>
        </div>
      `;
            }

            // ----- Default grid -----
            case VIEW_DEFAULT_GRID: {
                const thumbMod =
                    type === 'artist' ? 'thumb--circle' : 'thumb--rounded';
                return `
        <div class="library-item default-grid" data-type="${type}" data-id="${id}">
          <div class="thumb ${thumbMod}">
            <img src="${image}" alt="${name}" class="thumb-img"/>
            <button class="grid-play-btn"><i class="fa-solid fa-play"></i></button>
          </div>
          <div class="meta">
            <div class="item-title grid-title">${name}</div>
            <div class="item-subtitle grid-subtitle"> ${
                type === 'artist' ? 'Artist' : `Playlist • ${owner}`
            }</div>
          </div>
        </div>
      `;
            }

            default:
                return '';
        }
    }

    // Render list theo tab đang chọn
    _renderLibraryItems(displayedPlaylists, displayedArtists) {
        let items = '';

        // Nếu tab hiện tại là ALL hoặc PLAYLISTS -> render danh sách playlist
        if (this.currentTab === TAB_ALL || this.currentTab === TAB_PLAYLISTS) {
            items += displayedPlaylists
                .map((playlist) => this._renderItem(playlist, 'playlist'))
                .join('');
        }

        // Nếu tab hiện tại là ALL hoặc ARTISTS -> render danh sách artist
        if (this.currentTab === TAB_ALL || this.currentTab === TAB_ARTISTS) {
            items += displayedArtists
                .map((artist) => this._renderItem(artist, 'artist'))
                .join('');
        }

        return items;
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

        if (closeFilterBtn) {
            closeFilterBtn.onclick = () => {
                this.currentTab = TAB_ALL;
                this.renderSidebar();
            };
        }
    }

    /**
     * Luồng render Sidebar:
     * 1) constructor chỉ cần gọi this.reloadLibrary() (không gọi renderSidebar() ở đây).
     * 2) reloadLibrary() gọi this.searchLibrary.setBaseData(...).
     * 3) setBaseData(...) sẽ gọi ngược updateResults(...), và updateResults mới gọi renderSidebar().
     */
    async reloadLibrary() {
        try {
            const [{ playlists }, artists] = await Promise.all([
                playlistsData.getUserPlaylists(), // { playlists: [...] }
                artistsData.getFollowedArtists(), //  artists: [...]
            ]);

            this.playlistResults = playlists || [];
            this.artistResults = artists || [];

            // Bơm & đồng bộ data gốc cho Search -> Search sẽ gọi lại updateResults(...)
            this.searchLibrary.setBaseData(
                this.playlistResults,
                this.artistResults
            );

            // console.log('Playlist: ', playlists);
            // console.log('Artists: ', artists);
        } catch (error) {
            this.playlistResults = [];
            this.artistResults = [];
            this.searchLibrary.setBaseData([], []);
            console.log('Reload Library error:', error);
        }
    }

    // ================== CONTEXT MENU FOR PLAYLISTS + ARTISTS ==================

    _initContextMenuDom() {
        // SideBar wrapper + vùng scroll
        this.sidebar = this.container;
        this.sidebarNav = this.container.querySelector('.sidebar-nav');
        this.libContent = this.sidebarNav.querySelector('.library-content');

        // 2 context menus đã có sẵn trong HTML
        this.artistMenu = this.sidebarNav.querySelector('.artist-context-menu');
        this.playlistMenu = this.sidebarNav.querySelector(
            '.playlist-context-menu'
        );
    }

    _bindContextMenuEvents() {
        // Mở context menu bằng chuột phải trên item
        this.libContent.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.library-item');
            if (!item) return;

            e.preventDefault();
            this._hideAllMenus();

            const type = item.dataset.type;
            const id = item.dataset.id;

            const currentMenu =
                type === 'artist' ? this.artistMenu : this.playlistMenu;

            // set id vào currentMenu
            currentMenu.dataset.id = id;
            currentMenu.classList.add('show');

            this.sidebar.classList.add('locked');
            this._positionMenu(currentMenu, e);
        });

        // Click actions – PLAYLIST
        this.playlistMenu.addEventListener('click', async (e) => {
            const deleteOpt = e.target.closest('.delete');
            const removeOpt = e.target.closest('.remove');
            const editOpt = e.target.closest('.edit');

            const playlistId = this.playlistMenu.dataset.id;
            if (!playlistId) return;

            try {
                if (deleteOpt) {
                    await playlistsData.deleteUserPlaylistById(playlistId);

                    document.dispatchEvent(
                        new CustomEvent('playlist:changed', {
                            detail: { action: 'deleted', playlistId },
                        })
                    );
                    return;
                }

                if (removeOpt) {
                    await httpRequest.put(`playlists/${playlistId}`, {
                        is_public: false,
                    });

                    document.dispatchEvent(
                        new CustomEvent('playlist:changed', {
                            detail: { action: 'unpublished', playlistId },
                        })
                    );

                    return;
                }

                if (editOpt) {
                    const playlist = await playlistsData.getPlaylistById(
                        playlistId
                    );

                    if (
                        playlist &&
                        typeof this.onOpenPlaylistEditor === 'function'
                    ) {
                        this.onOpenPlaylistEditor(playlist);
                    }

                    return;
                }
            } catch (err) {
                helpers.showToast(
                    "Couldn't modify playlist. Please try again.",
                    'error'
                );
                console.log("Couldn't modify playlist. Please try again.");
            } finally {
                this._hideAllMenus();
            }
        });

        // Click actions – ARTIST
        this.artistMenu.addEventListener('click', async (e) => {
            const unfollowOpt = e.target.closest('.unfollow');
            if (!unfollowOpt) return;

            const artistId = this.artistMenu.dataset.id;
            if (!artistId) return;

            try {
                await artistsData.unfollowArtist(artistId);
                document.dispatchEvent(
                    new CustomEvent('playlist:changed', {
                        detail: { action: 'artist-unfollowed', artistId },
                    })
                );
            } catch {
                helpers.showToast('Error happen. Please try again.', 'error');
                console.log('Error happen. Please try again.');
            } finally {
                this._hideAllMenus();
            }
        });

        // Auto close khi click ngoài / Escape
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-context')) this._hideAllMenus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._hideAllMenus();
        });
    }

    _hideAllMenus() {
        this.artistMenu.classList.remove('show');
        this.playlistMenu.classList.remove('show');
        this.sidebar.classList.remove('locked');
    }

    _positionMenu(menu, e) {
        const navRect = this.sidebarNav.getBoundingClientRect();
        const scroller = this.sidebar;

        // toạ độ tương đối với nav + bù scroll của sidebar
        let left = e.clientX - navRect.left + scroller.scrollLeft;
        let top = e.clientY - navRect.top + scroller.scrollTop;

        // menu đã .show để đo kích thước
        const menuW = menu.offsetWidth;
        const menuH = menu.offsetHeight;

        const padding = 8;
        const minLeft = scroller.scrollLeft + padding;
        const minTop = scroller.scrollTop + padding;

        const maxLeft =
            scroller.scrollLeft + scroller.clientWidth - menuW - padding;
        const maxTop =
            scroller.scrollTop + scroller.clientHeight - menuH - padding;

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    // ================== MENU SORT + VIEW ==================
    _initSortDom() {
        // Nút & menu sort trong sidebar
        this.sortBtn = this.container.querySelector('.sort-btn');
        this.sortMenu = this.container.querySelector('.recent-context-menu');
        this.sortText = this.container.querySelector('.sort-text');
        this.sortIcon = this.container.querySelector('.sort-icon');
        this.viewBtns = this.sortMenu.querySelectorAll('.recent-view-btn');
        this.libraryContentEl =
            this.container.querySelector('.library-content');
        this.sidebarScroller = this.container; // để set overflowY
    }

    _bindSortEvents() {
        // Mở/đóng menu
        this.sortBtn.onclick = (e) => {
            e.stopPropagation();
            this.sortMenu.classList.toggle('show');

            this.sortMenu.classList.contains('show')
                ? (this.sidebarScroller.style.overflowY = 'hidden')
                : (this.sidebarScroller.style.overflowY = '');
        };

        // Chọn option (Sort + View)
        this.sortMenu.addEventListener('click', (e) => {
            // ----- Sort by -----
            const item = e.target.closest('.recent-menu-item');
            if (item) {
                this.sortMode = item.dataset.sort;
                this.sortText.textContent = SORT_TEXT[this.sortMode];

                // Xoá active các option trước khi set lại
                this._removeActiveSortOptions();
                item.classList.add('active');

                this.renderSidebar();
                this._hideSortMenu();
                return;
            }

            // ----- View as -----
            const viewBtn = e.target.closest('.recent-view-btn');
            if (viewBtn) {
                this.viewMode = viewBtn.dataset.view;
                this.sortIcon.className = `sort-icon fas ${
                    VIEW_ICON[this.viewMode]
                }`;

                // Xoá active các nút view trước khi set lại
                this._removeActiveViewBtns();
                viewBtn.classList.add('active');

                this.renderSidebar();
                this._hideSortMenu();
                return;
            }
        });

        // Auto close khi click ngoài
        document.addEventListener('click', (e) => {
            const clickedInsideMenu = this.sortMenu.contains(e.target);
            const clickedBtn = this.sortBtn.contains(e.target);
            if (
                this.sortMenu.classList.contains('show') &&
                !clickedInsideMenu &&
                !clickedBtn
            ) {
                this._hideSortMenu();
            }
        });

        // ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._hideSortMenu();
        });
    }

    _applySort(playlists, artists, sortMode) {
        // Artists: giữ nguyên (trừ ALPHABETICAL)
        switch (sortMode) {
            case SORT_RECENT:
                // Sort playlist theo thời gian updated_at (nếu có) hoặc created_at, mới nhất lên trước
                playlists.sort((a, b) => {
                    const timeA = new Date(
                        a.updated_at || a.created_at || 0
                    ).getTime();

                    const timeB = new Date(
                        b.updated_at || b.created_at || 0
                    ).getTime();
                    return timeB - timeA; // DESC → playlist mới nhất đứng trước
                });
                break;

            case SORT_RECENTLY_ADDED:
                // Sort playlist theo created_at, mới nhất lên trước
                playlists.sort((a, b) => {
                    const timeA = new Date(a.created_at || 0).getTime();
                    const timeB = new Date(b.created_at || 0).getTime();
                    return timeB - timeA; // DESC
                });
                break;

            case SORT_ALPHABETICAL:
                // Sort playlist & artist theo tên (A-Z)
                playlists.sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                );
                artists.sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                );
                break;

            case SORT_CREATOR:
                // Sort playlist theo tên chủ sở hữu (A-Z)
                playlists.sort((a, b) => {
                    const ownerA = a.user_display_name || a.user_username || '';
                    const ownerB = b.user_display_name || b.user_username || '';
                    return ownerA.localeCompare(ownerB);
                });
                break;

            default:
                break;
        }
    }

    _removeActiveSortOptions() {
        const allOptionsMenu =
            this.sortMenu.querySelectorAll('.recent-menu-item');

        allOptionsMenu.forEach((option) => option.classList.remove('active'));
    }

    _removeActiveViewBtns() {
        this.viewBtns.forEach((btn) => btn.classList.remove('active'));
    }

    _hideSortMenu() {
        this.sortMenu.classList.remove('show');
        this.sidebarScroller.style.overflowY = '';
    }

    // Đồng bộ UI view lần đầu: icon + active + layout container
    _syncUiState() {
        this.sortText.textContent = SORT_TEXT[this.sortMode];
        this.sortIcon.className = `sort-icon fas ${VIEW_ICON[this.viewMode]}`;
        this._removeActiveViewBtns();

        // set active cho nút view đúng với default
        const btn = this.sortMenu.querySelector(
            `.recent-view-btn[data-view="${this.viewMode}"]`
        );
        if (btn) btn.classList.add('active');

        // container layout
        this.libraryContentEl.dataset.view = this.viewMode;
        const isGrid =
            this.viewMode === VIEW_COMPACT_GRID ||
            this.viewMode === VIEW_DEFAULT_GRID;
        this.libraryContentEl.classList.toggle('grid', isGrid);
    }
}
