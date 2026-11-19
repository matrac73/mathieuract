---
title: "Artemis II : pourquoi la NASA a raccourci la rentrée d'Orion"
summary: "Le retour d'Artemis II lu avec l'équation de la chaleur : dans un bouclier thermique, la profondeur atteinte par la chaleur dépend du temps qu'on lui laisse, et l'intérieur continue de chauffer quand la surface refroidit."
hook: "Pour ménager le bouclier d'Orion, la NASA a choisi une rentrée plus raide et plus courte : la chaleur s'enfonce lentement dans un matériau, et lui laisser moins de temps limite les dégâts en profondeur."
category: "perspective"
date: "2026-04-10"
written: "2026-04"
readingMinutes: 5
course: "EDP (Équations aux Dérivées Partielles) (1A)"
news:
  title: "As it happened: Artemis 2 splashes down, 'a perfect mission'"
  source: "Astronomy Magazine"
  url: "https://www.astronomy.com/space-exploration/artemis-2-splashes-down/"
  date: "2026-04-10"
---

Le 10 avril 2026 à 20 h 07, heure de la côte est des États-Unis, la capsule Orion de la mission Artemis II s'est posée dans le Pacifique, près de San Diego. Reid Wiseman, Victor Glover, Christina Koch et Jeremy Hansen rentrent d'un vol d'un peu plus de neuf jours autour de la Lune. La partie la plus surveillée du voyage a duré un quart d'heure : la traversée de l'atmosphère.

## Une rentrée volontairement plus courte

Orion aborde l'atmosphère à 122 km d'altitude, à environ 40 000 km/h. Le freinage par l'air transforme cette vitesse en chaleur, avec un pic compris entre 2 200 et 2 760 °C. La capsule est protégée par un bouclier de 5 mètres de diamètre, fait d'un matériau ablatif, l'Avcoat. Ablatif veut dire qu'il est prévu pour se consumer peu à peu en surface.

En 2022, le vol d'essai sans équipage Artemis I avait utilisé une rentrée « avec rebond » : la capsule plonge dans la haute atmosphère, en ressort grâce à sa portance, puis replonge. Elle avait parcouru 3 178 milles nautiques, soit environ 5 900 km, avec une vingtaine de minutes de chauffe. Le bouclier était revenu abîmé : de la matière manquait à plus de cent endroits.

Pour Artemis II, le bouclier est de la même conception. La NASA a donc changé la trajectoire : une entrée plus raide, sans rebond, sur 1 071 milles nautiques (environ 2 000 km) et à peu près 14 minutes de chauffe.

```figure
file: fig-1.svg
caption: Deux façons de rentrer de la Lune, avec rebond (Artemis I) ou directement (Artemis II). Schéma de principe, seules les distances et l'altitude d'entrée sont à l'échelle.
scroll: La trajectoire avec rebond d'Artemis I se trace d'abord, puis l'entrée directe d'Artemis II apparaît en orange, trois fois plus courte.
steps:
- Orion aborde l'atmosphère à 122 km d'altitude, à environ 40 000 km/h. Toute cette vitesse doit devenir de la chaleur.
- En 2022, Artemis I plonge, ressort grâce à sa portance, puis replonge. Cela fait environ 5 900 km et 20 minutes de chauffe.
- Entre les deux plongées, la capsule remonte. La chauffe à la surface du bouclier baisse, puis reprend.
- En 2026, Artemis II entre plus raide, sans rebond. Environ 2 000 km et 14 minutes de chauffe, d'un seul tenant.
```

## L'équation de la chaleur

Le cours d'équations aux dérivées partielles consacre un chapitre à l'équation de la chaleur. Elle s'écrit ∂u/∂t − α Δu = f. Ici u est la température en chaque point et à chaque instant, f une source de chaleur, et Δu mesure l'écart entre la température d'un point et celle de ses voisins. Le coefficient α est la diffusivité du matériau. En clair : un point plus froid que son entourage se réchauffe, un point plus chaud se refroidit, et α règle la vitesse de ce nivellement. Le cours parle d'« effet régularisant » : la solution est toujours plus lisse que la situation de départ.

Ce qui m'intéresse ici est l'unité de α : des m²/s. Une longueur au carré divisée par un temps. Dans cette équation, temps et distance ne sont donc pas proportionnels. Le cours le fait apparaître quand il résout l'équation numériquement : avec un pas d'espace hx et un pas de temps ht, le schéma explicite n'est stable que si α × ht / hx² ≤ 1/2. Si l'on divise le pas d'espace par 2, il faut diviser le pas de temps par 4.

La même règle vaut pour la chaleur réelle : en un temps t, elle pénètre sur une profondeur de l'ordre de √(α × t). Prenons un isolant de diffusivité α = 10⁻⁷ m²/s, valeur que je choisis pour l'exemple et qui n'est pas celle de l'Avcoat. Si sa surface est maintenue chaude, la profondeur où la température atteint à peu près la moitié de celle de la surface vaut 4,6 mm après 3 minutes et demie, 9,2 mm après 14 minutes et 18 mm après 56 minutes.

