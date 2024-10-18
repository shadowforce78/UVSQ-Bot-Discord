# 📚 Bot Discord EDT - IUT

Un bot Discord pour gérer l'emploi du temps de votre IUT ! Suivez ces instructions pour l'utiliser et contribuer.

## 🚀 Utilisation

### Commandes disponibles

1. **`/classe`**
   - **Description** : Sélectionne une classe spécifique et obtient l'emploi du temps correspondant.
   - **Argument** :
     - `classe` (string) : Nom ou code de la classe (ex : "IUT Info A").
   - **Exemple** : `/classe IUT Info A`

2. **`/edt`**
   - **Description** : Récupère l'emploi du temps pour une période donnée.
   - **Arguments** :
     - `debut` (date) : Date de début au format `YYYY-MM-DD`.
     - `fin` (date) : Date de fin au format `YYYY-MM-DD`.
   - **Exemple** : `/edt 2024-10-01 2024-10-07`

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

5. **Lancer le bot**  
   - Pour démarrer le bot, exécutez la commande suivante :
     ```bash
     node .
     ```

## 📝 TODO List

- [ ] Adapter le HTML pour trois jours (adapter la grille pour 1, 2, 3 ou 4 jours).
- [ ] Ajouter le système de rappel par semaine (configReminder).
- [ ] Ajouter deux boutons sous l'image pour changer de jour (Précédent et Suivant).
- [ ] Ajouter un moyen interactif pour ajouter des nouvelles classes (github actions dans un ficher json externe).
- [ ] Régler le problème des doubles cours (ex : le 2024-10-17, deux cours en même temps mais inversés à la moitié).
- [x] Régler la fonction `group` dans `getCalendar.js`.
- [x] Vérifier pour tous types de classes (pas uniquement Informatique).
