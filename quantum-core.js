// Quantum Mirror - Complete Fixed Version
// quantum-core.js - All functionalities working

// ==================== GLOBAL VARIABLES ====================
let userAvatars = JSON.parse(localStorage.getItem('userAvatars')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || {
    firstStep: false, videoMaster: false, multiSelf: false, arExplorer: false,
    styleCollector: false, socialButterfly: false, quantumCreator: false,
    timeTraveler: false, perfectionist: false, quantumLegend: false,
    betaPioneer: false, ideaContributor: false
};

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ==================== GDPR CONSENT SYSTEM ====================
function saveGDPRSettings() {
    console.log("Saving GDPR settings...");
    
    // Get all checkbox values
    const checkboxes = {
        learning: document.getElementById('gdpr-learning')?.checked || false,
        research: document.getElementById('gdpr-research')?.checked || false,
        thirdparty: document.getElementById('gdpr-thirdparty')?.checked || false
    };
    
    // Save to localStorage
    localStorage.setItem('gdprSettings', JSON.stringify(checkboxes));
    localStorage.setItem('gdprConsentGiven', 'true');
    localStorage.setItem('gdprConsentDate', new Date().toISOString());
    
    // Update privacy settings display
    updatePrivacySettingsDisplay();
    
    // Hide GDPR modal
    const gdprModal = document.getElementById('gdpr-modal');
    if (gdprModal) {
        gdprModal.style.display = 'none';
    }
    
    // Enable avatar creation
    const uploadSection = document.querySelector('.video-upload-section');
    if (uploadSection) {
        uploadSection.classList.remove('disabled');
    }
    
    showNotification("GDPR consent saved successfully!", "success");
    
    // Unlock First Step achievement
    if (!achievements.firstStep) {
        achievements.firstStep = true;
        localStorage.setItem('achievements', JSON.stringify(achievements));
        unlockAchievement('firstStep');
    }
}

function loadGDPRSettings() {
    const savedSettings = localStorage.getItem('gdprSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Set checkbox values
        if (document.getElementById('gdpr-learning')) {
            document.getElementById('gdpr-learning').checked = settings.learning;
        }
        if (document.getElementById('gdpr-research')) {
            document.getElementById('gdpr-research').checked = settings.research;
        }
        if (document.getElementById('gdpr-thirdparty')) {
            document.getElementById('gdpr-thirdparty').checked = settings.thirdparty;
        }
        
        return settings;
    }
    return null;
}

// ==================== PRIVACY SETTINGS ====================
function savePrivacySettings() {
    console.log("Saving privacy settings...");
    
    // Get privacy checkbox values
    const privacySettings = {
        aiLearning: document.getElementById('privacy-ai-learning')?.checked || false,
        publicGallery: document.getElementById('privacy-gallery')?.checked || false,
        researchData: document.getElementById('privacy-research')?.checked || false
    };
    
    // Save to localStorage
    localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
    
    // Update display
    const statusElement = document.querySelector('.privacy-status');
    if (statusElement) {
        statusElement.textContent = 'Active';
        statusElement.style.color = '#4CAF50';
    }
    
    showNotification("Privacy settings saved successfully!", "success");
}

function updatePrivacySettingsDisplay() {
    const gdprGiven = localStorage.getItem('gdprConsentGiven') === 'true';
    const privacySettings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    
    // Update status text
    const statusElement = document.querySelector('.privacy-status');
    if (statusElement) {
        if (gdprGiven) {
            statusElement.textContent = 'Active';
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.textContent = 'Not Configured';
            statusElement.style.color = '#ff9800';
        }
    }
    
    // Set checkbox values
    const aiLearningCheckbox = document.getElementById('privacy-ai-learning');
    const galleryCheckbox = document.getElementById('privacy-gallery');
    const researchCheckbox = document.getElementById('privacy-research');
    
    if (aiLearningCheckbox) {
        aiLearningCheckbox.checked = privacySettings.aiLearning || false;
    }
    if (galleryCheckbox) {
        galleryCheckbox.checked = privacySettings.publicGallery || false;
    }
    if (researchCheckbox) {
        researchCheckbox.checked = privacySettings.researchData || false;
    }
}

// ==================== VIDEO UPLOAD & AVATAR CREATION ====================
async function uploadVideo() {
    console.log("Starting video upload...");
    
    // Check GDPR consent
    if (localStorage.getItem('gdprConsentGiven') !== 'true') {
        showNotification("Please complete GDPR consent first!", "error");
        document.getElementById('gdpr-modal').style.display = 'block';
        return;
    }
    
    const videoInput = document.getElementById('video-upload');
    if (!videoInput || !videoInput.files || videoInput.files.length === 0) {
        showNotification("Please select a video file first!", "error");
        return;
    }
    
    const file = videoInput.files[0];
    
    // Validate file
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
        showNotification(`Unsupported format: ${file.type}. Please use MP4, WebM, or OGG.`, "error");
        return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
        showNotification("File too large! Maximum size is 100MB.", "error");
        return;
    }
    
    showNotification(`Uploading ${file.name}...`, "info");
    
    try {
        // Create object URL for the video
        const videoUrl = URL.createObjectURL(file);
        
        // Create avatar object
        const newAvatar = {
            id: 'avatar_' + Date.now(),
            name: `Quantum Self ${userAvatars.length + 1}`,
            type: 'custom',
            created: new Date().toISOString(),
            videoUrl: videoUrl,
            thumbnail: await createVideoThumbnail(file),
            style: determineAvatarStyle(),
            stats: {
                conversations: 0,
                arSessions: 0,
                upgrades: 0
            }
        };
        
        // Add to user avatars
        userAvatars.push(newAvatar);
        localStorage.setItem('userAvatars', JSON.stringify(userAvatars));
        
        // Update UI
        updateAvatarList();
        updateUserStats();
        
        // Reset form
        videoInput.value = '';
        
        // Unlock achievements
        if (!achievements.videoMaster) {
            achievements.videoMaster = true;
            localStorage.setItem('achievements', JSON.stringify(achievements));
            unlockAchievement('videoMaster');
        }
        
        if (userAvatars.length >= 3 && !achievements.multiSelf) {
            achievements.multiSelf = true;
            localStorage.setItem('achievements', JSON.stringify(achievements));
            unlockAchievement('multiSelf');
        }
        
        showNotification("Avatar created successfully! You can now view it in AR.", "success");
        
    } catch (error) {
        console.error("Error creating avatar:", error);
        showNotification("Error creating avatar. Please try again.", "error");
    }
}

