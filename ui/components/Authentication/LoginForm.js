import { httpRequest } from '../../../utils/index.js';
import * as authHelpers from './index.js';

export class LoginForm {
    constructor({ loginForm, authModal, authBtns, updateCurrentUserAvatar }) {
        this.loginForm = loginForm;
        this.authModal = authModal;
        this.authBtns = authBtns;
        this.updateCurrentUserAvatar = updateCurrentUserAvatar;

        this.userInfo = document.querySelector('.user-info');
        this.authFormContent = loginForm.querySelector('.auth-form-content');
        this.submitFormBtn = loginForm.querySelector('.auth-submit-btn');
        this.email = loginForm.querySelector('#loginEmail');
        this.password = loginForm.querySelector('#loginPassword');
        this.eyeIcon = loginForm.querySelector('.eye-icon');

        this.isShowPassword = false;

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

        // Enable/disable submit button
        this.email.oninput = () => {
            this.toggleSubmitBtn();
            authHelpers.hideBackendError(this.loginForm);
        };

        this.password.oninput = () => {
            this.toggleSubmitBtn();
            authHelpers.hideBackendError(this.loginForm);
        };

        // Submit event
        this.authFormContent.addEventListener('submit', (e) =>
            this.handleSubmitForm(e)
        );
    }

    toggleSubmitBtn() {
        if (this.email.value === '' || this.password.value === '') {
            this.submitFormBtn.disabled = true;
            this.submitFormBtn.style.opacity = '0.3';
            this.submitFormBtn.style.cursor = 'not-allowed';
        } else {
            this.submitFormBtn.disabled = false;
            this.submitFormBtn.style.opacity = '1';
            this.submitFormBtn.style.cursor = 'pointer';
        }
    }

    async handleSubmitForm(e) {
        e.preventDefault();

        try {
            const credentials = {
                email: this.email.value.trim(),
                password: this.password.value.trim(),
            };

            const { user, access_token } = await httpRequest.post(
                'auth/login',
                credentials
            );

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('accessToken', access_token);
            authHelpers.handleAfterAuthSuccess({
                user,
                updateCurrentUserAvatar: this.updateCurrentUserAvatar,
                toastMsg: 'Login Successfully',
                authModal: this.authModal,
                authBtns: this.authBtns,
                userInfo: this.userInfo,
                authFormContent: this.authFormContent,
            });
        } catch (error) {
            authHelpers.handleSignupFailure(error, this.loginForm);
        }
    }
}
