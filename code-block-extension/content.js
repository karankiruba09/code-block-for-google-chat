console.log('Code Block Extension loaded');

function findMessageArea() {
  const elements = {
    textbox: document.querySelectorAll('[role="textbox"]'),
    messageInput: document.querySelectorAll('[data-input-type="text"]'),
    richTextbox: document.querySelectorAll('[contenteditable="true"]')
  };
  
  console.log('Found elements:', {
    textboxCount: elements.textbox.length,
    messageInputCount: elements.messageInput.length,
    richTextboxCount: elements.richTextbox.length
  });

  const messageArea = 
    document.querySelector('[data-input-type="text"]') ||
    document.querySelector('[role="textbox"]') ||
    document.querySelector('[contenteditable="true"]');

  if (messageArea) {
    console.log('Found message area:', messageArea);
    return messageArea.closest('[role="group"]') || messageArea.parentElement;
  }
  
  console.log('Message area not found');
  return null;
}

function addCodeBlockButton() {
  const messageArea = findMessageArea();
  if (!messageArea) {
    return;
  }

  let toolbar = messageArea.querySelector('[role="toolbar"]') || messageArea.querySelector('[role="group"]');
  if (!toolbar) {
    console.log('Creating new toolbar');
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

  if (document.querySelector('.code-block-button')) {
    console.log('Button already exists');
    return;
  }

  console.log('Creating code block button');
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
  
  console.log('Button added successfully');
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
 if (!messageInput) {
   console.log('Message input not found');
   return;
 }

 const formattedCode = '```\n' + code + '\n```';
 messageInput.textContent = formattedCode;
 messageInput.dispatchEvent(new Event('input', { bubbles: true }));

 // Start observing for code block insertion
 observeCodeBlockInsertion();
}

function observeCodeBlockInsertion() {
 const chatContainer = document.querySelector('.nF6pT'); // Adjust this selector as needed
 if (!chatContainer) {
   console.log('Chat container not found');
   return;
 }

 const observer = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
     if (mutation.type === 'childList') {
       const addedNodes = mutation.addedNodes;
       addedNodes.forEach((node) => {
         if (node.nodeType === Node.ELEMENT_NODE) {
           const codeBlock = node.querySelector('pre'); // Adjust this selector as needed
           if (codeBlock) {
             styleCodeBlock(codeBlock);
           }
         }
       });
     }
   });
 });

 observer.observe(chatContainer, { childList: true, subtree: true });
}

function styleCodeBlock(codeBlock) {
    // Style the outer container (white box)
    const outerContainer = codeBlock.closest('.U8d2Re'); // Adjust this selector as needed
    if (outerContainer) {
      outerContainer.style.padding = '8px';
      outerContainer.style.margin = '8px';
      outerContainer.style.marginRight = '20px'; // Increase right margin
    }
  
    // Style the inner container (black box)
    const innerContainer = codeBlock.closest('.FMTudf'); // Adjust this selector as needed
    if (innerContainer) {
      innerContainer.style.margin = '0';
      innerContainer.style.padding = '8px';
      innerContainer.style.borderRadius = '4px';
    }
  
    // Style the code block itself
    codeBlock.style.margin = '0';
    codeBlock.style.whiteSpace = 'pre-wrap';
    codeBlock.style.wordBreak = 'break-word';
}

function initializeExtension() {
 console.log('Initializing extension');
 addCodeBlockButton();
 observeCodeBlockInsertion();

 const observer = new MutationObserver((mutations) => {
   if (!document.querySelector('.code-block-button')) {
     addCodeBlockButton();
   }
 });

 observer.observe(document.body, { childList: true, subtree: true });

 let attempts = 0;
 const maxAttempts = 20;

 function tryAgain() {
   if (attempts >= maxAttempts) return;
   attempts++;
   console.log(`Attempt ${attempts} to add button`);
   if (!document.querySelector('.code-block-button')) {
     addCodeBlockButton();
     setTimeout(tryAgain, 1000);
   }
 }

 tryAgain();
}

// Start when the document is ready
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
 initializeExtension();
}