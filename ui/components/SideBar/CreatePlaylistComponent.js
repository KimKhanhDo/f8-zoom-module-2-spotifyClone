// ui/components/SideBar/CreatePlaylistComponent.js
import { httpRequest } from '../../../utils/index.js';

export class CreatePlaylistComponent {
    constructor() {
        // State
        this.currentPlaylist = null; // server trả về sau khi create
        this.selectedFile = null; // file chọn trong modal
        this.previewObjectUrl = null; // blob URL để preview
        this.uploadedImageUrl = null; // URL thật sau upload

        // DOM
        this._initSidebarElements();
        this._initOverlayElements();
        this._initModalElements();

        this._bindEvents();
    }

    /* =================== Init DOM =================== */
    _initSidebarElements() {
        this.createBtn = document.querySelector('.create-btn');
        this.logoBtn = document.querySelector('.logo');
    }

    _initOverlayElements() {
        this.playlistFormOverlay = document.querySelector(
            '.playlist-form-overlay'
        );
        this.playlistHeading =
            this.playlistFormOverlay.querySelector('.playlist-heading');
        this.playlistUsername =
            this.playlistFormOverlay.querySelector('.playlist-username');
        this.playlistCoverPickerBox =
            this.playlistFormOverlay.querySelector('.cover-image-box');
        this.playlistCloseBtn =
            this.playlistFormOverlay.querySelector('.close-btn');
    }

    _initModalElements() {
        this.editDetailsOverlay = document.querySelector(
            '.edit-details-modal-overlay'
        );
        this.editCloseBtn = this.editDetailsOverlay.querySelector(
            '.edit-details-close-btn'
        );
        this.editCoverBox =
            this.editDetailsOverlay.querySelector('.cover-image-box');
        this.editCoverInput =
            this.editDetailsOverlay.querySelector('.cover-image-input');
        this.editNameInput = this.editDetailsOverlay.querySelector(
            '.edit-details-input'
        );
        this.editDescTextarea = this.editDetailsOverlay.querySelector(
            '.edit-details-textarea'
        );
        this.alertWrapper = this.editDetailsOverlay.querySelector(
            '.alert-message-wrapper'
        );
        this.alertMessage =
            this.editDetailsOverlay.querySelector('.alert-message');
        this.editSaveBtn = document.querySelector('.edit-details-save-btn');
    }

    /* =================== Events =================== */
    _bindEvents() {
        this.logoBtn.onclick = () =>
            this.playlistFormOverlay.classList.remove('show');

        this.playlistCloseBtn.onclick = () =>
            this.playlistFormOverlay.classList.remove('show');

        this.createBtn.onclick = () => this._openCreatePlaylistOverlay();

        // click ảnh bìa ở overlay → mở modal
        this.playlistCoverPickerBox.onclick = () => this._openEditModal();
        this.playlistHeading.onclick = () => {
            this._openEditModal();
            // UX: highlight Name
            requestAnimationFrame(() => {
                this.editNameInput.focus();
                this.editNameInput.select();
            });
        };

        // Trong modal: chỉ mở file chooser, không reset preview
        this.editCoverBox.onclick = () => this.editCoverInput.click();
        this.editCoverInput.addEventListener('click', (e) =>
            e.stopPropagation()
        );

        // Chọn file → preview
        this.editCoverInput.addEventListener('change', () =>
            this._handleFileChange()
        );

        // Close modal (X)
        this.editCloseBtn.onclick = () => this._closeAndResetEditModalPreview();

        // Gõ vào input/textarea → ẩn message lỗi
        this.editNameInput.addEventListener('input', () => this._clearError());
        this.editDescTextarea.addEventListener('input', () =>
            this._clearError()
        );

        // Save
        this.editSaveBtn.addEventListener('click', () =>
            this._saveEditDetails()
        );
    }

    /* =================== Flow =================== */
    async _openCreatePlaylistOverlay() {
        this.playlistFormOverlay.classList.add('show');
        this._clearError();

        try {
            const { playlist } = await httpRequest.post('playlists', {
                name: 'My Playlist',
            });
            if (!playlist) return;

            this.currentPlaylist = playlist;

            // Header form: tên playlist + tên user (giữ nguyên logic)
            const localInfo = localStorage.getItem('currentUser');
            const user = localInfo ? JSON.parse(localInfo) : {};

            this.playlistHeading.textContent = playlist.name;
            this.playlistUsername.textContent =
                (user.display_name || user.userName) ?? 'Me';
        } catch (err) {
            console.log('Playlist Error:', err);
            // This step don't need to use _showError, this's used for modal detail
        }
    }

