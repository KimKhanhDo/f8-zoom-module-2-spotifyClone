import { httpRequest, helpers, setupTooltip } from './utils/index.js';
import { playerData } from './data/index.js';
import { SignupForm, LoginForm } from './ui/components/Authentication/index.js';

import {
    getPlayerControllerInstance,
    renderBiggestHitsSection,
    renderPopularArtistsSection,
    renderPopularTracksSection,
    renderSidebarLeftSection,
    toggleDetailPanel,
} from './ui/sectionRenderers.js';
import { showToast } from './utils/helpers.js';

// Auth Modal Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const signupBtn = document.querySelector('.signup-btn');
    const loginBtn = document.querySelector('.login-btn');
    const authModal = document.getElementById('authModal');
    const authBtns = document.querySelector('.auth-buttons');
    const modalClose = document.getElementById('modalClose');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showLoginBtn = document.getElementById('showLogin');
    const showSignupBtn = document.getElementById('showSignup');

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener('click', function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener('click', function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener('click', closeModal);

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && authModal.classList.contains('show')) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener('click', function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener('click', function () {
        showSignupForm();
    });

    // ======================= LOGIC START HERE =======================
    new SignupForm({
        signupForm,
        authModal,
        authBtns,
        setUserAvatarInitial,
    });

    new LoginForm({ loginForm, authModal, authBtns, setUserAvatarInitial });
});

// User Menu Dropdown Functionality
document.addEventListener('DOMContentLoaded', function () {
    const userAvatar = document.getElementById('userAvatar');
    const userCoverInput = document.getElementById('user-cover-input');
    const userName = document.getElementById('user-name');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove('show');
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
        }
    });

    // Open file input for upload/ change avatar
    userDropdown.onclick = (e) => {
        const isChangeAvatar = e.target.closest('#change-avatar');
        if (isChangeAvatar) {
            userCoverInput.value = '';
            userCoverInput.click();
        }
    };

    // Handle preview avatar
    userCoverInput.addEventListener('change', handleAndUpdateFileChange);

    async function handleAndUpdateFileChange() {
        const file = userCoverInput.files?.[0];
        if (!file) return;

        try {
            // 1) Upload file
            const form = new FormData();
            form.append('avatar', file);

            const res = await httpRequest.post('upload/avatar', form);
            console.log(res);

            if (!res?.file?.url) {
                helpers.showToast(
                    'Upload failed. Please try another image.',
                    'error'
                );
                throw new Error('Upload failed. Please try another image.');
            }

            const uploadedImageUrl = `https://spotify.f8team.dev${res.file.url}`;

            // 2) Cập nhật hồ sơ
            const updateRes = await httpRequest.put('users/me', {
                avatar_url: uploadedImageUrl,
            });

            if (!updateRes || updateRes.error) {
                helpers.showToast(
                    'Upload failed. Please try another image.',
                    'error'
                );
                throw new Error(
                    updateRes?.message || 'Update failed. Please try again.'
                );
            }

            // 3) Lưu cache để giữ ảnh sau reload
            const currentUser = JSON.parse(
                localStorage.getItem('currentUser') || '{}'
            );

            const updatedUser = {
                ...currentUser,
                avatar_url: uploadedImageUrl,
            };

            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            // 4) Cập nhật UI (ẩn ký tự, hiển thị ảnh)
            setUserAvatarInitial(updatedUser);
        } catch (error) {
            console.log(error);
            showToast(error?.message, 'error');
        } finally {
            // Cho phép lần sau chọn lại cùng file
            userCoverInput.value = '';
        }
    }

    // Handle logout button click
    logoutBtn.addEventListener('click', handleLogout);

    async function handleLogout() {
        try {
            await httpRequest.post('auth/logout');
        } catch (error) {
            // Có thể log hoặc toast lỗi, nhưng thường vẫn tiếp tục logout local
            console.log(error);
        }
        // Close dropdown first
        userDropdown.classList.remove('show');

        // Xoá localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');

        // Ẩn user info, show lại nút đăng nhập/đăng ký
        document.querySelector('.user-info').classList.remove('show');
        document.querySelector('.auth-buttons').classList.add('show');

        // Chuyển về trang chủ
        window.location.assign('./');
    }
});

