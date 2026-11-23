(() => {
  const $ = id => document.getElementById(id);
  try {
    if (!location.hash || location.hash.length < 2) throw Error();
    const secret = Santa.decode(location.hash.slice(1));
    if (!secret || !secret.giver || !secret.recipient) throw Error();
    $('greeting').textContent = `Bonjour ${secret.giver}.`;
    $('intro').textContent = `Votre mission pour ${secret.event} est prête.`;
    $('revealBtn').addEventListener('click', () => {
      $('recipient').textContent = secret.recipient;
      $('details').textContent = secret.details ? `Quelques idées : ${secret.details}` : 'À vous de trouver le cadeau parfait !';
      $('result').classList.remove('hidden'); $('revealBtn').classList.add('hidden'); $('intro').textContent = 'Gardez ce nom pour vous…';
    });
  } catch (_) {
    $('greeting').textContent = 'Lien introuvable.';
    $('intro').textContent = 'Ce lien semble incomplet. Demandez à l’organisateur de vous renvoyer votre lien privé.';
    $('revealBtn').classList.add('hidden');
  }
})();
