# 📚 Bot Discord EDT - IUT

Un bot Discord pour gérer l'emploi du temps de votre IUT ! Suivez ces instructions pour l'utiliser et contribuer.

## 🚀 Utilisation

### Commandes disponibles

1. **`/classe`**

   - **Description** : Permet de sélectionner une classe pour les commandes suivantes.
   - **Argument** :
     - `classe` (string) : Nom ou code de la classe (ex : "INF1-B2").
   - **Exemple** : `/classe INF1-B2`

2. **`/edt`**
   - **Description** : Récupère l'emploi du temps pour la journée
   - **Arguments** :
     - `date` (date) : Date de début au format `YYYY-MM-DD`.
   - **Exemple** : `/edt 2024-10-01`
   - **Remarque** : Pour des raisons de performance, seuls un seul jour est affiché.

## 🛠️ Installation

Pour ceux qui souhaitent forker et contribuer à l'amélioration du bot, suivez ces étapes :

1. **Installer Node.js**

   - Assurez-vous d'avoir installé Node.js en version 20 ou supérieure. Vous pouvez vérifier votre version avec la commande :
     ```bash
     node -v
     ```

2. **Cloner le dépôt**

   - Clonez le dépôt GitHub sur votre machine locale avec la commande suivante :
     ```bash
     git clone https://github.com/shadowforce78/UVSQ-Bot-Discord.git
     ```

3. **Installer les dépendances**

   - Après avoir cloné le dépôt, placez-vous dans le répertoire du projet et installez les dépendances en exécutant :
     ```bash
     npm install
     ```

4. **Créer un fichier `config.json`**

   - Dans le répertoire principal du projet, créez un fichier `config.json` avec le contenu suivant :
     ```json
     {
       "token": "",
       "prefix": ""
     }
     ```
   - Remplissez les champs :
     - `token` : Votre token de bot Discord.
     - `prefix` : Le préfixe de commande souhaité (ex : `u!`).
   - Vous pouvez directement copier le fichier `config.json.example` avec la commande suivante :
     ```bash
     cp config.json.example config.json
     ```

5. **Créer un fichier `db.json`**

   - Dans le répertoire principal du projet, créez un fichier `db.json` avec le contenu suivant :
     ```json
     {}
     ```
   - Vous pouvez directement copier le fichier `db.json.example` avec la commande suivante :
     ```bash
     cp db.json.example db.json
     ```

6. **Lancer le bot**
   - Pour démarrer le bot, exécutez la commande suivante :
     ```bash
     node .
     ```

## 📝 TODO List

- [ ] Ajouter le système de rappel par semaine (configReminder).
- [ ] Ajouter un moyen interactif pour ajouter des nouvelles classes (github actions dans un ficher json externe).
- [ ] Régler le problème des doubles cours (ex : le 2024-10-17, deux cours en même temps mais inversés à la moitié).
- [x] Ajouter un moyen de choisir le type d'edt (par jour ou par semaine)
- [x] Ajouter un meilleur système de sélection de classe et de date (Auto-complétion).
- [x] Ajouter deux boutons sous l'image pour changer de semaine (Précédent et Suivant).
- [x] Ajouter deux boutons sous l'image pour changer de jour (Précédent et Suivant).
- [x] Ajouter un système de sauvegarde d'images de cours pour éviter de les générer à chaque fois.
- [x] Changer le système de génération d'image pour le déployer sur un serveur.
- [x] Adapter le HTML pour trois jours (adapter la grille pour 1, 2, 3 ou 4 jours).
- [x] Ajouter une nouvelle base de données en local (json) parce MongoDB c'est chiant.
- [x] Régler la fonction `group` dans `getCalendar.js`.
- [x] Vérifier pour tous types de classes (pas uniquement Informatique).

## 🙏 Crédits

- Un grand merci à [ItsTheSky](https://github.com/ItsTheSky) pour son aide avec certains problèmes serveur.
- Merci à [Escartem](https://github.com/Escartem/EDTVelizy) pour avoir fourni les endpoints à utiliser pour les emplois du temps.

---