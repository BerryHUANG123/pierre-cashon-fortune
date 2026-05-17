// ==================== 粒子特效引擎与音频系统 ====================
// 此文件包含 Canvas 粒子效果和 Web Audio 音频系统
// 依赖：state.js（skins 对象在 startEffectForSkin 中使用）

// ==================== 通用粒子特效引擎 ====================
class ParticleEffectEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.animationId = null;
        this.time = 0;
        this.customState = {};
        this.preset = null;
        this.presetId = null;
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.customState = {};
        this.time = 0;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    start(presetId) {
        const preset = ParticleEffectEngine.PRESETS[presetId];
        if (!preset) return;

        this.stop();
        this.presetId = presetId;
        this.preset = preset;
        this.particles = [];
        this.time = 0;
        this.customState = preset.initState ? preset.initState(this.canvas.width, this.canvas.height) : {};

        if (preset.createParticles) {
            this.particles = preset.createParticles(this.canvas.width, this.canvas.height);
        }

        this._animate();
    }

    _animate() {
        const preset = this.preset;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.time += preset.timeStep || 0.02;

        ctx.clearRect(0, 0, width, height);

        if (preset.drawBackground) {
            preset.drawBackground(ctx, width, height, this.time, this.customState, this.particles);
        }

        if (preset.updateParticles) {
            preset.updateParticles(this.particles, width, height, this.time, this.customState);
        }

        if (preset.drawParticles) {
            preset.drawParticles(ctx, this.particles, this.time, this.customState);
        }

        this.animationId = requestAnimationFrame(() => this._animate());
    }
}

