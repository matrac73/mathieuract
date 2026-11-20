---
title: "Parler à un satellite avec une puce de compteur : ce que Shannon autorise"
summary: "Iridium ouvre un service satellite pour objets connectés standards. La capacité du canal gaussien explique pourquoi il transporte des messages courts et pourquoi une bande étroite ne lui coûte presque rien."
hook: "Un objet connecté peut désormais parler à un satellite à 780 km, mais seulement par messages courts : à cette distance, le signal reçu est si faible que la physique plafonne le débit."
category: "perspective"
date: "2026-11-17"
written: "2026-11"
readingMinutes: 5
course: "Théorie de l_Information (1A)"
news:
  title: "Iridium Launches Service for Iridium NTN Direct; Its Standards-Based D2D Offering"
  source: "Via Satellite"
  url: "https://satellitetoday.com/connectivity/2026/11/17/iridium-launches-service-for-iridium-ntn-direct-its-standards-based-d2d-offering"
  date: "2026-11-17"
---

## Ce qui s'est passé

Le 17 novembre, l'opérateur américain Iridium a ouvert commercialement Iridium NTN Direct. Ce service relie directement des objets connectés à sa constellation de 66 satellites, qui tournent à 780 km d'altitude. La nouveauté est qu'il suit une norme de téléphonie mobile, le NB-IoT, conçue pour des capteurs peu gourmands : une puce du commerce, comme le module nRF9151 de Nordic Semiconductor, pourra s'y connecter après une mise à jour logicielle annoncée pour janvier 2027, sans changer de matériel.

Les usages cités sont modestes : montres, balises de secours, suivi de flottes, compteurs, colliers pour bétail. Le téléphone grand public n'est pas visé, et personne ne parle de vidéo. Ni le communiqué ni la presse spécialisée ne donnent de débit. Sur un réseau terrestre, le NB-IoT occupe 180 kHz et plafonne à quelques dizaines de kilobits par seconde. Je me suis demandé si ce choix d'une bande étroite était une contrainte subie ou une bonne décision. Le cours de théorie de l'information de première année permet de répondre.

## La notion : la capacité du canal gaussien

Le cours modélise une liaison radio par le canal gaussien : ce que l'on reçoit est le signal émis, auquel s'ajoute un bruit aléatoire, celui de l'agitation thermique des électrons dans le récepteur. Shannon a montré que ce canal a une capacité, c'est-à-dire un débit maximal en dessous duquel on peut transmettre sans erreur et au-dessus duquel c'est impossible, quel que soit le codage.

Pour un signal de puissance reçue P, occupant une largeur de bande W, avec un bruit de densité N0 par hertz, le cours donne :

C = W × log2(1 + P / (W × N0))

Le quotient P / (W × N0) est le rapport signal sur bruit. On l'exprime souvent en décibels (dB) : 10 dB de plus signifient dix fois plus de signal.

Le cours donne trois exemples. Une ligne téléphonique : 3,3 kHz et 33 dB, soit 36 kbit/s. Le Wi-Fi : 40 MHz et 30 dB, soit 400 Mbit/s. La 4G : 20 MHz et 20 dB, soit 133 Mbit/s. Il ajoute une remarque : quand le rapport signal sur bruit est grand, la capacité ne croît que comme son logarithme, et quand il est petit, elle lui est à peu près proportionnelle.

```figure
file: fig-1.svg
caption: Débit maximal par hertz de bande en fonction du rapport signal sur bruit, d'après la formule de Shannon
scroll: La courbe se trace, les trois exemples du cours s'y posent, puis une flèche ramène la 4G tout à gauche, là où se trouve la liaison satellite.
steps:
- La formule de Shannon donne le débit maximal par hertz de bande. À droite, la courbe monte lentement ; à gauche, elle colle à zéro.
- Les trois exemples du cours sont tous à droite. Avec 20 dB, la 4G transporte près de 7 bits par seconde dans chaque hertz.
- Un satellite à 780 km est 260 fois plus loin qu'une antenne à 3 km. La puissance reçue est divisée par 260², soit 48 dB de moins.
- La liaison tombe à −28 dB. Chaque hertz ne porte plus que 0,002 bit par seconde, trois mille fois moins qu'en 4G.
```

## Ce que la formule dit du satellite

Faisons le calcul, en ordre de grandeur. Je pars de l'exemple 4G du cours et je suppose qu'il correspond à une antenne située à 3 km. Une onde radio se dilue comme le carré de la distance. À 780 km, on est 260 fois plus loin, donc le signal reçu est 260² ≈ 68 000 fois plus faible, soit 48 dB de moins. Le rapport signal sur bruit passe de 20 dB à −28 dB : le signal est environ 600 fois plus faible que le bruit.

