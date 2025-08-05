import { playerData } from './data/index.js';

import {
    getPlayerControllerInstance,
    renderBiggestHitsSection,
    renderPopularArtistsSection,
    renderPopularTracksSection,
    renderSidebarLeftSection,
    toggleDetailPanel,
} from './ui/sectionRenderers.js';

// Auth Modal Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const signupBtn = document.querySelector('.signup-btn');
    const loginBtn = document.querySelector('.login-btn');
    const authModal = document.getElementById('authModal');
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

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener('click', function (e) {
        if (e.target === authModal) {
            closeModal();
        }
    });

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
});

// User Menu Dropdown Functionality
document.addEventListener('DOMContentLoaded', function () {
    const userAvatar = document.getElementById('userAvatar');
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

    // Handle logout button click
    logoutBtn.addEventListener('click', function () {
        // Close dropdown first
        userDropdown.classList.remove('show');

        console.log('Logout clicked');
        // TODO: Students will implement logout logic here
    });
});

// Other functionality
// document.addEventListener('DOMContentLoaded', async () => {
//     // 1. Load dữ liệu chính
//     // 2. Render các section ngoài player
//     // 3. Lấy instance PlayerController

//     const { tracks } = await httpRequest.get('tracks');
//     playerData.setTracks(tracks);
//     // playerData.setTracks(mockTracks);

//     renderSidebarLeftSection();
//     renderBiggestHitsSection();
//     renderPopularArtistsSection();

//     const playerController = getPlayerControllerInstance();
//     startPlayer();

//     function handleTrackSelect(trackIndex) {
//         // 1. Đánh dấu lại index của bài hát được chọn (update state).
//         // 2. Load & play bài hát mới, cập nhật UI player (hero/mini player).
//         // 3. Render lại playlist để highlight đúng bài đang phát.
//         playerData.setCurrentIndex(trackIndex);
//         playerController.loadCurrentTrack();
//         renderPopularTracksSection(
//             playerData.getAllTracks(),
//             handleTrackSelect
//         );
//     }

//     // Hàm startPlayer (khởi tạo playlist, setup các callback UI)
//     function startPlayer() {
//         const tracks = playerData.getAllTracks();
//         renderPopularTracksSection(tracks, handleTrackSelect);
//         playerController.updateProgressUI();
//         playerController.loadCurrentTrack();
//     }
// });

// document.addEventListener('DOMContentLoaded', async () => {
//     renderSidebarLeftSection();
//     renderBiggestHitsSection();
//     renderPopularArtistsSection();

//     const playerController = getPlayerControllerInstance(onPlayerTrackChange);

//     startPlayer();

//     // Không cần fetch/setTracks ở đây nữa, mọi data sẽ động khi user click. Nếu chưa có data thì sẽ không render gì
//     function startPlayer() {
//         const tracks = playerData.getAllTracks();
//         renderPopularTracksSection(tracks, handleTrackSelect);
//         playerController.updateProgressUI();
//         playerController.loadCurrentTrack();
//     }

//     // Callback này được truyền vào PlayerControllerComponent khi tạo instance.
//     // Bất cứ khi nào player đổi bài, hàm này sẽ update lại UI track list -> highlight đúng bài đang phát
//     function onPlayerTrackChange() {
//         renderPopularTracksSection(
//             playerData.getAllTracks(),
//             handleTrackSelect
//         );
//     }
// });

let playerController = null;
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const homeBtn = document.querySelector('.home-btn');
    const logo = document.querySelector('.logo');
    const recentMenu = document.querySelector('.recent-context-menu');
    const sortBtn = document.querySelector('.sort-btn');

    // Render sidebar và các section phụ
    renderSidebarLeftSection();
    renderBiggestHitsSection();
    renderPopularArtistsSection();

    // Assign event cho icon Home & Spotify
    homeBtn.onclick = () => toggleDetailPanel(false);
    logo.onclick = () => toggleDetailPanel(false);

    // Test cho nút sort
    sortBtn.onclick = () => {
        recentMenu.classList.toggle('show');
    };

    setupAutoCloseContextMenu('.recent-context-menu', '.sort-btn');

    // Tạo player controller & truyền callback khi đổi bài
    playerController = getPlayerControllerInstance(onPlayerTrackChange);

    startPlayer();
});

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

function setupAutoCloseContextMenu(
    menuSelector,
    triggerSelector,
    showClass = 'show'
) {
    document.addEventListener('click', function (e) {
        const menu = document.querySelector(menuSelector);
        const triggerBtn = document.querySelector(triggerSelector);

        // Nếu menu đang mở và click không phải vào sort-btn hoặc bên trong menu thì ẩn menu
        if (
            menu &&
            menu.classList.contains(showClass) &&
            !menu.contains(e.target) &&
            !triggerBtn.contains(e.target)
        ) {
            menu.classList.remove(showClass);
        }
    });
}
