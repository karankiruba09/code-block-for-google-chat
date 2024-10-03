// Utility function to check if we're in an appropriate Google Chat frame
function isValidFrame() {
    return window.location.hostname === 'chat.google.com' || 
           (window.location.hostname === 'mail.google.com' && window.location.pathname.includes('/chat'));
  }
  
  function findMessageArea() {
    // Only proceed if we're in a valid frame
    if (!isValidFrame()) {
      return null;
    }
  
    const selectors = [
      '[data-input-type="text"]',
      '[role="textbox"]',
      '[contenteditable="true"]'
    ];
  
    // Try each selector
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Make sure it's actually in the chat area
        const chatArea = element.closest('[role="main"]') || 
                        element.closest('[role="complementary"]');
        if (chatArea) {
          return element.closest('[role="group"]') || element.parentElement;
        }
      }
    }
    
    return null;
  }
  
  function showCodeEditor() {
    const modal = document.createElement('div');
    
    modal.className = 'code-modal';
    modal.innerHTML = `
      <div class="code-modal-content">
        <textarea placeholder="Enter your code here"></textarea>
        <div class="button-group">
          <button class="cancel-button">Cancel</button>
          <button class="insert-button">Insert Code</button>
        </div>
      </div>
    `;
     
    document.body.appendChild(modal);
  
    const textarea = modal.querySelector('textarea');
    textarea.focus();
  
    modal.querySelector('.insert-button').addEventListener('click', () => {
      const code = textarea.value;
      insertCodeBlock(code);
      modal.remove();
    });
  
    modal.querySelector('.cancel-button').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  function insertCodeBlock(code) {
    const messageInput = document.querySelector('[role="textbox"], [contenteditable="true"]');
    if (!messageInput) return;
  
    const formattedCode = '```\n' + code + '\n```';
    messageInput.textContent = formattedCode;
    messageInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  function addCodeBlockButton() {
    const messageArea = findMessageArea();
    if (!messageArea) {
      return false;
    }
  
    // Check if button already exists
    if (messageArea.querySelector('.code-block-button')) {
      return true;
    }
  
    let toolbar = messageArea.querySelector('[role="toolbar"]') || 
                  messageArea.querySelector('[role="group"]');
                  
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.setAttribute('role', 'toolbar');
      toolbar.style.cssText = `
        display: inline-flex;
        align-items: center;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 24px;
      `;
      messageArea.style.position = 'relative';
      messageArea.appendChild(toolbar);
    }
  
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      height: 100%;
    `;
  
    const codeButton = document.createElement('button');
    codeButton.type = 'button';
    codeButton.className = 'code-block-button';
    codeButton.setAttribute('aria-label', 'Insert code block');
    codeButton.style.cssText = `
      height: 24px;
      width: 24px;
      padding: 2px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(68, 71, 70);
      margin: 0 4px;
    `;
  
    codeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
  
    codeButton.addEventListener('mouseover', () => {
      codeButton.style.backgroundColor = 'rgba(68, 71, 70, 0.08)';
    });
    
    codeButton.addEventListener('mouseout', () => {
      codeButton.style.backgroundColor = 'transparent';
    });
  
    codeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showCodeEditor();
    });
  
    buttonContainer.appendChild(codeButton);
    toolbar.appendChild(buttonContainer);
    
    return true;
  }
  
  function initializeExtension() {
    let isInitialized = false;
    let attemptCount = 0;
    const MAX_ATTEMPTS = 20;
    const RETRY_INTERVAL = 1000; // 1 second
  
    function initialize() {
      // If already initialized or max attempts reached, stop trying
      if (isInitialized || attemptCount >= MAX_ATTEMPTS) {
        return;
      }
  
      attemptCount++;
      
      // Try to add the button
      if (addCodeBlockButton()) {
        isInitialized = true;
        setupMutationObserver();
        return;
      }
  
      // If not successful, try again after interval
      setTimeout(initialize, RETRY_INTERVAL);
    }
  
    function setupMutationObserver() {
      // Observe DOM changes to handle dynamic content loading
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && 
              mutation.addedNodes.length > 0) {
            // Only try to add button if we're in a valid frame
            if (isValidFrame() && !document.querySelector('.code-block-button')) {
              addCodeBlockButton();
            }
          }
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
    // Start initialization
    initialize();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }