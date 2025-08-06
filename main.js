import { httpRequest } from './utils/index.js';
import { playerData } from './data/index.js';
import { initSignupForm } from './ui/components/Authentication/signupForm.js';

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

    // Close modal when clicking overlay (outside modal container)
    // authModal.addEventListener('click', function (e) {
    //     if (e.target === authModal) {
    //         closeModal();
    //     }
    // });

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
    // const authFormContent = signupForm.querySelector('.auth-form-content');
    // const submitFormBtn = signupForm.querySelector('.auth-submit-btn');

    // const email = document.querySelector('#signupEmail');
    // const password = document.querySelector('#signupPassword');
    // const eyeIcon = document.querySelector('#eye-icon');
    // const userInfo = document.querySelector('.user-info');

    // let isShowPassword = false;
    // let isEmailValid = false;
    // let isPasswordValid = false;

    // // Handle UI of form input
    // eyeIcon.onclick = () => {
    //     isShowPassword = !isShowPassword;
    //     if (isShowPassword) {
    //         password.type = 'text';
    //         eyeIcon.classList.remove('fa-eye-slash');
    //         eyeIcon.classList.add('fa-eye');
    //         eyeIcon.style.color = '#169c46';
    //     } else {
    //         password.type = 'password';
    //         eyeIcon.classList.remove('fa-eye');
    //         eyeIcon.classList.add('fa-eye-slash');
    //         eyeIcon.style.color = '#b3b3b3';
    //     }
    // };

    // email.oninput = () => {
    //     hideInputError(email);
    //     isEmailValid = isValidatedEmail(email.value);
    //     toggleSubmitBtn();
    //     hideBackendError();
    // };

    // email.onblur = () => {
    //     if (email.value.trim() !== '' && !isValidatedEmail(email.value)) {
    //         showInputError(email);
    //     }
    // };

    // // Cứ mỗi lần user nhập, đều ẩn lỗi (dù còn hay hết text)
    // password.oninput = () => {
    //     hideInputError(password);
    //     isPasswordValid = isValidatedPassword(password.value);
    //     toggleSubmitBtn();
    //     hideBackendError();
    // };

    // password.onblur = () => {
    //     if (
    //         password.value.trim() !== '' &&
    //         !isValidatedPassword(password.value)
    //     ) {
    //         showInputError(password);
    //     }
    // };

    // function toggleSubmitBtn() {
    //     if (isEmailValid && isPasswordValid) {
    //         submitFormBtn.disabled = false;
    //         submitFormBtn.style.opacity = '1';
    //         submitFormBtn.style.cursor = 'pointer';
    //     } else {
    //         submitFormBtn.disabled = true;
    //         submitFormBtn.style.opacity = '0.3';
    //         submitFormBtn.style.cursor = 'not-allowed';
    //     }
    // }

    // // Submit Form
    // authFormContent.addEventListener('submit', async (e) => {
    //     const modalHeading = signupForm.querySelector('.modal-heading');
    //     const authErrorMessage = signupForm.querySelector('.auth-error');

    //     e.preventDefault();

    //     // K.tra các fields đã hợp lệ chưa mới đến bước này
    //     const credentials = {
    //         email: email.value,
    //         password: password.value,
    //     };

    //     try {
    //         const { user, access_token } = await httpRequest.post(
    //             'auth/register',
    //             credentials
    //         );
    //         console.log(user, access_token);

    //         // Avoid flashing later after getting user's info
    //         localStorage.setItem('currentUser', JSON.stringify(user));
    //         localStorage.setItem('accessToken', access_token);

    //         updateCurrentUserAvatar(user);
    //         showToast('Sign Up Successfully');
    //         authModal.classList.remove('show');
    //         authBtns.classList.remove('show');
    //         userInfo.classList.add('show');
    //         authFormContent.reset();
    //     } catch (error) {
    //         console.dir(error);

    //         const msg = extractBackendErrorMsg(error);
    //         authErrorMessage.textContent = msg;
    //         authErrorMessage.style.display = 'block';
    //         modalHeading.style.marginBottom = '16px';
    //     }
    // });

    // function extractBackendErrorMsg(error) {
    //     // Ưu tiên lỗi BE trả về có details dạng array (đa lỗi)
    //     if (
    //         error?.response?.error?.details &&
    //         Array.isArray(error.response.error.details)
    //     ) {
    //         return error.response.error.details
    //             .map((detail) => detail.message)
    //             .join(', ');
    //     }
    //     // Nếu có message (lỗi đơn, hoặc lỗi logic khác)
    //     if (error?.response?.error?.message) {
    //         return error.response.error.message;
    //     }
    //     // Nếu BE trả về message ngoài cùng (không nằm trong error object)
    //     if (error?.response?.message) {
    //         return error.response.message;
    //     }
    //     // Fallback cuối cùng (lỗi mạng, không xác định)
    //     return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    // }

    // function isValidatedEmail(email) {
    //     const regex = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$');
    //     return regex.test(email);
    // }

    // function isValidatedPassword(password) {
    //     const regex = new RegExp(
    //         '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{6,}$'
    //     );
    //     return regex.test(password);
    // }

    // function hideInputError(element) {
    //     element.closest('.form-group').classList.remove('invalid');
    // }

    // function showInputError(element) {
    //     element.closest('.form-group').classList.add('invalid');
    // }

    // function hideBackendError() {
    //     const modalHeading = signupForm.querySelector('.modal-heading');
    //     const authErrorMessage = signupForm.querySelector('.auth-error');

    //     authErrorMessage.textContent = '';
    //     authErrorMessage.style.display = 'none';
    //     modalHeading.style.marginBottom = '48px';
    // }

    // function showToast(message, type = 'success') {
    //     const toastContainer = document.querySelector('#toast-container');
    //     const icons = {
    //         success: 'fa-solid fa-circle-check',
    //         updated: 'fa-solid fa-bullhorn',
    //         deleted: 'fa-solid fa-circle-exclamation',
    //     };
    //     const icon = icons[type];

    //     const toast = document.createElement('div');
    //     toast.className = `toast toast-${type}`;
    //     toast.style.animation = `slideIn 0.3s ease-out, fadeOut 0.6s ease-in 6s forwards`;

    //     toast.innerHTML = ` <span class="toast-icon">
    //     <i class="${icon}"></i>
    //     </span>
    //     <div class="toast-message">${message}</div>
    //     <button class="toast-close">&times;</button>`;

    //     // Auto dismiss
    //     const autoDismissId = setTimeout(() => {
    //         toast.remove();
    //     }, 7000);

    //     // Close on click
    //     toast.querySelector('.toast-close').onclick = () => {
    //         toast.remove();
    //         clearTimeout(autoDismissId);
    //     };

    //     toastContainer.appendChild(toast);
    // }

    initSignupForm({
        signupForm,
        authModal,
        authBtns,
        updateCurrentUserAvatar,
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
let playerController = null;
document.addEventListener('DOMContentLoaded', async () => {
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

    // =================== SIGN UP ===================
    const authBtns = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');

    try {
        // Nếu đã đăng nhập (có token hợp lệ trong localStorage)
        const { user } = await httpRequest.get('users/me');
        userInfo.classList.add('show');
        updateCurrentUserAvatar(user);

        console.log(user);
    } catch (error) {
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

function extractUserName(email) {
    return email.charAt(0).toUpperCase();
}

// Hàm để hiển thị thông tin user
function updateCurrentUserAvatar(user) {
    const userName = document.querySelector('#user-name');

    if (user.email) {
        userName.textContent = extractUserName(user.email);
    }
}
