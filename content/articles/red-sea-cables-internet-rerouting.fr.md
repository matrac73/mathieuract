---
title: "Câbles coupés en mer Rouge : pourquoi Internet ralentit sans tomber"
summary: "Trois câbles sous-marins sont coupés en mer Rouge et un quart du trafic doit changer de chemin. Le routage, vu en cours de réseaux, explique pourquoi la panne se paie en lenteur et non en coupure."
hook: "Quand des câbles sous-marins sont coupés en mer Rouge, Internet ne tombe pas : chaque routeur trouve seul un autre chemin, plus long, et la panne se paie en lenteur plutôt qu'en coupure."
category: "perspective"
date: "2024-03-04"
written: "2024-03"
readingMinutes: 5
course: "Réseaux et sécurité (1A)"
courseSlug: "reseaux-et-securite-1a"
news:
  title: "Les rebelles houthis nient avoir sectionné trois câbles sous-marins en mer Rouge"
  source: "Associated Press (PBS NewsHour)"
  url: "https://www.pbs.org/newshour/world/houthi-rebels-deny-severing-three-red-sea-underwater-cables"
  date: "2024-03-04"
---

## Ce qui s'est passé

Le 4 mars, l'opérateur hongkongais HGC Global Communications annonce que plusieurs câbles sous-marins de télécommunication sont coupés en mer Rouge : Asia-Africa-Europe 1, Europe India Gateway, et l'ensemble Seacom et TGN-Gulf, qui ne forme qu'un seul câble à cet endroit. Selon HGC, la coupure touche 25 % du trafic qui passe par la mer Rouge. D'après le cabinet TeleGeography, cité par l'Associated Press, quatorze câbles traversent cette mer et ils portent plus de 90 % des communications entre l'Europe et l'Asie. La cause n'est pas établie : Seacom juge plausible qu'une ancre ait raclé le fond, et les Houthis nient toute responsabilité.

Ce qui m'intéresse ici est la suite. Les opérateurs ne parlent pas de coupure d'Internet, ils parlent de trafic « rerouté ». HGC dit envoyer ses données vers l'Europe par des câbles terrestres en Chine, par le Pacifique puis les États-Unis, et par les câbles restants de la mer Rouge. Seacom précise qu'une partie de ses services reste interrompue.

## Ce que dit le cours : un routeur ne connaît que ses voisins

Sur Internet, les données voyagent en paquets, des petits morceaux d'information qui portent chacun l'adresse de leur destinataire. Le cours de réseaux définit le routeur comme l'équipement qui relie plusieurs réseaux : il lit l'adresse de destination du paquet, la compare à sa table de routage, c'est-à-dire la liste « pour aller là, envoie par ce lien », puis transmet le paquet. La décision ne dépend que de la destination. Aucun chemin n'est réservé à l'avance.

Qui remplit cette table ? Un algorithme de routage. Le cours en distingue deux familles. Les algorithmes à état de liens raisonnent sur la carte complète du réseau, avec l'algorithme de Dijkstra. Les algorithmes à vecteur de distance raisonnent de proche en proche, avec l'algorithme de Bellman-Ford : chaque routeur annonce à ses voisins à quelle distance il se trouve de chaque destination, et chacun retient le voisin pour lequel la somme « coût du lien + distance annoncée » est la plus petite.

Prenons un réseau jouet, que j'invente pour l'exemple, avec trois routes entre l'Asie et l'Europe et des délais en millisecondes. Par la mer Rouge : 40 + 30 = 70 ms. Par la Chine : 50 + 50 = 100 ms. Par le Pacifique : 80 + 60 = 140 ms. Le routeur d'Asie choisit 70. Si le câble de la mer Rouge est coupé, le voisin de ce côté n'annonce plus de route. Le routeur refait le même calcul sur ce qui reste et choisit 100. Personne n'a eu besoin de dessiner une nouvelle carte.

```figure
file: fig-1.svg
caption: Un routeur recalcule son chemin après la coupure d'un câble
scroll: Le chemin orange passe d'abord par la mer Rouge, le câble se rompt, les voisins annoncent leurs distances et le chemin orange se redessine par le nord.
steps:
- Trois routes relient l'Asie à l'Europe. Le routeur d'Asie additionne les délais et retient la plus courte, par la mer Rouge, soit 70 ms.
- Le câble de la mer Rouge est coupé. Ce lien ne transporte plus rien.
- Chaque voisin annonce sa distance à l'Europe. Le voisin de la mer Rouge n'a plus de route, ce que l'on note par une distance infinie.
- Le routeur d'Asie refait la même addition avec les annonces restantes. Le meilleur chemin passe maintenant par la Chine, en 100 ms.
```

C'est ce que Tata Communications, propriétaire d'un des câbles touchés, résume en disant pouvoir rerouter ses services automatiquement.

## Le prix du détour : du délai et des files pleines

