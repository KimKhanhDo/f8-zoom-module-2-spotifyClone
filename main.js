import { httpRequest } from './utils/index.js';
import { playerData } from './data/index.js';
import {
    getPlayerControllerInstance,
    renderBiggestHitsSection,
    renderPopularArtistsSection,
    renderPopularTracksSection,
    renderSidebarLeftSection,
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
//     // TODO: Implement other functionality here
//     // Load dữ liệu chính
//     const { tracks } = await httpRequest.get('tracks');
//     playerData.setTracks(tracks);
//     // playerData.setTracks(mockTracks);

//     renderPopularArtistsSection();

//     // Khởi động player
//     playerLogic.startPlayer();

//     // Setup event cho các phần control
//     playerEvents.setupPlayerControls();
// });

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load dữ liệu chính
    // 2. Render các section ngoài player
    // 3. Lấy instance PlayerController

    const { tracks } = await httpRequest.get('tracks');
    playerData.setTracks(tracks);
    // playerData.setTracks(mockTracks);

    renderSidebarLeftSection();
    // renderSearchLibrarySection();
    renderBiggestHitsSection();
    renderPopularArtistsSection();

    const playerController = getPlayerControllerInstance();
    startPlayer();

    function handleTrackSelect(trackIndex) {
        // 1. Đánh dấu lại index của bài hát được chọn (update state).
        // 2. Load & play bài hát mới, cập nhật UI player (hero/mini player).
        // 3. Render lại playlist để highlight đúng bài đang phát.
        playerData.setCurrentIndex(trackIndex);
        playerController.loadCurrentTrack();
        renderPopularTracksSection(
            playerData.getAllTracks(),
            handleTrackSelect
        );
    }

    // Hàm startPlayer (khởi tạo playlist, setup các callback UI)
    function startPlayer() {
        const tracks = playerData.getAllTracks();
        renderPopularTracksSection(tracks, handleTrackSelect);
        playerController.updateProgressUI();
        playerController.loadCurrentTrack();
    }
});
