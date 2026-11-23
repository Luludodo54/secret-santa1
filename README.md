# La Veillée — Secret Santa

Un petit site autonome pour organiser un échange de cadeaux. Il fonctionne sans serveur, sans compte et sans installation : ouvrez `index.html` dans un navigateur, ou publiez ce dossier comme site statique.

## Utilisation

1. Ouvrez `index.html`, puis **Organiser mon Secret Santa**.
2. Ajoutez les participants, leurs idées cadeaux et les exclusions éventuelles. Une exclusion indique qui la personne ne peut pas tirer.
3. Lancez le tirage. L’algorithme cherche un appariement complet : personne ne se tire soi-même, chaque destinataire est unique, et toutes les exclusions sont appliquées. Un message indique si les contraintes rendent le tirage impossible.
4. Affichez les liens privés. Copiez et transmettez à chacun uniquement son lien.
5. Téléchargez une sauvegarde JSON depuis le panneau organisateur pour conserver ou transférer le groupe.

## Données et confidentialité

Les données de gestion sont enregistrées dans le `localStorage` du navigateur de l’organisateur. Elles ne sont envoyées à aucun serveur. Effacer les données du navigateur ou changer d’appareil les rend inaccessibles : utilisez **Exporter une sauvegarde** pour les conserver.

Les liens participants sont autonomes et peuvent être partagés sur n’importe quel appareil. Pour rendre cela possible sans backend, chaque lien contient son résultat encodé dans le fragment de l’URL. Il n’est pas chiffré : quiconque reçoit le lien peut lire le destinataire. Envoyez chaque lien en privé. Le code administrateur est également un outil local d’organisation, pas un coffre-fort protégé par un serveur.

## Hébergement facultatif

Vous pouvez ouvrir `index.html` directement ou héberger le dossier sur n’importe quel hébergeur de fichiers statiques, y compris GitHub Pages. Aucun compte GitHub ni Supabase n’est nécessaire pour utiliser le site en local. Certaines fonctions de copie du presse-papiers peuvent demander une origine HTTPS; en local, les liens restent sélectionnables et copiables manuellement.

Le chargement de polices personnalisées utilise Google Fonts; si la connexion est absente, le navigateur choisit les polices de secours intégrées.
