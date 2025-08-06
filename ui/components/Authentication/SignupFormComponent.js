// ui/components/Auth/SignupForm.js
import { httpRequest } from '../../../utils/index.js';

export class SignupForm {
    constructor({ signupForm, authModal, authBtns, updateCurrentUserAvatar }) {
        this.signupForm = signupForm;
        this.authModal = authModal;
        this.authBtns = authBtns;
        this.updateCurrentUserAvatar = updateCurrentUserAvatar;
        this.userInfo = document.querySelector('.user-info');
        this.authFormContent = signupForm.querySelector('.auth-form-content');
        this.submitFormBtn = signupForm.querySelector('.auth-submit-btn');
        this.email = signupForm.querySelector('#signupEmail');
        this.password = signupForm.querySelector('#signupPassword');
        this.eyeIcon = signupForm.querySelector('#eye-icon');

        // State
        this.isShowPassword = false;
        this.isEmailValid = false;
        this.isPasswordValid = false;

        this._initEvents();
    }

    _initEvents() {
        // Eye icon show/hide password
        this.eyeIcon.onclick = () => this.togglePasswordVisibility();

        // Email validate
        this.email.oninput = () => {
            this.hideInputError(this.email);
            this.isEmailValid = this.isValidatedEmail(this.email.value);
            this.toggleSubmitBtn();
            this.hideBackendError();
        };
        this.email.onblur = () => {
            if (
                this.email.value.trim() !== '' &&
                !this.isValidatedEmail(this.email.value)
            ) {
                this.showInputError(this.email);
            }
        };

        // Password validate
        this.password.oninput = () => {
            this.hideInputError(this.password);
            this.isPasswordValid = this.isValidatedPassword(
                this.password.value
            );
            this.toggleSubmitBtn();
            this.hideBackendError();
        };
        this.password.onblur = () => {
            if (
                this.password.value.trim() !== '' &&
                !this.isValidatedPassword(this.password.value)
            ) {
                this.showInputError(this.password);
            }
        };

        // Submit event
        this.authFormContent.addEventListener('submit', (e) =>
            this.handleSubmit(e)
        );
    }

    togglePasswordVisibility() {
        this.isShowPassword = !this.isShowPassword;
        if (this.isShowPassword) {
            this.password.type = 'text';
            this.eyeIcon.classList.remove('fa-eye-slash');
            this.eyeIcon.classList.add('fa-eye');
            this.eyeIcon.style.color = '#169c46';
        } else {
            this.password.type = 'password';
            this.eyeIcon.classList.remove('fa-eye');
            this.eyeIcon.classList.add('fa-eye-slash');
            this.eyeIcon.style.color = '#b3b3b3';
        }
    }

    toggleSubmitBtn() {
        if (this.isEmailValid && this.isPasswordValid) {
            this.submitFormBtn.disabled = false;
            this.submitFormBtn.style.opacity = '1';
            this.submitFormBtn.style.cursor = 'pointer';
        } else {
            this.submitFormBtn.disabled = true;
            this.submitFormBtn.style.opacity = '0.3';
            this.submitFormBtn.style.cursor = 'not-allowed';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const credentials = {
            email: this.email.value,
            password: this.password.value,
        };

        try {
            const { user, access_token } = await httpRequest.post(
                'auth/register',
                credentials
            );
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('accessToken', access_token);
            this.handleAfterSignupSuccess(user);
        } catch (error) {
            this.handleSignupFailure(error);
        }
    }

    handleAfterSignupSuccess(user) {
        this.updateCurrentUserAvatar(user);
        this.showToast('Sign Up Successfully');
        this.authModal.classList.remove('show');
        this.authBtns.classList.remove('show');
        this.userInfo.classList.add('show');
        this.authFormContent.reset();
    }

    handleSignupFailure(error) {
        const modalHeading = this.signupForm.querySelector('.modal-heading');
        const authErrorMessage = this.signupForm.querySelector('.auth-error');

        const msg = this.extractBackendErrorMsg(error);
        authErrorMessage.textContent = msg;
        authErrorMessage.style.display = 'block';
        modalHeading.style.marginBottom = '16px';
    }

    extractBackendErrorMsg(error) {
        if (
            error?.response?.error?.details &&
            Array.isArray(error.response.error.details)
        ) {
            return error.response.error.details
                .map((detail) => detail.message)
                .join(', ');
        }
        if (error?.response?.error?.message) {
            return error.response.error.message;
        }
        if (error?.response?.message) {
            return error.response.message;
        }
        return 'Something went wrong. Please try again.';
    }

    isValidatedEmail(email) {
        const regex = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$');
        return regex.test(email);
    }

    isValidatedPassword(password) {
        const regex = new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{6,}$'
        );
        return regex.test(password);
    }

    hideInputError(element) {
        element.closest('.form-group').classList.remove('invalid');
    }

    showInputError(element) {
        element.closest('.form-group').classList.add('invalid');
    }

    hideBackendError() {
        const modalHeading = this.signupForm.querySelector('.modal-heading');
        const authErrorMessage = this.signupForm.querySelector('.auth-error');
        authErrorMessage.textContent = '';
        authErrorMessage.style.display = 'none';
        modalHeading.style.marginBottom = '48px';
    }

    showToast(message, type = 'success') {
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
