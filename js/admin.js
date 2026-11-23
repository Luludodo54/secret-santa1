(() => {
  const $ = id => document.getElementById(id);
  let data = Santa.read();
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('eventName').value = data.eventName;
  function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
  function persist() { Santa.save(data); }
  function drawValid() { return data.draws && data.people.length >= 2 && data.people.every(p => data.draws[p.id] && data.people.some(x => x.id === data.draws[p.id])); }
  function render() {
    $('count').textContent = data.people.length;
    $('peopleList').innerHTML = data.people.length ? data.people.map(p => `<article class="person-row"><div class="person-avatar">${esc(p.name.trim().charAt(0).toUpperCase())}</div><div class="person-copy"><b>${esc(p.name)}</b>${p.details ? `<small>${esc(p.details)}</small>` : ''}<small class="muted">${p.excludes?.length ? `Exclut : ${p.excludes.map(id => data.people.find(x => x.id === id)?.name).filter(Boolean).map(esc).join(', ')}` : 'Aucune exclusion'}</small></div><div class="row-actions"><button class="text-button edit-person" data-id="${esc(p.id)}">Modifier</button><button class="text-button remove-person" data-id="${esc(p.id)}" aria-label="Supprimer ${esc(p.name)}">×</button></div></article>`).join('') : '<p class="empty">Les participants apparaîtront ici.</p>';
    $('exclude').innerHTML = data.people.filter(p => p.id !== $('personId').value).map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    if (drawValid()) {
      $('drawSummary').innerHTML = `<span class="summary-icon">✦</span><p>Le tirage de <b>${esc(data.eventName || 'votre échange')}</b> est prêt. Les liens privés sont disponibles.</p>`;
      $('drawBtn').classList.add('hidden'); $('resultsBtn').classList.remove('hidden'); $('linksBtn').classList.remove('hidden');
      if (!$('resultsPanel').classList.contains('hidden')) renderResults();
      if (!$('linksPanel').classList.contains('hidden')) renderLinks();
    } else {
      $('drawSummary').innerHTML = `<span class="summary-icon">✧</span><p>${data.people.length < 2 ? 'Ajoutez au moins deux participants pour commencer.' : 'Tout est prêt. Lancez le tirage quand vous le souhaitez.'}</p>`;
      $('drawBtn').classList.remove('hidden'); $('resultsBtn').classList.add('hidden'); $('resultsPanel').classList.add('hidden'); $('linksBtn').classList.add('hidden'); $('linksPanel').classList.add('hidden');
    }
  }
  function renderLinks() {
    $('linksList').innerHTML = data.people.map(p => {
      const recipient = data.people.find(x => x.id === data.draws[p.id]);
      const payload = Santa.encode({ event: data.eventName || 'La Veillée', giver: p.name, recipient: recipient.name, details: recipient.details || '' });
      const url = new URL('participant.html', location.href); url.hash = payload;
      return `<article class="link-row"><div><b>${esc(p.name)}</b><small>Lien privé</small></div><button class="button small copy-link" data-url="${esc(url.href)}">Copier le lien</button></article>`;
    }).join('');
  }
  function renderResults() {
    $('resultsList').innerHTML = data.people.map(p => {
      const recipient = data.people.find(x => x.id === data.draws[p.id]);
      const payload = Santa.encode({ event: data.eventName || 'La Veillée', giver: p.name, recipient: recipient.name, details: recipient.details || '' });
      const url = new URL('participant.html', location.href); url.hash = payload;
      return `<article class="link-row"><div><b>${esc(p.name)}</b><small>Lien privé</small></div><button class="button small copy-link" data-url="${esc(url.href)}">Copier le lien</button></article>`;
    }).join('');
  }
  function resetForm() { $('personForm').reset(); $('personId').value = ''; $('savePerson').innerHTML = 'Ajouter la personne <span>＋</span>'; $('cancelEdit').classList.add('hidden'); }
  $('eventName').addEventListener('input', () => { data.eventName = $('eventName').value.trim(); persist(); render(); });
  $('personForm').addEventListener('submit', event => {
    event.preventDefault(); const id = $('personId').value || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    const selected = [...$('exclude').selectedOptions].map(o => o.value);
    const existing = data.people.find(p => p.id === id);
    if (data.people.some(p => p.id !== id && p.name.trim().toLocaleLowerCase() === $('personName').value.trim().toLocaleLowerCase())) return status('Ce prénom est déjà dans la liste.', true);
    const person = { id, name: $('personName').value.trim(), details: $('personDetails').value.trim(), excludes: selected };
    if (existing) Object.assign(existing, person); else data.people.push(person);
    data.draws = null; persist(); resetForm(); status('Participant enregistré.'); render();
  });
  $('peopleList').addEventListener('click', event => {
    const id = event.target.dataset.id; if (!id) return;
    const person = data.people.find(p => p.id === id); if (!person) return;
    if (event.target.matches('.remove-person')) {
      data.people = data.people.filter(p => p.id !== id); data.people.forEach(p => p.excludes = (p.excludes || []).filter(x => x !== id)); data.draws = null; persist(); render(); status(`${person.name} a été supprimé(e).`);
    } else if (event.target.matches('.edit-person')) {
      $('personId').value = id; $('personName').value = person.name; $('personDetails').value = person.details || ''; render();
      [...$('exclude').options].forEach(option => option.selected = (person.excludes || []).includes(option.value));
      $('savePerson').innerHTML = 'Enregistrer les changements <span>✓</span>'; $('cancelEdit').classList.remove('hidden'); $('personName').focus();
    }
  });
  $('cancelEdit').addEventListener('click', resetForm);
  $('drawBtn').addEventListener('click', () => {
    const people = data.people;
    if (people.length < 2) return status('Ajoutez au moins deux participants.', true);
    const blocked = new Map(people.map(p => [p.id, new Set([p.id, ...(p.excludes || [])])]));
    // Randomized backtracking finds a one-to-one assignment while respecting exclusions.
    for (let attempt = 0; attempt < 1500; attempt++) {
      const order = [...people].sort((a,b) => blocked.get(b.id).size - blocked.get(a.id).size || Math.random() - .5);
      const assigned = {}, used = new Set();
      function place(index) {
        if (index === order.length) return true;
        const giver = order[index]; const choices = people.filter(p => !used.has(p.id) && !blocked.get(giver.id).has(p.id)).sort(() => Math.random() - .5);
        for (const receiver of choices) { assigned[giver.id] = receiver.id; used.add(receiver.id); if (place(index + 1)) return true; used.delete(receiver.id); delete assigned[giver.id]; }
        return false;
      }
      if (place(0)) { data.draws = assigned; persist(); status('Le tirage est terminé. Les liens privés sont prêts.'); render(); return; }
    }
    status('Aucun tirage possible avec ces exclusions. Modifiez les exclusions puis réessayez.', true);
  });
  $('linksBtn').addEventListener('click', () => { $('linksPanel').classList.toggle('hidden'); if (!$('linksPanel').classList.contains('hidden')) renderLinks(); });
  $('resultsBtn').addEventListener('click', () => { $('resultsPanel').classList.toggle('hidden'); if (!$('resultsPanel').classList.contains('hidden')) renderResults(); });
  $('linksList').addEventListener('click', async event => { const button = event.target.closest('.copy-link'); if (!button) return; try { await navigator.clipboard.writeText(button.dataset.url); button.textContent = 'Lien copié ✓'; } catch (_) { window.prompt('Copiez ce lien privé :', button.dataset.url); } });
  $('resultsList').addEventListener('click', async event => { const button = event.target.closest('.copy-link'); if (!button) return; try { await navigator.clipboard.writeText(button.dataset.url); button.textContent = 'Lien copié ✓'; } catch (_) { window.prompt('Copiez ce lien privé :', button.dataset.url); } });
  $('copyAll').addEventListener('click', async () => { renderLinks(); const lines = [...$('linksList').querySelectorAll('.link-row')].map(row => `${row.querySelector('b').textContent} : ${row.querySelector('small').textContent} — ${row.querySelector('.copy-link').dataset.url}`); try { await navigator.clipboard.writeText(lines.join('\n')); status('Tous les liens ont été copiés. Envoyez chaque ligne séparément.'); } catch (_) { window.prompt('Copiez puis partagez chaque ligne individuellement :', lines.join('\n')); } });
  $('exportBtn').addEventListener('click', () => { const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'la-veillee-sauvegarde.json'; a.click(); URL.revokeObjectURL(a.href); status('Sauvegarde exportée.'); });
  $('importFile').addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; try { const imported = JSON.parse(await file.text()); if (!Array.isArray(imported.people)) throw Error(); data = {eventName: imported.eventName || '', people: imported.people, draws: imported.draws || null}; persist(); $('eventName').value = data.eventName; render(); status('Sauvegarde importée.'); } catch (_) { status('Fichier de sauvegarde invalide.', true); } event.target.value = ''; });
  $('resetBtn').addEventListener('click', () => { if (!confirm('Effacer le nom, les participants et le tirage de cet appareil ?')) return; data = {eventName:'',people:[],draws:null}; persist(); $('eventName').value = ''; resetForm(); render(); status('Toutes les données ont été effacées.'); });
  render();
})();
