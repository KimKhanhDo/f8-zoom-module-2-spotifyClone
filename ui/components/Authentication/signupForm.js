import { httpRequest } from '../../../utils/index.js';
import * as authHelpers from './index.js';

export class SignupForm {
    constructor({ signupForm, authModal, authBtns, setUserAvatarInitial }) {
        this.signupForm = signupForm;
        this.authModal = authModal;
        this.authBtns = authBtns;
        this.setUserAvatarInitial = setUserAvatarInitial;

        this.userInfo = document.querySelector('.user-info');
        this.authFormContent = signupForm.querySelector('.auth-form-content');
        this.submitFormBtn = signupForm.querySelector('.auth-submit-btn');
        this.username = signupForm.querySelector('#signupUsername');
        this.email = signupForm.querySelector('#signupEmail');
        this.password = signupForm.querySelector('#signupPassword');
        this.eyeIcon = signupForm.querySelector('.eye-icon');

        // State
        this.isShowPassword = false;
        this.isUsernameValid = false;
        this.isEmailValid = false;
        this.isPasswordValid = false;

        this._initEvents();
    }

    _initEvents() {
        // Eye icon show/hide password
        this.eyeIcon.onclick = () => {
            this.isShowPassword = authHelpers.togglePasswordVisibility({
                isShowPassword: this.isShowPassword,
                passwordInput: this.password,
                eyeIcon: this.eyeIcon,
            });
        };

        // Username validate
        this.username.oninput = () => {
            this.hideInputError(this.username);
            this.isUsernameValid = authHelpers.isValidatedUsername(
                this.username.value
            );
            this.toggleSubmitBtn();
            authHelpers.hideBackendError(this.signupForm);
        };

        this.username.onblur = () => {
            if (
                this.username.value.trim() !== '' &&
                !authHelpers.isValidatedUsername(this.username.value)
            ) {
                this.showInputError(this.username);
            }
        };

        // Email validate
        this.email.oninput = () => {
            this.hideInputError(this.email);
            this.isEmailValid = authHelpers.isValidatedEmail(this.email.value);
            this.toggleSubmitBtn();
            authHelpers.hideBackendError(this.signupForm);
        };

        this.email.onblur = () => {
            if (
                this.email.value.trim() !== '' &&
                !authHelpers.isValidatedEmail(this.email.value)
            ) {
                this.showInputError(this.email);
            }
        };

        // Password validate
        this.password.oninput = () => {
            this.hideInputError(this.password);
            this.isPasswordValid = authHelpers.isValidatedPassword(
                this.password.value
            );
            this.toggleSubmitBtn();
            authHelpers.hideBackendError(this.signupForm);
        };

        this.password.onblur = () => {
            if (
                this.password.value.trim() !== '' &&
                !authHelpers.isValidatedPassword(this.password.value)
            ) {
                this.showInputError(this.password);
            }
        };

        // Submit event
        this.authFormContent.addEventListener('submit', (e) =>
            this.handleSubmitForm(e)
        );
    }

    toggleSubmitBtn() {
        if (this.isEmailValid && this.isPasswordValid && this.isUsernameValid) {
            this.submitFormBtn.disabled = false;
            this.submitFormBtn.style.opacity = '1';
            this.submitFormBtn.style.cursor = 'pointer';
        } else {
            this.submitFormBtn.disabled = true;
            this.submitFormBtn.style.opacity = '0.3';
            this.submitFormBtn.style.cursor = 'not-allowed';
        }
    }

    async handleSubmitForm(e) {
        e.preventDefault();
        const credentials = {
            username: this.username.value,
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
            authHelpers.handleAfterAuthSuccess({
                user,
                setUserAvatarInitial: this.setUserAvatarInitial,
                toastMsg: 'Sign Up Successfully',
                authModal: this.authModal,
                authBtns: this.authBtns,
                userInfo: this.userInfo,
                authFormContent: this.authFormContent,
            });
        } catch (error) {
            authHelpers.handleSignupFailure(error, this.signupForm);
        }
    }

    hideInputError(element) {
        element.closest('.form-group').classList.remove('invalid');
    }

    showInputError(element) {
        element.closest('.form-group').classList.add('invalid');
    }
}
