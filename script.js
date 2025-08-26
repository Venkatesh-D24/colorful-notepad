// DOM Elements
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const currentTime = document.getElementById('currentTime');

// Toolbar Elements
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const strikeBtn = document.getElementById('strikeBtn');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const bgColor = document.getElementById('bgColor');
const alignLeft = document.getElementById('alignLeft');
const alignCenter = document.getElementById('alignCenter');
const alignRight = document.getElementById('alignRight');
const bulletList = document.getElementById('bulletList');
const numberList = document.getElementById('numberList');
const insertTable = document.getElementById('insertTable');
const symbolsBtn = document.getElementById('symbolsBtn');

// Modal Elements
const symbolsModal = document.getElementById('symbolsModal');
const tableModal = document.getElementById('tableModal');
const closeSymbols = document.getElementById('closeSymbols');
const closeTable = document.getElementById('closeTable');
const createTable = document.getElementById('createTable');
const tableRows = document.getElementById('tableRows');
const tableCols = document.getElementById('tableCols');

// State
let isFormatting = false;

// Initialize the application
function init() {
    setupEventListeners();
    updateCounts();
    updateTime();
    setInterval(updateTime, 1000);
    
    // Load saved content if available
    const savedContent = localStorage.getItem('notepadContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
        updateCounts();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Editor events
    editor.addEventListener('input', updateCounts);
    editor.addEventListener('keydown', handleKeyDown);
    editor.addEventListener('paste', handlePaste);
    
    // File operations
    saveBtn.addEventListener('click', saveFile);
    loadBtn.addEventListener('click', loadFile);
    clearBtn.addEventListener('click', clearEditor);
    
    // Text formatting
    boldBtn.addEventListener('click', () => execCommand('bold'));
    italicBtn.addEventListener('click', () => execCommand('italic'));
    underlineBtn.addEventListener('click', () => execCommand('underline'));
    strikeBtn.addEventListener('click', () => execCommand('strikethrough'));
    
    // Font controls
    fontFamily.addEventListener('change', () => execCommand('fontName', fontFamily.value));
    fontSize.addEventListener('change', () => execCommand('fontSize', fontSize.value));
    textColor.addEventListener('change', () => execCommand('foreColor', textColor.value));
    bgColor.addEventListener('change', () => execCommand('hiliteColor', bgColor.value));
    
    // Alignment
    alignLeft.addEventListener('click', () => execCommand('justifyLeft'));
    alignCenter.addEventListener('click', () => execCommand('justifyCenter'));
    alignRight.addEventListener('click', () => execCommand('justifyRight'));
    
    // Lists
    bulletList.addEventListener('click', () => execCommand('insertUnorderedList'));
    numberList.addEventListener('click', () => execCommand('insertOrderedList'));
    
    // Table and symbols
    insertTable.addEventListener('click', showTableModal);
    symbolsBtn.addEventListener('click', showSymbolsModal);
    
    // Modal controls
    closeSymbols.addEventListener('click', hideSymbolsModal);
    closeTable.addEventListener('click', hideTableModal);
    createTable.addEventListener('click', createTableInEditor);
    
    // Symbol buttons
    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.addEventListener('click', () => insertSymbol(btn.textContent));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save
    editor.addEventListener('input', debounce(autoSave, 1000));
}

// Update word and character counts
function updateCounts() {
    const text = editor.textContent || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    wordCount.textContent = `Words: ${words}`;
    charCount.textContent = `Characters: ${chars}`;
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    currentTime.textContent = timeString;
}

// Execute document commands
function execCommand(command, value = null) {
    editor.focus();
    isFormatting = true;
    
    if (value) {
        document.execCommand(command, false, value);
    } else {
        document.execCommand(command, false, null);
    }
    
    // Update button states
    updateButtonStates();
    
    setTimeout(() => {
        isFormatting = false;
    }, 100);
}

// Update button states based on current selection
function updateButtonStates() {
    const buttons = [boldBtn, italicBtn, underlineBtn, strikeBtn];
    const commands = ['bold', 'italic', 'underline', 'strikethrough'];
    
    buttons.forEach((btn, index) => {
        if (document.queryCommandState(commands[index])) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveFile();
                break;
            case 'o':
                e.preventDefault();
                loadFile();
                break;
            case 'b':
                e.preventDefault();
                execCommand('bold');
                break;
            case 'i':
                e.preventDefault();
                execCommand('italic');
                break;
            case 'u':
                e.preventDefault();
                execCommand('underline');
                break;
            case 'z':
                if (e.shiftKey) {
                    e.preventDefault();
                    document.execCommand('redo');
                } else {
                    e.preventDefault();
                    document.execCommand('undo');
                }
                break;
        }
    }
}

// Handle key down events
function handleKeyDown(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
}

// Handle paste events to clean up formatting
function handlePaste(e) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
}

// Save file functionality
function saveFile() {
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notepad-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('File saved successfully!', 'success');
}

// Load file functionality
function loadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.txt,.htm';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editor.innerHTML = e.target.result;
                updateCounts();
                showNotification('File loaded successfully!', 'success');
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Clear editor
function clearEditor() {
    if (confirm('Are you sure you want to clear all content?')) {
        editor.innerHTML = '<p>Welcome to Colorful Notepad! ✨</p><p>Start typing your notes here...</p>';
        updateCounts();
        showNotification('Editor cleared!', 'info');
    }
}

// Show symbols modal
function showSymbolsModal() {
    symbolsModal.style.display = 'block';
}

// Hide symbols modal
function hideSymbolsModal() {
    symbolsModal.style.display = 'none';
}

// Insert symbol
function insertSymbol(symbol) {
    editor.focus();
    document.execCommand('insertText', false, symbol);
    hideSymbolsModal();
}

// Show table modal
function showTableModal() {
    tableModal.style.display = 'block';
}

// Hide table modal
function hideTableModal() {
    tableModal.style.display = 'none';
}

// Create table in editor
function createTableInEditor() {
    const rows = parseInt(tableRows.value);
    const cols = parseInt(tableCols.value);
    
    if (rows > 0 && cols > 0) {
        let tableHTML = '<table>';
        
        // Create header row
        tableHTML += '<tr>';
        for (let i = 0; i < cols; i++) {
            tableHTML += `<th>Header ${i + 1}</th>`;
        }
        tableHTML += '</tr>';
        
        // Create data rows
        for (let i = 0; i < rows - 1; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td>Cell</td>';
            }
            tableHTML += '</tr>';
        }
        
        tableHTML += '</table>';
        
        editor.focus();
        document.execCommand('insertHTML', false, tableHTML);
        hideTableModal();
        showNotification('Table inserted!', 'success');
    }
}

// Auto-save functionality
function autoSave() {
    if (!isFormatting) {
        localStorage.setItem('notepadContent', editor.innerHTML);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Set background based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === symbolsModal) {
        hideSymbolsModal();
    }
    if (e.target === tableModal) {
        hideTableModal();
    }
});

// Handle editor focus to update button states
editor.addEventListener('mouseup', updateButtonStates);
editor.addEventListener('keyup', updateButtonStates);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle beforeunload to warn about unsaved changes
window.addEventListener('beforeunload', function(e) {
    const hasContent = editor.textContent.trim().length > 0;
    if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Export functions for potential future use
window.NotepadApp = {
    saveFile,
    loadFile,
    clearEditor,
    updateCounts,
    execCommand,
    showNotification
};
