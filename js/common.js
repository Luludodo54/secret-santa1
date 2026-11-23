(function () {
  const KEY = 'la-veillee-secret-santa-v1';
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { eventName: value.eventName || '', people: Array.isArray(value.people) ? value.people : [], draws: value.draws && typeof value.draws === 'object' ? value.draws : null };
    } catch (_) { return { eventName: '', people: [], draws: null }; }
  }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function encode(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = ''; bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(value) {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  window.Santa = { read, save, encode, decode, key: KEY };
})();
