export class SearchLibraryComponent {
    constructor(container, onResultsUpdate) {
        this.container = container;
        this.isSearchOpen = false;
        this.onResultsUpdate = onResultsUpdate; // nhận callback từ Sidebar

        this.basePlaylists = [];
        this.baseArtists = [];

        this._initElements();
        this._bindEvents();
    }

    // Cache các DOM element để dùng lại nhiều lần
    _initElements() {
        this.searchBtn = this.container.querySelector('.search-library-btn');
        this.sortBtn = this.container.querySelector('.sort-btn');
        this.searchWrapper = this.container.querySelector('.search-wrapper');
        this.searchInput = this.container.querySelector(
            '.search-library-input'
        );
    }

    _bindEvents() {
        // Xử lý khi bấm nút search
        this.searchBtn.onclick = this._handleSearchBtnClick.bind(this);

        // Xử lý khi nhập vào ô search
        this.searchInput.oninput = this._handleSearchInput.bind(this);

        // Không đóng khi click bên trong searchWrapper
        this.searchWrapper.onclick = (e) => e.stopPropagation();

        // Đóng khi click ngoài
        document.addEventListener(
            'click',
            this._handleDocumentClick.bind(this)
        );
    }

    // Xử lý nhập input: lọc data và gọi callback
    _handleSearchInput() {
        const searchText = this.searchInput.value.trim().toLowerCase();

        // Destructuring nhận về 2 arrays trong object trả về, gán thẳng vào hai biến cùng tên
        const { filteredPlaylists, filteredArtists } =
            this._filterLibraryData(searchText);

        // Gọi callback để báo cho Sidebar cập nhật UI
        if (typeof this.onResultsUpdate === 'function') {
            this.onResultsUpdate(
                filteredPlaylists,
                filteredArtists,
                searchText
            );
        }
    }

    // Tách riêng filter dữ liệu library
    _filterLibraryData(searchText) {
        let filteredPlaylists, filteredArtists;

        if (!searchText) {
            // Nếu không nhập gì, trả lại toàn bộ
            filteredPlaylists = this.basePlaylists;
            filteredArtists = this.baseArtists;
        } else {
            // Nếu có nhập, lọc theo tên hoặc subtitle
            filteredPlaylists = this.basePlaylists.filter((item) => {
                return item.name.toLowerCase().includes(searchText);
            });

            filteredArtists = this.baseArtists.filter((item) => {
                return item.name.toLowerCase().includes(searchText);
            });
        }

        // return object contains 2 array results
        return { filteredPlaylists, filteredArtists };
    }

    // Xử lý khi bấm nút search
    _handleSearchBtnClick(e) {
        e.stopPropagation(); // Chặn nổi bọt, tránh auto đóng

        // Chỉ mở ô search nếu hiện tại đang đóng
        if (!this.isSearchOpen) {
            this.searchBtn.classList.add('hide');
            this.sortBtn.classList.add('hide');
            this.searchWrapper.classList.add('expanded');
            this.searchInput.focus();
            this.isSearchOpen = true;
        }
    }

    // Đóng search khi click ngoài vùng container
    _handleDocumentClick(e) {
        // Nếu ô search chưa mở, không làm gì cả
        if (!this.isSearchOpen) return;

        // Nếu click ngoài container SearchLibrary -> đóng ô search
        if (!this.container.contains(e.target)) {
            this.searchBtn.classList.remove('hide');
            this.sortBtn.classList.remove('hide');
            this.searchWrapper.classList.remove('expanded');

            this.isSearchOpen = false; // Đánh dấu lại trạng thái đã đóng
            this.searchInput.value = '';

            //* Gọi lại logic filter để trả về kết quả full -> Giao diện hiển thị lại như lúc đầu
            this._handleSearchInput();
        }
    }

    setBaseData(playlists, artists) {
        this.basePlaylists = playlists || [];
        this.baseArtists = artists || [];

        // lần đầu: trả full về Sidebar (chưa search)
        this.onResultsUpdate?.(this.basePlaylists, this.baseArtists, '');
    }
}