La formule donne alors, sur les mêmes 20 MHz, 20 000 000 × log2(1,0016) ≈ 46 kbit/s. On est passé de 133 Mbit/s à 46 kbit/s. C'est l'ordre de grandeur du NB-IoT, pas celui d'un flux vidéo.

Le résultat intéressant vient ensuite. Si je concentre la même puissance dans 180 kHz au lieu de 20 MHz, le rapport signal sur bruit remonte à −7,5 dB et la capacité vaut 180 000 × log2(1,18) ≈ 42 kbit/s. La bande est 111 fois plus étroite et le débit maximal ne baisse que de 8 %.

```figure
file: fig-2.svg
caption: Débit maximal en fonction de la largeur de bande, à puissance reçue fixée (celle de la liaison satellite de l'exemple)
scroll: La courbe monte puis s'aplatit sous un plafond ; deux points apparaissent, l'un à 20 MHz, l'autre à 180 kHz, presque à la même hauteur.
steps:
- À puissance reçue fixée, élargir la bande augmente d'abord le débit maximal, puis de moins en moins.
- La courbe bute sur un plafond qui ne dépend que de la puissance reçue et du bruit, ici 46 kbit/s.
- Avec les 20 MHz d'une bande 4G, on touche ce plafond.
- Avec 180 kHz, la largeur du NB-IoT, on atteint déjà 42 kbit/s. La bande étroite ne coûte presque rien.
```

Le cours l'écrit en une ligne : quand la bande devient très large, donc le rapport signal sur bruit très faible, la capacité tend vers (P / N0) × log2(e), soit 1,44 × P / N0. La largeur de bande a disparu de la formule. Dans ce régime, seule compte l'énergie que l'on arrive à capter. Une norme à bande étroite, pensée pour des puces simples et sobres, est donc bien adaptée au satellite : elle ne renonce qu'à du débit que la physique n'offrait pas.

## Ce qu'il faut en retenir

Le cours insiste sur les rendements décroissants de la puissance : doubler celle d'un réseau 4G n'ajoute que 15 % de débit. Pour le satellite, c'est l'inverse. On est dans la partie linéaire de la courbe, et chaque doublement de la puissance reçue double le débit. C'est pourquoi tout l'effort porte sur les antennes et sur l'altitude, et non sur l'achat de fréquences supplémentaires.

```figure
file: fig-3.svg
caption: Effet d'un doublement de la puissance reçue sur le débit maximal, pour un réseau 4G et pour la liaison satellite de l'exemple
scroll: Deux barres grises donnent le débit de départ ; la barre 4G grandit à peine quand la puissance double, celle du satellite double de hauteur.
steps:
- Deux liaisons sur 20 MHz. Les barres ne sont pas à la même échelle : 133 Mbit/s pour la 4G, 46 kbit/s pour le satellite.
- On double la puissance reçue en 4G. Le débit maximal ne gagne que 15 %.
- On double la puissance reçue du satellite. Le débit maximal double. Chaque décibel gagné sur l'antenne se retrouve dans le débit.
```

Mon calcul reste un ordre de grandeur. Les 3 km sont une hypothèse de ma part. L'antenne d'un satellite concentre son énergie en faisceaux, ce qui rattrape une partie des 48 dB. Dans l'autre sens, l'objet n'émet qu'avec 200 mW au plus (23 dBm dans la norme), ce qui rend la liaison montante encore plus serrée. Enfin, la capacité est une borne supérieure, que le cours dit atteinte dans des conditions idéales de codage, et Iridium n'a pas publié le débit réel de son service. La formule ne prédit donc pas ce débit. Elle dit pourquoi il se compte en kilobits, et pourquoi ce n'est pas la norme qui le limite.

## Sources

- [Via Satellite, « Iridium Launches Service for Iridium NTN Direct; Its Standards-Based D2D Offering », 17 novembre 2026](https://satellitetoday.com/connectivity/2026/11/17/iridium-launches-service-for-iridium-ntn-direct-its-standards-based-d2d-offering)
- [Communiqué d'Iridium du 17 novembre 2026, repris par Finviz](https://finviz.com/news/423847/iridium-activates-iridium-ntn-direct-worlds-first-standards-based-nb-iot-and-d2d-service-with-truly-global-coverage)
- [SatNews, « Iridium Activates Commercial Service on Standards-Based NB-IoT Direct-to-Device Network », 18 novembre 2026](https://satnews.com/2026/11/18/iridium-activates-commercial-service-on-standards-based-nb-iot-direct-to-device-network/)
- [eoPortal, fiche de la constellation Iridium NEXT (66 satellites, 780 km)](https://www.eoportal.org/satellite-missions/iridium-next)
- [Wikipédia, « Narrowband IoT » (largeur de bande, débits, puissance d'émission)](https://en.wikipedia.org/wiki/Narrowband_IoT)