    _openEditModal() {
        this._syncEditFieldsFromState();

        // reset tạm
        this.selectedFile = null;
        this.uploadedImageUrl = null;

        // hiển thị ảnh hiện có
        const coverUrl = this.currentPlaylist?.image_url || null;
        if (coverUrl) {
            this._setCoverBackground(this.editCoverBox, coverUrl);
            this._hideCoverOverlay(this.editCoverBox);
        } else {
            this._clearCoverBackground(this.editCoverBox);
            this._showCoverOverlay(this.editCoverBox);
        }

        this._clearError();
        this.editDetailsOverlay.classList.add('show');
    }

    _handleFileChange() {
        const file = this.editCoverInput.files?.[0];
        if (!file) return;

        this.selectedFile = file;

        // clear URL tạm cũ nếu có
        if (this.previewObjectUrl) URL.revokeObjectURL(this.previewObjectUrl);
        this.previewObjectUrl = URL.createObjectURL(file);

        // preview trong modal
        this._setCoverBackground(this.editCoverBox, this.previewObjectUrl);
        this._hideCoverOverlay(this.editCoverBox);
    }

    async _saveEditDetails() {
        if (!this.currentPlaylist?.id) return;

        this._clearError();

        const newName =
            (this.editNameInput.value || '').trim() ||
            this.currentPlaylist.name ||
            'My Playlist';

        const newDesc =
            (this.editDescTextarea.value || '').trim() ||
            this.currentPlaylist.description ||
            '';

        try {
            // 1) Upload ảnh nếu có
            if (this.selectedFile) {
                const form = new FormData();
                form.append('cover', this.selectedFile);

                const res = await httpRequest.post(
                    `upload/playlist/${this.currentPlaylist.id}/cover`,
                    form
                );

                // Kiểm tra url:
                if (!res?.file?.url) {
                    throw new Error('Upload failed. Please try another image.');
                }

                this.uploadedImageUrl = `https://spotify.f8team.dev${res.file.url}`;
            }

            // 2) PUT cập nhật name/desc/(image_url)
            const payload = { name: newName, description: newDesc };

            if (this.uploadedImageUrl)
                payload.image_url = this.uploadedImageUrl;

            const updateRes = await httpRequest.put(
                `playlists/${this.currentPlaylist.id}`,
                payload
            );

            if (!updateRes || updateRes.error) {
                throw new Error(
                    updateRes?.message || 'Update failed. Please try again.'
                );
            }

            // 3) Success → cập nhật UI overlay
            this.currentPlaylist = { ...this.currentPlaylist, ...payload };
            this.playlistHeading.textContent = this.currentPlaylist.name;

            // Sau khi SAVE mới đổ cover xuống overlay
            if (this.uploadedImageUrl) {
                this._setCoverBackground(
                    this.playlistCoverPickerBox,
                    this.currentPlaylist.image_url
                );
                this._hideCoverOverlay(this.playlistCoverPickerBox);
            }

            // Đóng modal & dọn state tạm
            this._clearError();
            this._closeAndResetEditModalPreview();
        } catch (err) {
            console.log('Chi tiết playlist lỗi:', err);
            // KHÔNG đóng modal khi lỗi
            this._showError(
                err?.message || 'Error happened. Please try again!'
            );
        }
    }

    /* =================== Helpers =================== */
    _syncEditFieldsFromState() {
        this.editNameInput.value =
            this.currentPlaylist?.name ??
            this.playlistHeading.textContent ??
            '';

        this.editDescTextarea.value = this.currentPlaylist?.description ?? '';
    }

    _closeAndResetEditModalPreview() {
        this.editDetailsOverlay.classList.remove('show');

        this.selectedFile = null;
        this.uploadedImageUrl = null;

        if (this.previewObjectUrl) {
            URL.revokeObjectURL(this.previewObjectUrl);
            this.previewObjectUrl = null;
        }

        this._clearCoverBackground(this.editCoverBox);
        this._showCoverOverlay(this.editCoverBox);
    }

    _clearError() {
        this.alertWrapper.classList.remove('show');
        this.alertMessage.textContent = '';
    }

    _showError(msg) {
        this.alertMessage.textContent = msg;
        this.alertWrapper.classList.add('show');
    }

    _setCoverBackground(boxEl, url) {
        boxEl.style.backgroundImage = `url(${url})`;
        boxEl.style.backgroundSize = 'cover';
        boxEl.style.backgroundPosition = 'center';
    }
    _clearCoverBackground(boxEl) {
        boxEl.style.backgroundImage = '';
    }
    _hideCoverOverlay(boxEl) {
        const icon = boxEl.querySelector('i');
        const title = boxEl.querySelector('.cover-title');
        if (icon) icon.style.display = 'none';
        if (title) title.style.display = 'none';
    }
    _showCoverOverlay(boxEl) {
        const icon = boxEl.querySelector('i');
        const title = boxEl.querySelector('.cover-title');
        if (icon) icon.style.display = '';
        if (title) title.style.display = '';
    }
}