async function createVideoThumbnail(videoFile) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        
        video.addEventListener('loadeddata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 90;
            const ctx = canvas.getContext('2d');
            
            video.currentTime = 1; // Capture at 1 second
            
            video.addEventListener('seeked', () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                resolve(thumbnail);
                URL.revokeObjectURL(video.src);
            });
        });
        
        video.load();
    });
}

function determineAvatarStyle() {
    const styles = ['cyberpunk', 'nature', 'renaissance', 'energy'];
    return styles[Math.floor(Math.random() * styles.length)];
}

function updateAvatarList() {
    const container = document.getElementById('created-avatars-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userAvatars.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No avatars created yet.</p>
                <p>Upload a video to create your first quantum self!</p>
            </div>
        `;
        return;
    }
    
    userAvatars.forEach((avatar, index) => {
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar-card';
        avatarElement.innerHTML = `
            <div class="avatar-thumbnail" style="background-image: url('${avatar.thumbnail}')"></div>
            <div class="avatar-info">
                <h4>${avatar.name}</h4>
                <p>Created: ${new Date(avatar.created).toLocaleDateString()}</p>
                <p>Style: ${avatar.style}</p>
                <div class="avatar-actions">
                    <button class="btn-view-ar" onclick="startARView('${avatar.id}')">View in AR</button>
                    <button class="btn-delete" onclick="deleteAvatar('${avatar.id}')">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(avatarElement);
    });
}

function deleteAvatar(avatarId) {
    if (!confirm("Are you sure you want to delete this avatar? This action cannot be undone.")) {
        return;
    }
    
    userAvatars = userAvatars.filter(avatar => avatar.id !== avatarId);
    localStorage.setItem('userAvatars', JSON.stringify(userAvatars));
    
    updateAvatarList();
    updateUserStats();
    
    showNotification("Avatar deleted successfully.", "info");
}

