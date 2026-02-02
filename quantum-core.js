class QuantumMirror {
    constructor() {
        this.gdprConsent = null;
        this.privacySettings = {};
        this.createdAvatars = [];
        this.currentVideo = null;
        this.currentAvatarStyle = null;
        this.init();
    }

    init() {
        console.log('🔮 Quantum Mirror initialized');
        this.loadSettings();
        this.bindEvents();
        this.checkGDPR();
        this.updateUI();
        this.createParticles();
        this.setupFAQ();
    }

    loadSettings() {
        // Načíta GDPR súhlas
        const savedGDPR = localStorage.getItem('quantum_gdpr_consent');
        if (savedGDPR) {
            this.gdprConsent = JSON.parse(savedGDPR);
            this.updateGDPRStatus();
        }

        // Načíta privacy nastavenia
        const savedPrivacy = localStorage.getItem('quantum_privacy_settings');
        if (savedPrivacy) {
            this.privacySettings = JSON.parse(savedPrivacy);
            this.updatePrivacyCheckboxes();
        }

        // Načíta vytvorených avatarov
        const savedAvatars = localStorage.getItem('quantum_created_avatars');
        if (savedAvatars) {
            this.createdAvatars = JSON.parse(savedAvatars);
            this.displayCreatedAvatars();
        }
    }

    bindEvents() {
        // GDPR Flow
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => this.nextGDPRStep(e));
        });
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', (e) => this.prevGDPRStep(e));
        });
        document.getElementById('savePrivacyFlow')?.addEventListener('click', () => this.saveGDPRSettings());
        document.getElementById('closePrivacyFlow')?.addEventListener('click', () => this.closeGDPRModal());
        document.getElementById('skipPrivacy')?.addEventListener('click', () => this.closeGDPRModal());

        // Checkboxy v GDPR flow
        document.querySelectorAll('.privacy-toggle input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => this.updateConsentSummary());
        });

        // Video upload
        document.getElementById('createVideoBtn')?.addEventListener('click', () => this.openUploadModal());
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeUploadModal());
        document.getElementById('cancelUpload')?.addEventListener('click', () => this.closeUploadModal());
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('videoInput')?.click());
        document.getElementById('videoInput')?.addEventListener('change', (e) => this.handleVideoUpload(e));
        document.getElementById('analyzeVideo')?.addEventListener('click', () => this.analyzeVideo());
        document.getElementById('backToUpload')?.addEventListener('click', () => this.backToUpload());
        document.getElementById('selectAvatar')?.addEventListener('click', () => this.createAvatar());

        // Avatar výber
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAvatarStyle(e));
        });

        // Privacy Settings v Settings page
        document.getElementById('savePrivacySettings')?.addEventListener('click', () => this.savePrivacySettings());
        document.getElementById('editGDPRBtn')?.addEventListener('click', () => this.openGDPRModal());

        // Navigácia
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => this.changePage(e));
        });

        // Play voice tlačidlá
        document.querySelectorAll('.play-voice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.playVoice(e));
        });

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.changeTheme(e));
        });
    }

    // GDPR FUNKCIE
    checkGDPR() {
        if (!this.gdprConsent) {
            this.openGDPRModal();
        }
    }

    openGDPRModal() {
        const modal = document.getElementById('privacyFlowModal');
        if (modal) {
            modal.style.display = 'flex';
            this.showGDPRStep(1);
        }
    }

    closeGDPRModal() {
        const modal = document.getElementById('privacyFlowModal');
        if (modal) modal.style.display = 'none';
    }

    showGDPRStep(stepNumber) {
        document.querySelectorAll('.privacy-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const step = document.getElementById(`privacyStep${stepNumber}`);
        if (step) step.classList.add('active');
        
        const progress = (stepNumber / 6) * 100;
        document.getElementById('gdprProgressFill').style.width = `${progress}%`;
        document.getElementById('gdprProgressText').textContent = `Step ${stepNumber} of 6`;
        
        if (stepNumber === 6) {
            this.updateConsentSummary();
            this.checkFinalConsent();
        }
    }

    nextGDPRStep(e) {
        e.preventDefault();
        const currentStep = document.querySelector('.privacy-step.active');
        const currentId = currentStep.id;
        const stepNum = parseInt(currentId.replace('privacyStep', ''));
        
        if (stepNum < 6) {
            this.showGDPRStep(stepNum + 1);
        }
    }

    prevGDPRStep(e) {
        e.preventDefault();
        const currentStep = document.querySelector('.privacy-step.active');
        const currentId = currentStep.id;
        const stepNum = parseInt(currentId.replace('privacyStep', ''));
        
        if (stepNum > 1) {
            this.showGDPRStep(stepNum - 1);
        }
    }

    updateConsentSummary() {
        const summary = document.getElementById('consentSummary');
        if (!summary) return;
        
        let html = '';
        
        const dataVideo = document.getElementById('dataVideo')?.checked;
        const dataBiometric = document.getElementById('dataBiometric')?.checked;
        const dataVoice = document.getElementById('dataVoice')?.checked;
        const dataTechnical = document.getElementById('dataTechnical')?.checked;
        
        if (dataVideo) html += '<div class="consent-item">✅ Video & Audio Data (Required)</div>';
        if (dataBiometric) html += '<div class="consent-item">✅ Biometric Data (Sensitive)</div>';
        if (dataVoice) html += '<div class="consent-item">✅ Voice Recording & Analysis</div>';
        if (dataTechnical) html += '<div class="consent-item">✅ Technical Data</div>';
        
        const retention = document.querySelector('input[name="retention"]:checked')?.value;
        if (retention) {
            html += `<div class="consent-item">✅ Data Retention: ${retention} days</div>`;
        }
        
        summary.innerHTML = html || '<div class="consent-item">No preferences selected yet</div>';
    }

    checkFinalConsent() {
        const saveBtn = document.getElementById('savePrivacyFlow');
        if (!saveBtn) return;
        
        const agreePrivacy = document.getElementById('agreePrivacy')?.checked;
        const agreeTerms = document.getElementById('agreeTerms')?.checked;
        const agreeAge = document.getElementById('agreeAge')?.checked;
        
        saveBtn.disabled = !(agreePrivacy && agreeTerms && agreeAge);
    }

    saveGDPRSettings() {
        // Získaj hodnoty z checkboxov
        const gdprData = {
            dataVideo: document.getElementById('dataVideo')?.checked || false,
            dataBiometric: document.getElementById('dataBiometric')?.checked || false,
            dataVoice: document.getElementById('dataVoice')?.checked || false,
            dataTechnical: document.getElementById('dataTechnical')?.checked || false,
            purposeAvatar: document.getElementById('purposeAvatar')?.checked || false,
            purposeImprove: document.getElementById('purposeImprove')?.checked || false,
            purposeResearch: document.getElementById('purposeResearch')?.checked || false,
            purposeMarketing: document.getElementById('purposeMarketing')?.checked || false,
            thirdCloud: document.getElementById('thirdCloud')?.checked || false,
            thirdAnalytics: document.getElementById('thirdAnalytics')?.checked || false,
            thirdPayment: document.getElementById('thirdPayment')?.checked || false,
            thirdResearch: document.getElementById('thirdResearch')?.checked || false,
            retention: document.querySelector('input[name="retention"]:checked')?.value || '180',
            agreePrivacy: document.getElementById('agreePrivacy')?.checked || false,
            agreeTerms: document.getElementById('agreeTerms')?.checked || false,
            agreeAge: document.getElementById('agreeAge')?.checked || false,
            date: new Date().toISOString()
        };
        
        // Ulož do localStorage
        localStorage.setItem('quantum_gdpr_consent', JSON.stringify(gdprData));
        this.gdprConsent = gdprData;
        
        // Zobraz notifikáciu
        this.showNotification('✅ GDPR consent saved successfully! You can now upload videos.', 'success');
        
        // Zatvor modal a aktualizuj UI
        this.closeGDPRModal();
        this.updateGDPRStatus();
    }

    updateGDPRStatus() {
        const statusEl = document.getElementById('gdprStatus');
        if (!statusEl) return;
        
        if (this.gdprConsent) {
            statusEl.innerHTML = '<span style="color: var(--success-color);">✅ GDPR configured on ' + 
                new Date(this.gdprConsent.date).toLocaleDateString() + '</span>';
            document.getElementById('statusText').textContent = '✅ GDPR complete - Ready to upload video!';
        } else {
            statusEl.innerHTML = '<span style="color: var(--error-color);">❌ GDPR not configured</span>';
        }
    }

    // VIDEO UPLOAD FUNKCIE
    openUploadModal() {
        // Skontroluj GDPR
        if (!this.gdprConsent) {
            this.showNotification('⚠️ Please complete GDPR consent first!', 'error');
            this.openGDPRModal();
            return;
        }
        
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.style.display = 'flex';
            this.showUploadStep(1);
        }
    }

    closeUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) modal.style.display = 'none';
        
        // Reset
        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview) {
            videoPreview.style.display = 'none';
            videoPreview.src = '';
        }
        
        const videoInput = document.getElementById('videoInput');
        if (videoInput) videoInput.value = '';
        
        document.getElementById('analyzeVideo').disabled = true;
        this.currentVideo = null;
    }

    showUploadStep(stepNumber) {
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const step = document.getElementById(`step${stepNumber}`);
        if (step) step.classList.add('active');
    }

    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Skontroluj formát
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('❌ Invalid video format. Please use MP4, WebM, or MOV.', 'error');
            return;
        }
        
        // Skontroluj veľkosť (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            this.showNotification('❌ Video file too large (max 100MB).', 'error');
            return;
        }
        
        // Vytvor URL pre video
        this.currentVideo = URL.createObjectURL(file);
        
        // Zobraz preview
        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview) {
            videoPreview.src = this.currentVideo;
            videoPreview.style.display = 'block';
            videoPreview.load();
        }
        
        // Povol tlačidlo Analyze
        document.getElementById('analyzeVideo').disabled = false;
        
        this.showNotification('✅ Video uploaded successfully! Click "Analyze with AI" to continue.', 'success');
    }

    analyzeVideo() {
        if (!this.currentVideo) {
            this.showNotification('❌ Please upload a video first.', 'error');
            return;
        }
        
        this.showUploadStep(2);
        
        // Simulácia AI analýzy (3 sekundy)
        setTimeout(() => {
            this.showUploadStep(3);
            this.showNotification('✅ AI analysis complete! Choose your quantum self.', 'success');
        }, 3000);
    }

    backToUpload() {
        this.showUploadStep(1);
    }

    selectAvatarStyle(event) {
        const option = event.currentTarget;
        
        // Odstráň "recommended" z predchádzajúceho
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('recommended');
        });
        
        // Pridaj aktuálnemu
        option.classList.add('recommended');
        this.currentAvatarStyle = option.getAttribute('data-style');
        
        this.showNotification(`✅ Selected: ${option.querySelector('.avatar-name').textContent}`, 'success');
    }

    createAvatar() {
        if (!this.currentAvatarStyle) {
            this.showNotification('❌ Please select an avatar style first.', 'error');
            return;
        }
        
        // Vytvor nový avatar objekt
        const newAvatar = {
            id: Date.now(),
            style: this.currentAvatarStyle,
            name: this.getAvatarName(this.currentAvatarStyle),
            image: this.getAvatarImage(this.currentAvatarStyle),
            date: new Date().toISOString(),
            match: Math.floor(Math.random() * 30) + 70 // 70-99%
        };
        
        // Pridaj do zoznamu
        this.createdAvatars.push(newAvatar);
        
        // Ulož do localStorage
        localStorage.setItem('quantum_created_avatars', JSON.stringify(this.createdAvatars));
        
        // Zobraz notifikáciu
        this.showNotification('🎉 Avatar created successfully!', 'success');
        
        // Zatvor modal
        this.closeUploadModal();
        
        // Aktualizuj UI
        this.displayCreatedAvatars();
        this.updateStats();
    }

    getAvatarName(style) {
        const names = {
            cyberpunk: 'CyberpunkSelf',
            nature: 'Nature Spirit',
            renaissance: 'RenaissancePainter',
            energy: 'EnergyForm'
        };
        return names[style] || 'Quantum Self';
    }

    getAvatarImage(style) {
        const images = {
            cyberpunk: 'https://i.postimg.cc/KRVTvk7m/kyborgpunk.png',
            nature: 'https://i.postimg.cc/Xph57GK4/chlapazena.png',
            renaissance: 'https://i.postimg.cc/F7qSsdbm/Renesance.png',
            energy: 'https://i.postimg.cc/PPcDrpbG/energyhuman.png'
        };
        return images[style] || 'https://i.postimg.cc/KRVTvk7m/kyborgpunk.png';
    }

    displayCreatedAvatars() {
        const container = document.getElementById('userAvatarsContainer');
        const slider = document.getElementById('userAvatarsSlider');
        
        if (!container || !slider) return;
        
        if (this.createdAvatars.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        slider.innerHTML = '';
        
        this.createdAvatars.forEach(avatar => {
            const avatarHTML = `
                <div class="avatar-item">
                    <div class="avatar-frame">
                        <img src="${avatar.image}" class="avatar-image" alt="${avatar.name}" width="200" height="200">
                    </div>
                    <h3 class="avatar-name">${avatar.name}</h3>
                    <p class="avatar-label">Created on ${new Date(avatar.date).toLocaleDateString()}</p>
                    <p class="avatar-label">Match: ${avatar.match}%</p>
                    <button class="play-voice-btn" onclick="quantumMirror.playAvatarVoice('${avatar.id}')">
                        <i class="fas fa-play-circle"></i> Play Voice
                    </button>
                    <button class="card-btn" onclick="quantumMirror.deleteAvatar('${avatar.id}')" style="margin-top: 10px; background: rgba(255,50,50,0.1); color: var(--error-color);">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            slider.innerHTML += avatarHTML;
        });
    }

    deleteAvatar(avatarId) {
        if (confirm('Are you sure you want to delete this avatar?')) {
            this.createdAvatars = this.createdAvatars.filter(avatar => avatar.id != avatarId);
            localStorage.setItem('quantum_created_avatars', JSON.stringify(this.createdAvatars));
            this.displayCreatedAvatars();
            this.updateStats();
            this.showNotification('🗑️ Avatar deleted successfully.', 'success');
        }
    }

    playAvatarVoice(avatarId) {
        const avatar = this.createdAvatars.find(a => a.id == avatarId);
        if (avatar) {
            this.showNotification(`🔊 Playing voice for ${avatar.name}...`, 'info');
            // Tu by bola skutočná logika prehrania hlasu
        }
    }

    // PRIVACY SETTINGS FUNKCIE (v Settings page)
    updatePrivacyCheckboxes() {
        if (!this.privacySettings) return;
        
        const checkboxes = {
            settingsTraining: 'aiLearning',
            settingsGallery: 'publicGallery',
            settingsResearch: 'researchData'
        };
        
        for (const [checkboxId, settingKey] of Object.entries(checkboxes)) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox && this.privacySettings[settingKey] !== undefined) {
                checkbox.checked = this.privacySettings[settingKey];
            }
        }
        
        const retentionSelect = document.getElementById('settingsRetention');
        if (retentionSelect && this.privacySettings.retention) {
            retentionSelect.value = this.privacySettings.retention;
        }
    }

    savePrivacySettings() {
        const privacyData = {
            aiLearning: document.getElementById('settingsTraining')?.checked || false,
            publicGallery: document.getElementById('settingsGallery')?.checked || false,
            researchData: document.getElementById('settingsResearch')?.checked || false,
            retention: document.getElementById('settingsRetention')?.value || '180',
            date: new Date().toISOString()
        };
        
        localStorage.setItem('quantum_privacy_settings', JSON.stringify(privacyData));
        this.privacySettings = privacyData;
        
        this.showNotification('✅ Privacy settings saved successfully!', 'success');
    }

    editGDPRConsent() {
        this.openGDPRModal();
    }

    // POMOCNÉ FUNKCIE
    showNotification(message, type = 'info') {
        // Odstráň existujúce notifikácie
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Zatváracie tlačidlo
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Automatické zatvorenie po 5 sekundách
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    updateStats() {
        document.getElementById('avatarCount').textContent = this.createdAvatars.length;
        document.getElementById('favoriteCount').textContent = '0';
        document.getElementById('weeklyAvatars').textContent = '0';
        document.getElementById('unlockedCount').textContent = '0/12';
        
        // Progress circle
        const progress = (this.createdAvatars.length / 10) * 100;
        const circle = document.querySelector('.circle');
        if (circle) {
            circle.style.strokeDasharray = `${progress}, 100`;
        }
    }

    changePage(event) {
        event.preventDefault();
        const page = event.currentTarget.getAttribute('data-page');
        
        // Aktualizuj aktívne tlačidlo v navigácii
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // Zmeň stránku
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');
    }

    playVoice(event) {
        const style = event.currentTarget.getAttribute('data-style');
        const styleNames = {
            cyberpunk: 'CyberpunkSelf',
            nature: 'Nature Spirit',
            renaissance: 'RenaissancePainter',
            energy: 'EnergyForm'
        };
        this.showNotification(`🔊 Playing voice sample for ${styleNames[style] || style}...`, 'info');
    }

    changeTheme(event) {
        const theme = event.currentTarget.getAttribute('data-theme');
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        document.body.className = theme === 'default' ? '' : `theme-${theme}`;
        
        localStorage.setItem('quantum_theme', theme);
        this.showNotification(`🎨 Theme changed to ${event.currentTarget.textContent}`, 'success');
    }

    updateUI() {
        // Načítaj tému
        const savedTheme = localStorage.getItem('quantum_theme');
        if (savedTheme && savedTheme !== 'default') {
            document.body.className = `theme-${savedTheme}`;
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.getAttribute('data-theme') === savedTheme) {
                    opt.classList.add('active');
                }
            });
        }
        
        this.updateGDPRStatus();
        this.updateStats();
    }

    createParticles() {
        const container = document.getElementById('galaxyBg');
        if (!container) return;
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 5 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            
            const animationType = Math.floor(Math.random() * 4);
            const duration = Math.random() * 20 + 10;
            particle.style.animationDuration = `${duration}s`;
            
            const animations = [
                'particleFloatUp',
                'particleFloatDown',
                'particleFloatLeft',
                'particleFloatRight'
            ];
            particle.style.animationName = animations[animationType];
            
            if (animationType === 0 || animationType === 1) {
                particle.style.setProperty('--particle-move-x', `${Math.random() * 100 - 50}px`);
            } else {
                particle.style.setProperty('--particle-move-y', `${Math.random() * 100 - 50}px`);
            }
            
            container.appendChild(particle);
        }
    }

    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');
            });
        });
    }
}

// Vytvor globálnu inštanciu
const quantumMirror = new QuantumMirror();

// Globálne funkcie pre tlačidlá v HTML
function checkAllAchievements() {
    quantumMirror.showNotification('🎖️ Checking achievements...', 'info');
}

function showLeaderboard() {
    document.getElementById('leaderboardSection').style.display = 'block';
    window.scrollTo({ top: document.getElementById('leaderboardSection').offsetTop, behavior: 'smooth' });
}

function hideLeaderboard() {
    document.getElementById('leaderboardSection').style.display = 'none';
}

function shareYourScore() {
    quantumMirror.showNotification('📤 Sharing feature coming soon!', 'info');
}

function startARCamera() {
    quantumMirror.showNotification('📱 AR camera requires HTTPS and device permissions.', 'info');
}

function fullscreenAR() {
    quantumMirror.showNotification('🖥️ Fullscreen mode activated.', 'success');
}

function recordAR() {
    quantumMirror.showNotification('🎥 Recording AR session...', 'info');
}

function connectVR() {
    quantumMirror.showNotification('🕶️ Connecting to VR headset...', 'info');
}

function multiplayerVR() {
    quantumMirror.showNotification('👥 Joining multiplayer VR...', 'info');
}

function vrControls() {
    quantumMirror.showNotification('🎮 Configuring VR controls...', 'info');
}

function saveProfile() {
    quantumMirror.showNotification('✅ Profile saved successfully!', 'success');
}

function testVoice() {
    quantumMirror.showNotification('🔊 Playing test voice message...', 'info');
}

// Pridaj event listener pre GDPR checkboxy
document.addEventListener('DOMContentLoaded', function() {
    // Toto spustí checkFinalConsent keď sa zmenia checkboxy
    document.querySelectorAll('#agreePrivacy, #agreeTerms, #agreeAge').forEach(cb => {
        cb.addEventListener('change', () => quantumMirror.checkFinalConsent());
    });
});
/ Quantum Mirror core - initial upload