```figure
file: fig-2.svg
caption: Température dans un isolant dont la surface est maintenue chaude (α = 10⁻⁷ m²/s, valeur d'exemple), à trois instants.
scroll: Les profils de température s'étalent vers la droite à chaque étape, et le point à mi-température recule de moins en moins vite.
steps:
- Un mur d'isolant, froid au départ. Sa face gauche est portée à une température fixe, que l'on prend comme unité.
- Après 3 minutes et demie, la chaleur a à peine pénétré. La température tombe à la moitié de celle de la surface dès 4,6 mm.
- Après 14 minutes, soit quatre fois plus tard, ce point n'a reculé que jusqu'à 9,2 mm.
- Après 56 minutes, il est à 18 mm. Pour aller deux fois plus profond, la chaleur a besoin de quatre fois plus de temps.
```

## Ce que le rebond change

En décembre 2024, la NASA a expliqué les dégâts d'Artemis I. Entre les deux plongées, la chauffe a baissé et l'énergie thermique s'est accumulée à l'intérieur de l'Avcoat. Les gaz produits par le matériau chauffé n'ont pas pu s'échapper, faute de perméabilité. La pression est montée, la couche externe s'est fissurée et des morceaux sont partis.

L'équation de la chaleur éclaire la première moitié de cette explication. Quand la surface cesse d'être chauffée, la chaleur déjà entrée ne s'arrête pas. Elle continue de s'étaler vers le froid, donc vers l'intérieur. Je reprends mon isolant d'exemple, avec de la chaleur déposée près de la surface, puis plus aucun apport. Entre 2 et 8 minutes, la surface perd la moitié de sa température, mais à 10 mm de profondeur la température passe de 12 % à 30 % de la valeur initiale en surface. Le rebond crée cette situation : une surface qui se calme et un intérieur qui continue de chauffer.

On comprend alors le choix fait pour Artemis II. Passer de 20 à 14 minutes ne réduit la profondeur atteinte que d'un facteur √(14/20) ≈ 0,84. Le gain principal est ailleurs : sans rebond, il n'y a plus de pause pendant laquelle la chaleur migre vers l'intérieur. La NASA le formule ainsi : limiter le temps passé dans la plage de températures où les dégâts sont apparus.

```figure
file: fig-3.svg
caption: Chaleur déposée en surface puis laissée à elle-même, dans le même isolant d'exemple. Modèle simplifié, sans apport ni perte en surface.
scroll: Le pic de température en surface s'affaisse et s'élargit, puis une flèche orange montre la température qui monte à 10 mm de profondeur.
steps:
- Après une première phase de chauffe, la chaleur est concentrée dans les premiers millimètres.
- On cesse de chauffer. Six minutes plus tard, le profil s'est affaissé et étalé vers l'intérieur.
- En surface, la température a été divisée par deux.
- À 10 mm de profondeur, elle est passée de 12 % à 30 % de la valeur de départ. L'intérieur chauffe alors que la surface refroidit.
```

## Ce que l'équation ne dit pas

Le cours fait lui-même une réserve sur ce modèle. L'équation de la chaleur prédit qu'un point éloigné se réchauffe un tout petit peu instantanément, ce qui est physiquement impossible. Il en tire une consigne : ne pas demander si un modèle est vrai, mais s'il est utile pour l'application visée.

Ici, il est utile pour deux choses : la règle du carré entre temps et profondeur, et le fait que l'intérieur d'un matériau chauffe encore après la surface. Il ne dit rien des gaz, de la pression ni des fissures. Un bouclier ablatif se transforme et sa surface recule, ce que mon calcul à diffusivité constante ignore. La NASA a d'ailleurs eu besoin de 121 essais, répartis en huit campagnes, pour reproduire le phénomène au sol.

La trajectoire n'est qu'une parade. Pour les missions suivantes, la NASA fabrique des boucliers dont la perméabilité est uniforme, afin que les gaz puissent sortir. Quant au bouclier d'Artemis II, c'est son inspection qui dira si la rentrée courte a tenu ses promesses.

## Sources

- [Astronomy Magazine, « As it happened: Artemis 2 splashes down, 'a perfect mission' » (10 avril 2026)](https://www.astronomy.com/space-exploration/artemis-2-splashes-down/)
- [NASA, « NASA Identifies Cause of Artemis I Orion Heat Shield Char Loss » (5 décembre 2024)](https://www.nasa.gov/missions/artemis/nasa-identifies-cause-of-artemis-i-orion-heat-shield-char-loss)
- [Space.com, « The Artemis 1 moon mission had a heat shield issue. Here's why NASA doesn't think it will happen again on Artemis 2 » (17 février 2026)](https://www.space.com/space-exploration/artemis/the-artemis-1-moon-mission-had-a-heat-shield-issue-heres-why-nasa-doesnt-think-it-will-happen-again-on-artemis-2)