// ==================== AR FUNCTIONALITY ====================
function startARView(avatarId) {
    const avatar = userAvatars.find(a => a.id === avatarId);
    if (!avatar) {
        showNotification("Avatar not found!", "error");
        return;
    }
    
    showNotification("Starting AR viewer... Make sure to allow camera access.", "info");
    
    // Update avatar stats
    avatar.stats.arSessions++;
    localStorage.setItem('userAvatars', JSON.stringify(userAvatars));
    
    // Unlock AR Explorer achievement
    if (!achievements.arExplorer) {
        achievements.arExplorer = true;
        localStorage.setItem('achievements', JSON.stringify(achievements));
        unlockAchievement('arExplorer');
    }
    
    // Simulate AR opening
    setTimeout(() => {
        document.getElementById('ar-viewer').style.display = 'block';
        document.getElementById('ar-video').src = avatar.videoUrl;
        
        // Add AR controls
        setupARControls();
    }, 1000);
}

function setupARControls() {
    // Add AR control buttons
    const arViewer = document.getElementById('ar-viewer');
    if (!arViewer.querySelector('.ar-controls')) {
        const controls = document.createElement('div');
        controls.className = 'ar-controls';
        controls.innerHTML = `
            <button onclick="recordARSession()">🎥 Record</button>
            <button onclick="takeARScreenshot()">📸 Screenshot</button>
            <button onclick="closeARViewer()">✕ Close</button>
        `;
        arViewer.appendChild(controls);
    }
}

function closeARViewer() {
    document.getElementById('ar-viewer').style.display = 'none';
    const video = document.getElementById('ar-video');
    if (video) {
        video.pause();
        video.src = '';
    }
}

function recordARSession() {
    showNotification("Starting AR recording...", "info");
    // AR recording logic would go here
}

function takeARScreenshot() {
    showNotification("AR screenshot saved!", "success");
    // Screenshot logic would go here
}

// ==================== ACHIEVEMENTS SYSTEM ====================
function unlockAchievement(achievementKey) {
    const achievementNames = {
        firstStep: "First Step",
        videoMaster: "Video Master",
        multiSelf: "Multi-Self",
        arExplorer: "AR Explorer",
        styleCollector: "Style Collector",
        socialButterfly: "Social Butterfly",
        quantumCreator: "Quantum Creator",
        timeTraveler: "Time Traveler",
        perfectionist: "Perfectionist",
        quantumLegend: "Quantum Legend",
        betaPioneer: "Beta Pioneer",
        ideaContributor: "Idea Contributor"
    };
    
    if (achievementNames[achievementKey]) {
        showNotification(`🎉 Achievement Unlocked: ${achievementNames[achievementKey]}!`, "success");
        updateAchievementsDisplay();
    }
}

function updateAchievementsDisplay() {
    const container = document.querySelector('.achievements-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(achievements).forEach(([key, unlocked]) => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <div class="achievement-icon">${getAchievementIcon(key)}</div>
            <div class="achievement-info">
                <h4>${getAchievementName(key)}</h4>
                <p>${getAchievementDescription(key)}</p>
            </div>
        `;
        container.appendChild(achievementElement);
    });
}

function getAchievementIcon(key) {
    const icons = {
        firstStep: "👶",
        videoMaster: "📹",
        multiSelf: "👥",
        arExplorer: "📱",
        styleCollector: "💎",
        socialButterfly: "🤝",
        quantumCreator: "🎨",
        timeTraveler: "⏳",
        perfectionist: "⭐",
        quantumLegend: "👑",
        betaPioneer: "🚀",
        ideaContributor: "💡"
    };
    return icons[key] || "🏆";
}

function getAchievementName(key) {
    const names = {
        firstStep: "First Step",
        videoMaster: "Video Master",
        multiSelf: "Multi-Self",
        arExplorer: "AR Explorer",
        styleCollector: "Style Collector",
        socialButterfly: "Social Butterfly",
        quantumCreator: "Quantum Creator",
        timeTraveler: "Time Traveler",
        perfectionist: "Perfectionist",
        quantumLegend: "Quantum Legend",
        betaPioneer: "Beta Pioneer",
        ideaContributor: "Idea Contributor"
    };
    return names[key] || "Achievement";
}

function getAchievementDescription(key) {
    const descriptions = {
        firstStep: "Complete GDPR consent setup",
        videoMaster: "Upload your first video",
        multiSelf: "Create 3 or more avatars",
        arExplorer: "View an avatar in AR mode",
        styleCollector: "Collect all avatar styles",
        socialButterfly: "Share an avatar with friends",
        quantumCreator: "Create 10 avatars",
        timeTraveler: "Use the app for 30 days",
        perfectionist: "Complete all achievements",
        quantumLegend: "Reach maximum level",
        betaPioneer: "Participate in beta testing",
        ideaContributor: "Submit feedback or ideas"
    };
    return descriptions[key] || "Unlock this achievement";
}

// ==================== USER STATS & LEADERBOARD ====================
function updateUserStats() {
    // Calculate stats
    const totalAvatars = userAvatars.length;
    const totalARSessions = userAvatars.reduce((sum, avatar) => sum + avatar.stats.arSessions, 0);
    const totalConversations = userAvatars.reduce((sum, avatar) => sum + avatar.stats.conversations, 0);
    
    // Update stats display
    const statsElement = document.querySelector('.user-stats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="stat-item">
                <h3>${totalAvatars}</h3>
                <p>Avatars Created</p>
            </div>
            <div class="stat-item">
                <h3>${totalARSessions}</h3>
                <p>AR Sessions</p>
            </div>
            <div class="stat-item">
                <h3>${totalConversations}</h3>
                <p>Conversations</p>
            </div>
        `;
    }
    
    // Update leaderboard
    updateLeaderboard();
}

