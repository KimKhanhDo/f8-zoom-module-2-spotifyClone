// ui/components/Auth/signupForm.js
import { httpRequest } from '../../../utils/index.js';

export function initSignupForm({
    signupForm,
    authModal,
    authBtns,
    updateCurrentUserAvatar,
}) {
    const authFormContent = signupForm.querySelector('.auth-form-content');
    const submitFormBtn = signupForm.querySelector('.auth-submit-btn');
    const email = signupForm.querySelector('#signupEmail');
    const password = signupForm.querySelector('#signupPassword');
    const eyeIcon = signupForm.querySelector('#eye-icon');
    const userInfo = document.querySelector('.user-info');

    let isShowPassword = false;
    let isEmailValid = false;
    let isPasswordValid = false;

    // Eye icon show/hide password
    eyeIcon.onclick = () => {
        isShowPassword = !isShowPassword;
        if (isShowPassword) {
            password.type = 'text';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
            eyeIcon.style.color = '#169c46';
        } else {
            password.type = 'password';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
            eyeIcon.style.color = '#b3b3b3';
        }
    };

    // Email validate
    email.oninput = () => {
        hideInputError(email);
        isEmailValid = isValidatedEmail(email.value);
        toggleSubmitBtn();
        hideBackendError();
    };

    email.onblur = () => {
        if (email.value.trim() !== '' && !isValidatedEmail(email.value)) {
            showInputError(email);
        }
    };

    // Password validate
    password.oninput = () => {
        hideInputError(password);
        isPasswordValid = isValidatedPassword(password.value);
        toggleSubmitBtn();
        hideBackendError();
    };

    password.onblur = () => {
        if (
            password.value.trim() !== '' &&
            !isValidatedPassword(password.value)
        ) {
            showInputError(password);
        }
    };

    // Submit event
    authFormContent.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credentials = {
            email: email.value,
            password: password.value,
        };

        try {
            const { user, access_token } = await httpRequest.post(
                'auth/register',
                credentials
            );
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('accessToken', access_token);
            handleAfterSignupSuccess(user);
        } catch (error) {
            handleSignupFailure(error);
        }
    });

    function toggleSubmitBtn() {
        if (isEmailValid && isPasswordValid) {
            submitFormBtn.disabled = false;
            submitFormBtn.style.opacity = '1';
            submitFormBtn.style.cursor = 'pointer';
        } else {
            submitFormBtn.disabled = true;
            submitFormBtn.style.opacity = '0.3';
            submitFormBtn.style.cursor = 'not-allowed';
        }
    }

    function handleAfterSignupSuccess(user) {
        updateCurrentUserAvatar(user);
        showToast('Sign Up Successfully');

        authModal.classList.remove('show');
        authBtns.classList.remove('show');

        userInfo.classList.add('show');
        authFormContent.reset();
    }

    function handleSignupFailure(error) {
        const modalHeading = signupForm.querySelector('.modal-heading');
        const authErrorMessage = signupForm.querySelector('.auth-error');

        const msg = extractBackendErrorMsg(error);
        authErrorMessage.textContent = msg;
        authErrorMessage.style.display = 'block';
        modalHeading.style.marginBottom = '16px';
    }

    function extractBackendErrorMsg(error) {
        // Ưu tiên lỗi BE trả về có details dạng array (đa lỗi)
        if (
            error?.response?.error?.details &&
            Array.isArray(error.response.error.details)
        ) {
            return error.response.error.details
                .map((detail) => detail.message)
                .join(', ');
        }

        // Nếu có message (lỗi đơn, hoặc lỗi logic khác)
        if (error?.response?.error?.message) {
            return error.response.error.message;
        }

        // Nếu BE trả về message ngoài cùng (không nằm trong error object)
        if (error?.response?.message) {
            return error.response.message;
        }

        // Fallback cuối cùng (lỗi mạng, không xác định)
        return 'Something went wrong. Please try again.';
    }

    function isValidatedEmail(email) {
        const regex = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$');
        return regex.test(email);
    }

    function isValidatedPassword(password) {
        const regex = new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{6,}$'
        );
        return regex.test(password);
    }

    function hideInputError(element) {
        element.closest('.form-group').classList.remove('invalid');
    }

    function showInputError(element) {
        element.closest('.form-group').classList.add('invalid');
    }

    function hideBackendError() {
        const modalHeading = signupForm.querySelector('.modal-heading');
        const authErrorMessage = signupForm.querySelector('.auth-error');
        authErrorMessage.textContent = '';
        authErrorMessage.style.display = 'none';
        modalHeading.style.marginBottom = '48px';
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.querySelector('#toast-container');
        const icons = {
            success: 'fa-solid fa-circle-check',
            updated: 'fa-solid fa-bullhorn',
            deleted: 'fa-solid fa-circle-exclamation',
        };
        const icon = icons[type];

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.animation = `slideIn 0.3s ease-out, fadeOut 0.6s ease-in 6s forwards`;

        toast.innerHTML = `
            <span class="toast-icon"><i class="${icon}"></i></span>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

        const autoDismissId = setTimeout(() => {
            toast.remove();
        }, 7000);

        toast.querySelector('.toast-close').onclick = () => {
            toast.remove();
            clearTimeout(autoDismissId);
        };

        toastContainer.appendChild(toast);
    }
}
