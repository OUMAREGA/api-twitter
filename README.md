# Project Tweet analytics

## Contexte

Ce projet a été réalisé dans le cadre de l'étude de **l'API Twitter.**

Le **besoin** demandé a été de représenter l'utilisation des **mots-clés** en nombre de Tweets au cours du temps.
Pour cela il a été nécessaire d'interroger les données de Twitter, d'où la raison de l'utilisation de l'API Twitter.

## Développement

Ce projet a été réalisé avec les outils suivants :

- Docker - docker-compose (environnement de développement)
- Nginx (serveur - reverse-proxy HTTPS)
- NodeJS - Express (Back)
- ***API Twitter*** (Back)
- *OAuth Twitter* (Authentification depuis Twitter)
- MongoDB (Back - base de données)
- Bootstrap (Front)
- *Chart.js* (Front - représentation statistique côté Front)
- Trello (travail collaboratif)
  - Vous pouvez consulter [ce lien](https://trello.com/b/c8HN2bbt/api-twitter) pour avoir un aperçu de notre gestion du projet

## Pré-requis

Si vous souhaitez tester ce projet, vous aurez besoin des éléments suivants :

- **Docker** et **docker-compose** sur votre machine
- Des **clés API** d'un **compte développeur Twitter**
  - Si vous utilisez un compte développeur **non-premium** : l'activation de l'option **Tweets and Users** afin que vous bénéficiiez d'un appel de **900 requêtes** / 15 minutes sur le site [**Twitter Developer Labs**](https://developer.twitter.com/en/account/labs)


## Installation

1) Renseignez vos clés API dans le fichier **.env** (après avoir fait un copie du **.env-example** en **.env**)
2) Lancez le projet depuis la commande : `docker-compose up`
3) Rendez-vous sur l'application depuis https://localhost 

**Remarques** : 

- Ce projet fonctionne sous Docker pour des perspectives de **développement**. Vous êtes libres de proposer de nouvelles fonctionnalités, signaler des bugs etc.
D'où la raison de générer des **certificats TLS auto-signés** pour assurer une approche de sécurité HTTPS.

- Assurez-vous que les ports suivants ne soient pas déjà utilisés :

   - 3000 (serveur node)
   - 443 (reverse-proxy HTTPS)