// Other functionality
let playerController = null;
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const homeBtn = document.querySelector('.home-btn');
    const logo = document.querySelector('.logo');

    // Render sidebar và các section phụ
    renderBiggestHitsSection();
    renderPopularArtistsSection();

    // Assign event cho icon Home & Spotify
    setupTooltip();
    homeBtn.onclick = () => toggleDetailPanel(false);
    logo.onclick = () => {
        toggleDetailPanel(false);
        document
            .querySelector('.playlist-form-overlay')
            ?.classList.remove('show');
    };

    // Tạo player controller & truyền callback khi đổi bài
    playerController = getPlayerControllerInstance(onPlayerTrackChange);

    startPlayer();

    // =================== SIGN UP ===================
    const authBtns = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');

    const accessToken = localStorage.getItem('accessToken');
    // Chỉ gọi khi có token!
    if (accessToken) {
        try {
            // Nếu đã đăng nhập (có token hợp lệ trong localStorage) -> Hiển thị avatar và menu người dùng
            const { user } = await httpRequest.get('users/me');
            userInfo.classList.add('show');
            setUserAvatarInitial(user);
        } catch (error) {
            // Nếu token hết hạn/lỗi vẫn fallback về trạng thái chưa đăng nhập
            authBtns.classList.add('show');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
        }
    } else {
        // Không có token ⇒ Chỉ hiển thị nút đăng nhập/đăng ký.
        authBtns.classList.add('show');
    }
});

// =================== HELPER FUNCTIONS ===================
/**
 * Khởi động player và playlist khi vừa load app
 *
 * Chức năng:
 * 1. Lấy danh sách track hiện tại từ playerData (có thể là list mặc định hoặc do user chọn trước đó).
 * 2. Render danh sách playlist vào giao diện chính (section track-list) và gắn callback xử lý khi user chọn bài mới.
 * 3. Cập nhật lại giao diện progress bar player (thanh tiến trình) để đồng bộ với trạng thái nhạc hiện tại.
 * 4. Phát bài hát đầu tiên trong danh sách (nếu có), đồng thời đồng bộ mini player và các section liên quan.
 *
 * Mục tiêu:
 * - Đảm bảo khi user vừa mở app, toàn bộ giao diện player & playlist được hiển thị đúng trạng thái hiện tại,
 *   sẵn sàng cho thao tác play/next/prev hoặc chọn bài mới.
 */
function startPlayer() {
    const tracks = playerData.getAllTracks();
    renderPopularTracksSection(tracks, handleTrackSelect);
    playerController.updateProgressUI();
    playerController.loadCurrentTrack();
}

/**
 * Khi user chọn bài hát mới:
 * 1. Đánh dấu lại index của bài hát được chọn (update state).
 * 2. Load & play bài hát mới, cập nhật UI player (hero/mini player).
 * 3. Render lại playlist để highlight đúng bài đang phát.
 */
export function handleTrackSelect(trackIndex) {
    playerData.setCurrentIndex(trackIndex);
    playerController.loadCurrentTrack();
    renderPopularTracksSection(playerData.getAllTracks(), handleTrackSelect);
}

/**
 * Khi player đổi bài (ví dụ next/prev hoặc hết bài):
 * 1. Callback này được truyền vào PlayerControllerComponent khi tạo instance.
 * 2. Bất cứ khi nào player đổi bài, hàm này sẽ update lại UI track list -> highlight đúng bài đang phát.
 */
export function onPlayerTrackChange() {
    renderPopularTracksSection(playerData.getAllTracks(), handleTrackSelect);
}

// Hiển thị thông tin user
function setUserAvatarInitial(user) {
    const userName = document.querySelector('#user-name');
    const userAvatar = document.querySelector('#userAvatar');

    const displayName = helpers.extractUserName(
        user?.username || user.email || 'User'
    );

    if (user?.avatar_url) {
        userAvatar.style.backgroundImage = `url(${user.avatar_url})`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.style.backgroundPosition = 'center';
        userName.style.display = 'none';
    } else {
        userName.textContent = displayName;
        userAvatar.style.backgroundImage = '';
        userName.style.display = '';
    }

    userAvatar.dataset.tooltip = displayName;
    renderSidebarLeftSection();
}
