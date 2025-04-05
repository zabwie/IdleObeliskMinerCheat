const { ipcRenderer } = require('electron');

// Game variables
let gameData = {
  stones: 0,
  gems: 0,
  relics: 0,
  gameSpeed: 1,
  upgrades: {}
};

// DOM Elements
const stonesInput = document.getElementById('stones');
const gemsInput = document.getElementById('gems');
const relicsInput = document.getElementById('relics');
const gameSpeedInput = document.getElementById('game-speed');
const statusMessage = document.getElementById('status-message');

// Helper function to show status messages
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'error' : 'success';
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = '';
  }, 3000);
}

// Function to find and modify game data in localStorage
function modifyGameData(key, value) {
  try {
    // Attempt to find the game's localStorage key
    // This will need to be adjusted based on the actual game's storage pattern
    const storageKeys = Object.keys(localStorage);
    const gameStorageKey = storageKeys.find(key => 
      key.includes('IdleObeliskMiner') || 
      key.includes('obelisk') || 
      localStorage[key].includes('stones') || 
      localStorage[key].includes('gems')
    );
    
    if (!gameStorageKey) {
      showStatus('Game save data not found. Make sure the game is running.', true);
      return false;
    }
    
    // Parse the game data
    let saveData = JSON.parse(localStorage[gameStorageKey]);
    
    // Modify the specified property
    // This structure will need to be adjusted based on the actual game's data structure
    if (key.includes('.')) {
      // Handle nested properties
      const parts = key.split('.');
      let current = saveData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      // Handle top-level properties
      saveData[key] = value;
    }
    
    // Save the modified data back to localStorage
    localStorage[gameStorageKey] = JSON.stringify(saveData);
    
    return true;
  } catch (error) {
    console.error('Error modifying game data:', error);
    showStatus('Error modifying game data: ' + error.message, true);
    return false;
  }
}

// Event listeners for the cheat buttons
document.getElementById('set-stones').addEventListener('click', () => {
  const value = parseInt(stonesInput.value);
  if (modifyGameData('stones', value)) {
    gameData.stones = value;
    showStatus(`Stones set to ${value}`);
  }
});

document.getElementById('set-gems').addEventListener('click', () => {
  const value = parseInt(gemsInput.value);
  if (modifyGameData('gems', value)) {
    gameData.gems = value;
    showStatus(`Gems set to ${value}`);
  }
});

document.getElementById('set-relics').addEventListener('click', () => {
  const value = parseInt(relicsInput.value);
  if (modifyGameData('relics', value)) {
    gameData.relics = value;
    showStatus(`Relics set to ${value}`);
  }
});

document.getElementById('set-speed').addEventListener('click', () => {
  const value = parseInt(gameSpeedInput.value);
  // This would need to hook into the game's update loop
  // For now, we'll just store the value
  gameData.gameSpeed = value;
  showStatus(`Game speed set to ${value}x`);
  
  // This is a placeholder - actual implementation would depend on how the game handles time
  injectGameSpeedHack(value);
});

document.getElementById('unlock-all').addEventListener('click', () => {
  // This would need to be customized based on the game's upgrade system
  unlockAllUpgrades();
  showStatus('All upgrades unlocked');
});

document.getElementById('save-game').addEventListener('click', () => {
  ipcRenderer.send('save-game-data', gameData);
});

document.getElementById('load-game').addEventListener('click', () => {
  ipcRenderer.send('load-game-data');
});

// IPC handlers for save/load responses
ipcRenderer.on('save-complete', (event, success) => {
  if (success) {
    showStatus('Game state saved successfully');
  } else {
    showStatus('Failed to save game state', true);
  }
});

ipcRenderer.on('load-complete', (event, data) => {
  if (data) {
    gameData = data;
    stonesInput.value = gameData.stones;
    gemsInput.value = gameData.gems;
    relicsInput.value = gameData.relics;
    gameSpeedInput.value = gameData.gameSpeed;
    showStatus('Game state loaded successfully');
  } else {
    showStatus('No saved game state found', true);
  }
});

// Function to inject game speed hack
function injectGameSpeedHack(speedMultiplier) {
  // This is a placeholder - actual implementation would depend on the game's code
  // We would need to find the game's update/tick function and modify it
  
  // Example of what this might look like:
  try {
    // This assumes the game is running in the same context, which it likely isn't
    // In reality, we would need to inject this into the game's window context
    const gameWindow = window.open('', 'IdleObeliskMiner');
    if (!gameWindow) {
      showStatus('Could not access game window. Make sure the game is running.', true);
      return;
    }
    
    // Override the game's requestAnimationFrame to control game speed
    const originalRAF = gameWindow.requestAnimationFrame;
    gameWindow.requestAnimationFrame = function(callback) {
      // Call the callback multiple times based on speed multiplier
      for (let i = 0; i < speedMultiplier; i++) {
        originalRAF(callback);
      }
    };
    
    showStatus(`Game speed hack injected (${speedMultiplier}x)`);
  } catch (error) {
    console.error('Error injecting game speed hack:', error);
    showStatus('Error injecting game speed hack: ' + error.message, true);
  }
}

// Function to unlock all upgrades
function unlockAllUpgrades() {
  // This is a placeholder - actual implementation would depend on the game's upgrade system
  try {
    // Example of what this might look like:
    const upgradeKeys = [
      'pickaxeLevel', 'minerCount', 'automationLevel',
      'gemUpgrades', 'relicUpgrades', 'specialAbilities'
    ];
    
    upgradeKeys.forEach(key => {
      // Set each upgrade to a high level
      modifyGameData(`upgrades.${key}`, 999);
    });
    
    gameData.upgrades = upgradeKeys.reduce((acc, key) => {
      acc[key] = 999;
      return acc;
    }, {});
    
  } catch (error) {
    console.error('Error unlocking upgrades:', error);
    showStatus('Error unlocking upgrades: ' + error.message, true);
  }
}

// Initialize the UI with current values
window.addEventListener('DOMContentLoaded', () => {
  stonesInput.value = gameData.stones;
  gemsInput.value = gameData.gems;
  relicsInput.value = gameData.relics;
  gameSpeedInput.value = gameData.gameSpeed;
});