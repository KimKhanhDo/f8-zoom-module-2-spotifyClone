import { playerData } from './data/index.js';
import {
    getPlayerControllerInstance,
    renderPopularTracksSection,
    renderSidebarLeftSection,
    renderBiggestHitsSection,
    renderPopularArtistsSection,
} from './ui/sectionRenderers.js';

class AppController {
    constructor() {
        this.playerController = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            renderSidebarLeftSection();
            renderBiggestHitsSection();
            renderPopularArtistsSection();

            this.playerController = getPlayerControllerInstance(
                this.onPlayerTrackChange.bind(this)
            );

            this.startPlayer();
        });
    }

    startPlayer() {
        const tracks = playerData.getAllTracks();
        renderPopularTracksSection(tracks, this.handleTrackSelect.bind(this));
        this.playerController.updateProgressUI();
        this.playerController.loadCurrentTrack();
    }

    handleTrackSelect(trackIndex) {
        playerData.setCurrentIndex(trackIndex);

        this.playerController.loadCurrentTrack();

        renderPopularTracksSection(
            playerData.getAllTracks(),
            this.handleTrackSelect.bind(this)
        );
    }

    onPlayerTrackChange() {
        renderPopularTracksSection(
            playerData.getAllTracks(),
            this.handleTrackSelect.bind(this)
        );
    }
}

const appController = new AppController();
export default appController;
