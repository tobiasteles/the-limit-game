// public/js/game/game.js

// ======================
// Configurações do Jogo
// ======================
const config = {
    playerSpeed: 5,
    npcSpeed: 2,
    carSpeed: 3,
    cameraZoom: 1,
    maxZoom: 2,
    minZoom: 0.5
};

// ======================
// Estado do Jogo
// ======================
const gameState = {
    player: {
        x: 0,
        y: 0,
        health: 100,
        level: 1,
        inventory: []
    },
    npcs: [],
    cars: [],
    isPaused: false,
    currentMission: null,
    missions: [
        {
            id: 1,
            title: "Primeiros Passos",
            description: "Encontre o portal central",
            completed: false,
            objective: { type: "location", target: "portal" }
        }
    ]
};

// ======================
// Inicialização do Jogo
// ======================
function initGame() {
    setupPlayer();
    setupNPCs();
    setupCars();
    setupEventListeners();
    loadGameState();
    gameLoop();
}

// ======================
// Configuração do Jogador
// ======================
function setupPlayer() {
    const player = document.getElementById('player');
    player.style.transform = `translate(${window.innerWidth/2 - 12}px, ${window.innerHeight/2 - 12}px)`;
}

// ======================
// Sistema de NPCs
// ======================
function setupNPCs() {
    const npcs = document.querySelectorAll('.npc');
    npcs.forEach((npc, index) => {
        gameState.npcs.push({
            element: npc,
            x: parseInt(npc.style.left) || 0,
            y: parseInt(npc.style.top) || 0,
            dialog: [`NPC ${index + 1}: Bem-vindo à cidade!`, "Cuidado com os portais!"]
        });
    });
}

// ======================
// Sistema de Veículos
// ======================
function setupCars() {
    const cars = document.querySelectorAll('.car');
    cars.forEach(car => {
        gameState.cars.push({
            element: car,
            x: parseInt(car.style.left) || 0,
            direction: 'right'
        });
    });
}

// ======================
// Event Listeners
// ======================
function setupEventListeners() {
    // Controles do Jogador
    document.addEventListener('keydown', (e) => {
        if(gameState.isPaused) return;
        
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup':
            case 's': case 'arrowdown':
            case 'a': case 'arrowleft':
            case 'd': case 'arrowright':
                handlePlayerMovement(e.key);
                break;
            case ' ':
                handleInteraction();
                break;
            case 'escape':
                togglePauseMenu();
                break;
        }
    });

    // Controles da Câmera
    document.addEventListener('wheel', (e) => {
        if(gameState.isPaused) return;
        adjustZoom(e.deltaY * -0.01);
    });
}

// ======================
// Movimentação do Jogador
// ======================
function handlePlayerMovement(key) {
    const move = {
        x: key.includes('left') ? -config.playerSpeed : key.includes('right') ? config.playerSpeed : 0,
        y: key.includes('up') ? -config.playerSpeed : key.includes('down') ? config.playerSpeed : 0
    };

    const newX = gameState.player.x + move.x;
    const newY = gameState.player.y + move.y;

    if(!checkCollision(newX, newY)) {
        gameState.player.x = newX;
        gameState.player.y = newY;
        updatePlayerPosition();
        checkMissions();
    }
}

// ======================
// Sistema de Colisão
// ======================
function checkCollision(x, y) {
    const elements = document.querySelectorAll('.building, .park, .car');
    const playerRect = {
        left: x,
        top: y,
        right: x + 24,
        bottom: y + 24
    };

    return Array.from(elements).some(element => {
        const rect = element.getBoundingClientRect();
        return !(playerRect.right < rect.left || 
               playerRect.left > rect.right || 
               playerRect.bottom < rect.top || 
               playerRect.top > rect.bottom);
    });
}

// ======================
// Sistema de Missões
// ======================
function checkMissions() {
    gameState.missions.forEach(mission => {
        if(mission.completed) return;
        
        if(mission.objective.type === 'location') {
            const portal = document.querySelector('.portal');
            const portalRect = portal.getBoundingClientRect();
            
            if(checkProximity(gameState.player.x, gameState.player.y, 
                portalRect.left, portalRect.top, 50)) {
                completeMission(mission.id);
            }
        }
    });
}

function completeMission(missionId) {
    const mission = gameState.missions.find(m => m.id === missionId);
    if(mission) {
        mission.completed = true;
        showDialog(["Missão concluída: " + mission.title]);
        gameState.player.level++;
    }
}

// ======================
// Sistema de Diálogo
// ======================
function showDialog(messages, index = 0) {
    if(index >= messages.length) return;

    const dialog = document.createElement('div');
    dialog.className = 'dialog-box';
    dialog.innerHTML = `
        <p>${messages[index]}</p>
        <button class="dialog-next">Próximo</button>
    `;

    document.body.appendChild(dialog);
    
    dialog.querySelector('button').addEventListener('click', () => {
        dialog.remove();
        showDialog(messages, index + 1);
    });
}

// ======================
// Menu de Pause
// ======================
function togglePauseMenu() {
    gameState.isPaused = !gameState.isPaused;
    
    const pauseMenu = document.getElementById('pause-menu') || createPauseMenu();
    pauseMenu.style.display = gameState.isPaused ? 'block' : 'none';
}

function createPauseMenu() {
    const menu = document.createElement('div');
    menu.id = 'pause-menu';
    menu.innerHTML = `
        <h2>Jogo Pausado</h2>
        <button onclick="saveGameState()">Salvar Jogo</button>
        <button onclick="togglePauseMenu()">Continuar</button>
    `;
    document.body.appendChild(menu);
    return menu;
}

// ======================
// Sistema de Save/Load
// ======================
function saveGameState() {
    localStorage.setItem('gameSave', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('gameSave');
    if(saved) {
        Object.assign(gameState, JSON.parse(saved));
        updatePlayerPosition();
    }
}

// ======================
// Loop Principal
// ======================
function gameLoop() {
    if(gameState.isPaused) return;

    updateNPCs();
    updateCars();
    updateHUD();

    requestAnimationFrame(gameLoop);
}

// ======================
// Inicialização
// ======================
document.addEventListener('DOMContentLoaded', initGame);