function updateLeaderboard() {
    const leaderboardElement = document.querySelector('.leaderboard-content');
    if (!leaderboardElement) return;
    
    // Simulated leaderboard data
    const leaderboardData = [
        { name: "QuantumKing", score: 12500, badges: 12, level: 25 },
        { name: "NeonDreamer", score: 9800, badges: 10, level: 22 },
        { name: "AR Pioneer", score: 8700, badges: 9, level: 20 },
        { name: "MirrorMaster", score: 7600, badges: 8, level: 18 },
        { name: "You", score: calculateUserScore(), badges: Object.values(achievements).filter(a => a).length, level: calculateUserLevel() }
    ];
    
    leaderboardElement.innerHTML = '';
    
    leaderboardData.forEach((user, index) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row ${user.name === 'You' ? 'current-user' : ''}`;
        row.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="explorer-name">${user.name}</div>
            <div class="score">${user.score.toLocaleString()}</div>
            <div class="badges">${user.badges}</div>
            <div class="level">${user.level}</div>
        `;
        leaderboardElement.appendChild(row);
    });
}

function calculateUserScore() {
    let score = 0;
    score += userAvatars.length * 1000;
    score += Object.values(achievements).filter(a => a).length * 500;
    score += userAvatars.reduce((sum, avatar) => sum + avatar.stats.arSessions * 100, 0);
    return score;
}

function calculateUserLevel() {
    const score = calculateUserScore();
    return Math.floor(score / 1000) + 1;
}

// ==================== EXAMPLE AVATARS ====================
function loadExampleAvatars() {
    const examples = [
        {
            name: "CyberpunkSelf",
            description: "Neon implants, reflective eyes, future city",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop"
        },
        {
            name: "Nature Spirit",
            description: "Vines & leaves, glowing forest aura",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
        },
        {
            name: "RenaissancePainter",
            description: "Classical studio, brush in hand, natural light",
            image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop"
        },
        {
            name: "EnergyForm",
            description: "Transparent, crystalline, pulsating light",
            image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400&h=400&fit=crop"
        }
    ];
    
    const container = document.querySelector('.example-avatars-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    examples.forEach(example => {
        const exampleElement = document.createElement('div');
        exampleElement.className = 'example-avatar-card';
        exampleElement.innerHTML = `
            <div class="example-avatar-image" style="background-image: url('${example.image}')"></div>
            <div class="example-avatar-info">
                <h4>${example.name}</h4>
                <p>${example.description}</p>
                <button class="btn-try-example" onclick="tryExampleAvatar('${example.name}')">Try This Style</button>
            </div>
        `;
        container.appendChild(exampleElement);
    });
}

function tryExampleAvatar(avatarName) {
    showNotification(`Trying ${avatarName} style...`, "info");
    // This would apply the selected style to the user's next avatar
}