// ==================== 特效预设定义 ====================
ParticleEffectEngine.PRESETS = {
    'royal': {
        timeStep: 0.02,
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h - h,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.3,
                    type: 'gold'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time) => {
            const glowSize = Math.sin(time) * 50 + 200;
            const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, glowSize);
            gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
            gradient.addColorStop(0.5, 'rgba(189, 76, 255, 0.05)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        },
        updateParticles: (particles, w, h) => {
            particles.forEach(p => {
                p.y += p.speed;
                if (p.y > h) {
                    p.y = -10;
                    p.x = Math.random() * w;
                }
            });
        },
        drawParticles: (ctx, particles) => {
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity * 0.3})`;
                ctx.fill();
            });
        }
    },

    'cyber': {
        timeStep: 0.02,
        initState: (w, h) => ({ scanLineY: 0, scanDirection: 1 }),
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 3 + 2,
                    opacity: Math.random() * 0.6 + 0.2,
                    type: 'data'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time, state) => {
            state.scanLineY += 2 * state.scanDirection;
            if (state.scanLineY >= h - 50 || state.scanLineY <= 50) {
                state.scanDirection *= -1;
            }

            const scanGradient = ctx.createLinearGradient(0, state.scanLineY - 20, 0, state.scanLineY + 20);
            scanGradient.addColorStop(0, 'transparent');
            scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
            scanGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = scanGradient;
            ctx.fillRect(0, state.scanLineY - 20, w, 40);

            ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        },
        updateParticles: (particles, w, h) => {
            particles.forEach(p => {
                p.y += p.speed;
                if (p.y > h) {
                    p.y = 0;
                    p.x = Math.random() * w;
                }
            });
        },
        drawParticles: (ctx, particles) => {
            particles.forEach(p => {
                const chars = '01';
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.font = `${p.size * 10}px monospace`;
                ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity})`;
                ctx.fillText(char, p.x, p.y);
            });
        }
    },

    'ghost': {
        timeStep: 0.02,
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 40; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 100 + 50,
                    speedX: Math.random() * 1 - 0.5,
                    speedY: Math.random() * 1 - 0.5,
                    opacity: Math.random() * 0.1 + 0.05,
                    type: 'smoke'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time) => {
            const glowSize = Math.sin(time * 0.5) * 30 + 150;
            const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, glowSize);
            gradient.addColorStop(0, 'rgba(255, 20, 20, 0.08)');
            gradient.addColorStop(0.5, 'rgba(100, 0, 0, 0.03)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        },
        updateParticles: (particles, w, h) => {
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < -p.size || p.x > w + p.size) p.speedX *= -1;
                if (p.y < -p.size || p.y > h + p.size) p.speedY *= -1;
            });
        },
        drawParticles: (ctx, particles) => {
            particles.forEach(p => {
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `rgba(50, 50, 50, ${p.opacity})`);
                gradient.addColorStop(0.5, `rgba(30, 30, 30, ${p.opacity * 0.5})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    },

    'gold': {
        timeStep: 0.03,
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 4 + 2,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.01,
                    opacity: Math.random() * 0.6 + 0.4,
                    type: 'diamond'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time) => {
            const glowOpacity = (Math.sin(time) + 1) / 2 * 0.1 + 0.05;
            const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${glowOpacity})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        },
        updateParticles: (particles, w, h, time) => {
            particles.forEach(p => {
                p.angle += p.speed;
            });
        },
        drawParticles: (ctx, particles, time) => {
            particles.forEach(p => {
                const centerX = ctx.canvas.width / 2 + Math.cos(p.angle) * 100;
                const centerY = ctx.canvas.height / 2 + Math.sin(p.angle) * 100;

                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i + time;
                    const r = i % 2 === 0 ? p.size * 3 : p.size;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity * 0.5})`;
                ctx.fill();
            });
        }
    },

    'aurora': {
        timeStep: 0.01,
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 60; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 1 + 0.5,
                    opacity: Math.random() * 0.5 + 0.3,
                    type: 'snow'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time) => {
            const auroraColors = [
                'rgba(100, 200, 255, 0.15)',
                'rgba(100, 255, 200, 0.15)',
                'rgba(200, 150, 255, 0.15)'
            ];

            for (let i = 0; i < 3; i++) {
                const gradient = ctx.createLinearGradient(0, h * 0.2 + Math.sin(time + i) * 50, 0, h * 0.6 + Math.sin(time + i + 1) * 50);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.5, auroraColors[i]);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(0, h * 0.3 + Math.sin(time + i) * 100);
                for (let x = 0; x <= w; x += 50) {
                    ctx.lineTo(x, h * 0.4 + Math.sin(time * 2 + x * 0.01 + i) * 80);
                }
                ctx.lineTo(w, h * 0.7);
                ctx.lineTo(0, h * 0.7);
                ctx.fill();
            }
        },
        updateParticles: (particles, w, h) => {
            particles.forEach(p => {
                p.y += p.speed;
                if (p.y > h) {
                    p.y = -10;
                    p.x = Math.random() * w;
                }
            });
        },
        drawParticles: (ctx, particles) => {
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
        }
    },

    'fire': {
        timeStep: 0.05,
        createParticles: (w, h) => {
            const particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: h + Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 3 + 2,
                    angle: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.7 + 0.3,
                    life: Math.random() * 100 + 50,
                    type: 'spark'
                });
            }
            return particles;
        },
        drawBackground: (ctx, w, h, time) => {
            const fireGradient = ctx.createLinearGradient(0, h - 200, 0, h);
            fireGradient.addColorStop(0, 'transparent');
            fireGradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.1 + Math.sin(time) * 0.05})`);
            fireGradient.addColorStop(1, `rgba(255, 50, 0, ${0.2 + Math.sin(time * 2) * 0.1})`);
            ctx.fillStyle = fireGradient;
            ctx.fillRect(0, h - 200, w, 200);
        },
        updateParticles: (particles, w, h) => {
            particles.forEach(p => {
                p.y -= p.speed;
                p.x += p.angle * p.speed;
                p.life--;
                p.opacity = p.life / 150;

                if (p.life <= 0 || p.y < -50 || p.x < -50 || p.x > w + 50) {
                    p.y = h + Math.random() * 100;
                    p.x = Math.random() * w;
                    p.life = Math.random() * 100 + 50;
                    p.opacity = Math.random() * 0.7 + 0.3;
                }
            });
        },
        drawParticles: (ctx, particles) => {
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                const sparkColor = p.opacity > 0.7 ? '#ffff00' : '#ff6600';
                ctx.fillStyle = `${sparkColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();

                if (p.opacity > 0.3) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y + p.speed * 2, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 100, 0, ${p.opacity * 0.5})`;
                    ctx.fill();
                }
            });
        }
    }
};

// ==================== 特效系统变量 ====================
let effectCanvas = null;
let effectCtx = null;
let effectParticles = [];
let particleEngine = null;

function initEffectCanvas() {
    effectCanvas = document.getElementById('effectCanvas');
    effectCtx = effectCanvas.getContext('2d');
    particleEngine = new ParticleEffectEngine(effectCanvas, effectCtx);
    resizeEffectCanvas();
    window.addEventListener('resize', resizeEffectCanvas);
}

function resizeEffectCanvas() {
    if (effectCanvas) {
        effectCanvas.width = window.innerWidth;
        effectCanvas.height = window.innerHeight;
    }
}

function stopEffect() {
    if (particleEngine) {
        particleEngine.stop();
    }
}

function startEffectForSkin(skinId) {
    const skin = skins[skinId];
    if (!skin || skin.specialEffects === 'none') {
        stopEffect();
        return;
    }

    if (particleEngine) {
        particleEngine.start(skin.specialEffects);
    }
}

// ==================== 音频系统 ====================
let audioContext = null;

/**
 * 获取 AudioContext 实例（延迟初始化，兼容浏览器自动播放策略）
 */
function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function playSound(type) {
    if (!soundEnabled) return;

    const oscillator = getAudioContext().createOscillator();
    const gainNode = getAudioContext().createGain();

    oscillator.connect(gainNode);
    gainNode.connect(getAudioContext().destination);

    const now = getAudioContext().currentTime;

    switch(type) {
        case 'shuffle':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            oscillator.start(now);
            oscillator.stop(now + 0.05);
            break;

        case 'reveal':
            playChord([523.25, 659.25, 783.99], 0.3);
            break;

        case 'legend':
            playChord([261.63, 329.63, 392.00, 523.25], 0.8);
            setTimeout(() => playSweep(523.25, 1046.50, 1.0), 400);
            break;

        case 'high':
            playSweep(440, 880, 0.5);
            break;

        case 'medium':
            playSweep(330, 440, 0.4);
            break;

        case 'low':
            playSweep(440, 220, 0.5);
            break;

        case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
    }
}

function playChord(frequencies, duration) {
    frequencies.forEach((freq, index) => {
        const oscillator = getAudioContext().createOscillator();
        const gainNode = getAudioContext().createGain();

        oscillator.connect(gainNode);
        gainNode.connect(getAudioContext().destination);

        const now = getAudioContext().currentTime + (index * 0.05);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    });
}

function playSweep(startFreq, endFreq, duration) {
    const oscillator = getAudioContext().createOscillator();
    const gainNode = getAudioContext().createGain();

    oscillator.connect(gainNode);
    gainNode.connect(getAudioContext().destination);

    const now = getAudioContext().currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

function playUnlockSound() {
    try {
        const oscillator = getAudioContext().createOscillator();
        const gainNode = getAudioContext().createGain();

        oscillator.connect(gainNode);
        gainNode.connect(getAudioContext().destination);

        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, getAudioContext().currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, getAudioContext().currentTime + 0.5);

        oscillator.start(getAudioContext().currentTime);
        oscillator.stop(getAudioContext().currentTime + 0.5);
    } catch (e) {
        console.error('音效播放失败:', e);
    }
}

// ==================== 背景音乐系统 ====================
function playJazzMusic() {
    if (!ownedSounds.jazz || !soundEnabled) {
        stopBgMusic();
        return;
    }

    stopBgMusic();
    bgMusicPlaying = true;

    const jazzChords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [329.63, 415.30, 493.88, 622.25], // Dm7
        [392.00, 493.88, 587.33, 739.99], // Em7
        [349.23, 440.00, 523.25, 659.25]  // Fmaj7
    ];

    let chordIndex = 0;
    const chordDuration = 2000;

    const playJazzChord = () => {
        if (!bgMusicPlaying || !ownedSounds.jazz || !soundEnabled) {
            stopBgMusic();
            return;
        }

        const chord = jazzChords[chordIndex];
        chord.forEach((freq, i) => {
            const oscillator = getAudioContext().createOscillator();
            const gainNode = getAudioContext().createGain();

            oscillator.connect(gainNode);
            gainNode.connect(getAudioContext().destination);

            const now = getAudioContext().currentTime + (i * 0.1);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.03, now + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + chordDuration - 200);

            oscillator.start(now);
            oscillator.stop(now + chordDuration);

            activeOscillators.push(oscillator);

            setTimeout(() => {
                const index = activeOscillators.indexOf(oscillator);
                if (index > -1) {
                    activeOscillators.splice(index, 1);
                }
            }, chordDuration + 100);
        });

        chordIndex = (chordIndex + 1) % jazzChords.length;
    };

    playJazzChord();
    currentBgMusic = setInterval(playJazzChord, chordDuration);
}

function playElectronicMusic() {
    if (!ownedSounds.electronic || !soundEnabled) {
        stopBgMusic();
        return;
    }

    stopBgMusic();
    bgMusicPlaying = true;

    const beatDuration = 500;

    const playBeat = () => {
        if (!bgMusicPlaying || !ownedSounds.electronic || !soundEnabled) {
            stopBgMusic();
            return;
        }

        const oscillator = getAudioContext().createOscillator();
        const gainNode = getAudioContext().createGain();

        oscillator.connect(gainNode);
        gainNode.connect(getAudioContext().destination);

        const now = getAudioContext().currentTime;

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(110, now);

        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);

        activeOscillators.push(oscillator);

        setTimeout(() => {
            const index = activeOscillators.indexOf(oscillator);
            if (index > -1) {
                activeOscillators.splice(index, 1);
            }
        }, 400);
    };

    playBeat();
    currentBgMusic = setInterval(playBeat, beatDuration);
}

function stopAllOscillators() {
    const now = getAudioContext().currentTime;
    activeOscillators.forEach(osc => {
        try {
            if (osc && !osc.stopped) {
                osc.stop(now);
            }
        } catch (e) {
            // 忽略已经停止的 oscillator
        }
    });
    activeOscillators = [];
}

function stopBgMusic() {
    if (currentBgMusic) {
        clearInterval(currentBgMusic);
        currentBgMusic = null;
    }
    stopAllOscillators();
    setTimeout(() => stopAllOscillators(), 10);
    setTimeout(() => stopAllOscillators(), 50);
    bgMusicPlaying = false;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    soundBtn.classList.toggle('muted', !soundEnabled);
    playSound('click');

    if (!soundEnabled && bgMusicPlaying) {
        stopBgMusic();
        updateBgmButton();
    }
}

function toggleBgMusic() {
    if (bgMusicPlaying) {
        stopBgMusic();
    } else {
        if (ownedSounds.jazz) {
            playJazzMusic();
        } else if (ownedSounds.electronic) {
            playElectronicMusic();
        } else {
            showTooltip('请先在商店购买音效包！', 'error', 3500);
            return;
        }
    }
    updateBgmButton();
}

function updateBgmButton() {
    const bgmBtn = document.getElementById('bgmBtn');
    if (ownedSounds.jazz || ownedSounds.electronic) {
        bgmBtn.style.display = 'inline-block';
        bgmBtn.classList.toggle('playing', bgMusicPlaying);
        bgmBtn.textContent = bgMusicPlaying ? '⏸️ 暂停' : '🎵 音乐';
    } else {
        bgmBtn.style.display = 'none';
    }
}
