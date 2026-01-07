// frontend/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    // inject toggle + widget HTML (unchanged from your version) …
    const toggle = document.createElement('button');
    toggle.id = 'chat-toggle';
    toggle.textContent = '💬';
    document.body.appendChild(toggle);
  
    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
      <div id="chat-header">
        Chat with us
        <span id="chat-close">&times;</span>
      </div>
      <div id="chat-body"></div>
      <form id="chat-form">
        <input id="chat-input" type="text" placeholder="Type a message..." autocomplete="off" required />
        <button type="submit">Send</button>
      </form>
    `;
    document.body.appendChild(widget);
  
    const body     = widget.querySelector('#chat-body');
    const form     = widget.querySelector('#chat-form');
    const input    = widget.querySelector('#chat-input');
    const closeBtn = widget.querySelector('#chat-close');
  
    // simple history arrays to feed into HF
    let histUser = [];
    let histBot  = [];
  
    function appendMessage(text, who) {
      const msg = document.createElement('div');
      msg.className = 'chat-message ' + who;
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }
  
    // open/close
    toggle.addEventListener('click', () => {
      const open = widget.style.display === 'flex';
      widget.style.display = open ? 'none' : 'flex';
      if (!open) input.focus();
    });
    closeBtn.addEventListener('click', () => widget.style.display = 'none');
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const txt = input.value.trim();
      if (!txt) return;
      appendMessage(txt, 'user');
      input.value = '';
  
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: txt, history: { user: histUser, bot: histBot } })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Chat error');
        const reply = json.reply;
  
        // track history
        histUser.push(txt);
        histBot .push(reply);
  
        appendMessage(reply, 'agent');
      } catch (err) {
        console.error(err);
        appendMessage('😞 Sorry, something went wrong.', 'agent');
      }
    });
  });