// ==================== audio.js — Web Audio API 音效系统 ====================

const audioManager = {
    ctx: null,
    muted: false,

    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('AudioContext not supported');
            }
        }
        this.muted = (typeof playerData !== 'undefined' && playerData.muted) || false;
    },

    play(type) {
        if (this.muted) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        // 恢复挂起的context
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        switch (type) {
            case 'cultivate':
                this.tone(200, 0.5, 'sine', 0.15);
                break;
            case 'breakthrough_success':
                this.sweep(800, 1200, 1.0, 'triangle', 0.2);
                break;
            case 'breakthrough_fail':
                this.tone(150, 0.8, 'sawtooth', 0.15);
                break;
            case 'encounter':
                // 古筝泛音 - 随机高频
                const freq = 600 + Math.random() * 800;
                this.tone(freq, 0.4, 'sine', 0.12);
                setTimeout(() => this.tone(freq * 1.5, 0.3, 'sine', 0.08), 150);
                break;
            case 'achievement':
                this.tone(1000, 0.3, 'sine', 0.15);
                setTimeout(() => this.tone(1500, 0.2, 'sine', 0.1), 100);
                break;
            case 'click':
                this.tone(600, 0.1, 'sine', 0.1);
                break;
            case 'levelup':
                this.tone(440, 0.15, 'sine', 0.12);
                setTimeout(() => this.tone(660, 0.15, 'sine', 0.12), 100);
                break;
        }
    },

    tone(freq, duration, waveType = 'sine', volume = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = waveType;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    },

    sweep(startFreq, endFreq, duration, waveType = 'sine', volume = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }
};

// 首次用户交互时初始化音频
document.addEventListener('click', function initAudio() {
    audioManager.init();
    if (audio.ctx && audio.ctx.state === 'suspended') {
        audio.ctx.resume();
    }
    document.removeEventListener('click', initAudio);
}, { once: true });
