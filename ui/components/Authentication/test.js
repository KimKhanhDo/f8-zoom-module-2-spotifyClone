import { httpRequest, helpers } from '../../../utils/index.js';

export function initSignupForm({
    signupForm,
    authModal,
    authBtns,
    setUserAvatarInitial,
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
        isEmailValid = helpers.isValidatedEmail(email.value);
        toggleSubmitBtn();
        hideBackendError();
    };

    email.onblur = () => {
        if (
            email.value.trim() !== '' &&
            !helpers.isValidatedEmail(email.value)
        ) {
            showInputError(email);
        }
    };

    // Password validate
    password.oninput = () => {
        hideInputError(password);
        isPasswordValid = helpers.isValidatedPassword(password.value);
        toggleSubmitBtn();
        hideBackendError();
    };

    password.onblur = () => {
        if (
            password.value.trim() !== '' &&
            !helpers.isValidatedPassword(password.value)
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
            submitFormBtn.style.opacity = '0.4';
            submitFormBtn.style.cursor = 'not-allowed';
        }
    }

    function handleAfterSignupSuccess(user) {
        setUserAvatarInitial(user);
        helpers.showToast('Sign Up Successfully');

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
}
