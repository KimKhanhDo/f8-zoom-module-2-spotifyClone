/**
 * playerData.js: "Tôi giữ và cập nhật trạng thái"

- Bộ não quản lý dữ liệu, trạng thái (state) toàn app: 
    tracks, currentIndex, currentTrack, shuffle, repeat…

- Chỉ chứa hàm liên quan đến DATA, STATE: 
    setTracks, getAllTracks, getCurrentIndex, setCurrentIndex, getCurrentTrack, nextTrack, prevTrack, shuffleTrack…

- Các module khác chỉ cần “xin” dữ liệu state thông qua các hàm getter/setter.
 */

let tracks = [];
let currentIndex = 0;

export function setTracks(data) {
    tracks = data;
    currentIndex = 0; // reset về 0 mỗi lần load list mới
}

export function getCurrentIndex() {
    return currentIndex;
}

export function getAllTracks() {
    return tracks;
}

export function getCurrentTrack() {
    return tracks[currentIndex] || null;
}

export function setCurrentIndex(index) {
    currentIndex = index;
}

function navigationTrack(mode = 'next') {
    if (tracks.length === 0) return;

    switch (mode) {
        case 'next':
            currentIndex = (currentIndex + 1) % tracks.length;
            break;

        case 'prev':
            currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
            break;

        case 'random':
            let randomIndex;

            // Nếu danh sách có nhiều bài, tránh random trùng lại bài đang phát
            if (tracks.length > 1) {
                do {
                    randomIndex = Math.floor(Math.random() * tracks.length);
                } while (randomIndex === currentIndex);
                currentIndex = randomIndex;
            } else {
                //Nếu danh sách chỉ có 1 bài, luôn trả về bài đó.
                currentIndex = 0;
            }
            break;

        default:
            console.warn('Invalid mode:', mode);
    }
    return getCurrentTrack();
}

// Chuyển tới bài tiếp theo
export function getNextTrack() {
    return navigationTrack('next');
}

// Quay lại bài trước
export function getPrevTrack() {
    return navigationTrack('prev');
}

// Lấy bài random
export function getRandomTrack() {
    return navigationTrack('random');
}
