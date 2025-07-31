import * as playerLogic from './playerLogic.js';

export function setupPlayerControls() {
    const togglePlayBtns = document.querySelectorAll('.toggle-play-btn');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.previous-btn');
    const progressBar = document.querySelector('.progress-bar');
    const loopBtn = document.querySelector('.loop-btn');
    const randomBtn = document.querySelector('.random-btn');

    togglePlayBtns.forEach((btn) =>
        btn.addEventListener('click', () => playerLogic.togglePlay())
    );

    nextBtn.addEventListener('click', () => playerLogic.handleNextTrack());
    prevBtn.addEventListener('click', () => playerLogic.handlePreviousTrack());
    loopBtn.addEventListener('click', () => playerLogic.handleLoopState());
    randomBtn.addEventListener('click', () => playerLogic.handleRandomState());

    progressBar.addEventListener('click', (e) =>
        playerLogic.handleSeekTrack(e, progressBar)
    );

    // Event âm lượng, tiến độ, v.v. có thể thêm ở đây
}