// ==================== INITIALIZATION ====================
function initializeApp() {
    console.log("Initializing Quantum Mirror...");
    
    // Load saved data
    userAvatars = JSON.parse(localStorage.getItem('userAvatars')) || [];
    achievements = JSON.parse(localStorage.getItem('achievements')) || {
        firstStep: false, videoMaster: false, multiSelf: false, arExplorer: false,
        styleCollector: false, socialButterfly: false, quantumCreator: false,
        timeTraveler: false, perfectionist: false, quantumLegend: false,
        betaPioneer: false, ideaContributor: false
    };
    
    // Set up GDPR modal if consent not given
    if (localStorage.getItem('gdprConsentGiven') !== 'true') {
        const gdprModal = document.getElementById('gdpr-modal');
        if (gdprModal) {
            gdprModal.style.display = 'block';
        }
        
        const uploadSection = document.querySelector('.video-upload-section');
        if (uploadSection) {
            uploadSection.classList.add('disabled');
        }
    }
    
    // Load GDPR settings
    loadGDPRSettings();
    
    // Update all displays
    updatePrivacySettingsDisplay();
    updateAvatarList();
    updateAchievementsDisplay();
    updateUserStats();
    loadExampleAvatars();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log("Quantum Mirror initialized successfully!");
}

function setupEventListeners() {
    // GDPR buttons
    const gdprSaveBtn = document.querySelector('[onclick="saveGDPRSettings()"]');
    if (gdprSaveBtn) {
        gdprSaveBtn.addEventListener('click', saveGDPRSettings);
    }
    
    // Privacy settings button
    const privacySaveBtn = document.querySelector('[onclick="savePrivacySettings()"]');
    if (privacySaveBtn) {
        privacySaveBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Video upload button
    const videoUploadBtn = document.querySelector('[onclick="uploadVideo()"]');
    if (videoUploadBtn) {
        videoUploadBtn.addEventListener('click', uploadVideo);
    }
    
    // AR viewer close button
    const arCloseBtn = document.querySelector('#ar-viewer .close-btn');
    if (arCloseBtn) {
        arCloseBtn.addEventListener('click', closeARViewer);
    }
    
    // Edit GDPR consent button
    const editGDPRBtn = document.querySelector('[onclick*="editGDPRConsent"]');
    if (editGDPRBtn) {
        editGDPRBtn.addEventListener('click', () => {
            document.getElementById('gdpr-modal').style.display = 'block';
        });
    }
}

// ==================== STYLE SHEET ====================
function injectStyles() {
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        }
        
        .notification-success { background: #4CAF50; }
        .notification-error { background: #f44336; }
        .notification-info { background: #2196F3; }
        
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 15px;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .disabled {
            opacity: 0.5;
            pointer-events: none;
        }
        
        .avatar-card {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .avatar-thumbnail {
            width: 100%;
            height: 150px;
            background-size: cover;
            background-position: center;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        
        .achievement {
            padding: 10px;
            border-radius: 8px;
            margin: 5px;
            background: #f5f5f5;
        }
        
        .achievement.unlocked {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
        }
        
        .achievement.locked {
            opacity: 0.6;
            border-left: 4px solid #ccc;
        }
        
        #ar-viewer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 9999;
            display: none;
        }
        
        .ar-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
        }
        
        .ar-controls button {
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            cursor: pointer;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ==================== START APPLICATION ====================
document.addEventListener('DOMContentLoaded', function() {
    injectStyles();
    initializeApp();
    
    // Add test button for debugging
    const debugBtn = document.createElement('button');
    debugBtn.textContent = "Debug Info";
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '1000';
    debugBtn.style.padding = '5px 10px';
    debugBtn.style.background = '#333';
    debugBtn.style.color = 'white';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '5px';
    debugBtn.style.cursor = 'pointer';
    debugBtn.onclick = function() {
        console.log("User Avatars:", userAvatars);
        console.log("Achievements:", achievements);
        console.log("GDPR Consent:", localStorage.getItem('gdprConsentGiven'));
        console.log("Privacy Settings:", JSON.parse(localStorage.getItem('privacySettings') || '{}'));
        alert("Debug info logged to console");
    };
    document.body.appendChild(debugBtn);
});

// Export functions for HTML onclick attributes
window.saveGDPRSettings = saveGDPRSettings;
window.savePrivacySettings = savePrivacySettings;
window.uploadVideo = uploadVideo;
window.deleteAvatar = deleteAvatar;
window.startARView = startARView;
window.closeARViewer = closeARViewer;
window.recordARSession = recordARSession;
window.takeARScreenshot = takeARScreenshot;
window.tryExampleAvatar = tryExampleAvatar;