Le cours prévient que le protocole IP, celui qui achemine les paquets, fonctionne « au mieux » : il ne garantit ni le chemin suivi, ni le débit, ni le délai. Le détour a donc deux coûts.

Le premier est le délai. Le temps de propagation vaut la distance divisée par la vitesse du signal, et le cours retient 0,7 × c dans un câble, soit environ 210 000 km par seconde. Les 70 ms de mon exemple correspondent à 14 700 km de fibre, et les 140 ms de la route du Pacifique à 29 400 km. Comme une réponse doit revenir, l'écart compte double.

```figure
file: fig-2.svg
caption: Le délai de propagation augmente en proportion de la longueur du chemin
scroll: Une droite se trace, puis un point blanc marque la route directe et deux points orange marquent les détours, plus haut sur la droite.
steps:
- Dans une fibre, le signal parcourt environ 210 000 km par seconde. Le délai est donc proportionnel à la distance.
- La route directe de l'exemple, 14 700 km, demande 70 ms pour un aller.
- Les détours sont plus longs. Environ 21 000 km par la Chine donnent 100 ms, et 29 400 km par le Pacifique donnent 140 ms.
- Une réponse fait l'aller et le retour. Le détour ajoute donc de 60 à 140 ms à chaque échange.
```

Le second coût est l'encombrement. Les câbles restants reçoivent leur trafic habituel, plus celui des câbles coupés. Un routeur range les paquets en attente dans une file. Le cours dit ce qui arrive quand elle est pleine : le routeur supprime des paquets. Si 12 paquets arrivent chaque seconde sur un lien qui en écoule 10, la file grossit de 2 paquets par seconde, et une file de 6 places déborde en moins de trois secondes. Les vrais routeurs traitent des millions de paquets, mais le calcul est le même.

```figure
file: fig-3.svg
caption: Un lien de secours qui reçoit plus de paquets qu'il n'en écoule
scroll: La file du routeur se remplit case après case, puis des paquets orange tombent hors de la file.
steps:
- En temps normal, le lien écoule 10 paquets par seconde et n'en reçoit que 8. La file reste presque vide.
- Le trafic des câbles coupés arrive sur ce lien. Il reçoit 12 paquets par seconde et la file grossit de 2 paquets par seconde.
- La file est pleine. Le routeur supprime les paquets qui arrivent en trop.
- TCP, le protocole qui assure la remise des données, renvoie les paquets perdus et demande à l'émetteur de ralentir. L'utilisateur voit une connexion lente, pas une coupure.
```

C'est TCP, le protocole placé au-dessus d'IP, qui rattrape les pertes : il réémet ce qui manque et adapte le débit de l'émetteur à l'encombrement. Le cours rappelle qu'il ne garantit pour autant ni débit minimal ni délai maximal.

## Ce qu'il faut en retenir

Internet résiste à cette coupure parce que personne ne décide du chemin à la place des routeurs : chacun applique une règle simple à partir de ce que ses voisins annoncent. Le routage ne crée pourtant aucune capacité. Il déplace le trafic vers ce qui reste, et les réparations de câbles sous-marins prennent en général deux à trois mois, selon le point d'échange DE-CIX. Là où il n'existe pas d'autre câble, comme pour certains services de Seacom, il n'y a rien à recalculer et le service s'arrête.

Mon réseau jouet simplifie aussi deux choses. Entre opérateurs, le choix d'une route dépend d'accords commerciaux, que le cours appelle transit et peering, et pas seulement du délai. Et les chiffres de mes schémas sont des ordres de grandeur choisis pour l'exemple, pas des mesures de la panne.

## Sources

- [Associated Press via PBS NewsHour, 4 mars 2024 : Houthi rebels deny severing three Red Sea underwater cables](https://www.pbs.org/newshour/world/houthi-rebels-deny-severing-three-red-sea-underwater-cables)
- [BBC, reprise par le Daily Mirror (Sri Lanka), 6 mars 2024 : Crucial Red Sea data cables cut, telecoms firm says](https://www.dailymirror.lk/print/breaking-news/Crucial-Red-Sea-data-cables-cut-telecoms-firm-says/108-278343)
- [Al Jazeera, 6 mars 2024 : Why are people blaming the Houthis for cutting the Red Sea cables?](https://www.aljazeera.com/news/2024/3/6/why-are-people-blaming-the-houthis-for-cutting-the-red-sea-cables)
- [IEEE ComSoc Technology Blog, 7 mars 2024 : HGC Global Communications, DE-CIX and Intelsat perspectives on damaged Red Sea internet cables](https://techblog.comsoc.org/2024/03/07/hgc-global-communications-and-de-cix-perspective-on-damaged-red-sea-internet-cables/)
- Cours Réseaux et sécurité (1A), CentraleSupélec : fiche de révision (2019) et guide « Réseaux et Sécurité » (2022), parties routeurs, algorithmes de routage, protocole IP, calculs de délais et TCP.
