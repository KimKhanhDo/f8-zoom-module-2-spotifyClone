export function togglePasswordVisibility({
    isShowPassword,
    passwordInput,
    eyeIcon,
}) {
    const newShowState = !isShowPassword;
    if (newShowState) {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
        eyeIcon.style.color = '#169c46';
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
        eyeIcon.style.color = '#b3b3b3';
    }
    return newShowState; // Trả về trạng thái mới
}

// Show toast message
export function showToast(message, type = 'success') {
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

export function isValidatedEmail(email) {
    const regex = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$');
    return regex.test(email);
}

export function isValidatedPassword(password) {
    const regex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{6,}$'
    );
    return regex.test(password);
}

function extractBackendErrorMsg(error) {
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

export function hideBackendError(formElement) {
    const modalHeading = formElement.querySelector('.modal-heading');
    const authErrorMessage = formElement.querySelector('.auth-error');

    authErrorMessage.textContent = '';
    authErrorMessage.style.display = 'none';
    modalHeading.style.marginBottom = '48px';
}

export function handleAfterAuthSuccess({
    user,
    updateCurrentUserAvatar,
    toastMsg,
    authModal,
    authBtns,
    userInfo,
    authFormContent,
}) {
    updateCurrentUserAvatar(user);
    showToast(toastMsg);
    authModal.classList.remove('show');
    authBtns.classList.remove('show');
    userInfo.classList.add('show');
    authFormContent.reset();
}

export function handleSignupFailure(error, formElement) {
    const modalHeading = formElement.querySelector('.modal-heading');
    const authErrorMessage = formElement.querySelector('.auth-error');

    const msg = extractBackendErrorMsg(error);
    authErrorMessage.textContent = msg;
    authErrorMessage.style.display = 'block';
    modalHeading.style.marginBottom = '16px';
}
