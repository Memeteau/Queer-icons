# QUEER ICONS — version Render

Version conçue pour être déployée entièrement sur Render : site + multijoueur temps réel sur le même domaine.

Fonctions intégrées :
- 39 cartes, Michel Foucault inclus.
- 9 catégories avec icône + bande de couleur fixe.
- Commentaires synthétiques visibles.
- Illustrations recadrées dans `public/images/`, toutes sous 1 Mo.
- Mode classique.
- Mode aveugle : illustration, nom et commentaires visibles ; scores masqués avant le choix.
- 2–6 joueurs en ligne avec code de partie.
- Cycle complet : choix → révélation → pli → cagnotte/rafle → manche suivante → nouveau leader.
- Bouton « RAFLER LA MISE · MANCHE SUIVANTE ».
- Reconnexion après rechargement du navigateur.

Déploiement Render :
1. Mettre ce dossier dans un dépôt GitHub.
2. Render → New → Blueprint.
3. Connecter le dépôt.
4. Render lit `render.yaml` et déploie.

Alternative Web Service :
- Build Command : `npm install`
- Start Command : `npm start`
