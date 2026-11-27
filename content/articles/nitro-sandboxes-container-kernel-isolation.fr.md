---
title: "Un noyau par conteneur : le cloud revient sur son raccourci"
summary: "AWS place chaque conteneur dans sa propre petite machine virtuelle. Le cours de cloud explique pourquoi : le conteneur doit sa légèreté au noyau partagé, et c'est ce partage qui pose problème avec du code inconnu."
hook: "Les conteneurs sont légers parce qu'ils partagent un même système ; Amazon donne désormais à chacun le sien, car ce partage devient risqué quand on exécute du code écrit par une IA."
category: "perspective"
date: "2026-11-10"
written: "2026-11"
readingMinutes: 5
course: "Cloud computing et informatique distribuée (2A)"
courseSlug: "cloud-computing-et-informatique-distribuee-2a"
news:
  title: "Nitro Sandboxes: Hardware isolation for every EKS pod, ECS task, and EC2 workload"
  source: "AWS Compute Blog"
  url: "https://aws.amazon.com/blogs/compute/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/"
  date: "2026-11-10"
---

Amazon Web Services (AWS) a présenté le 10 novembre les Nitro Sandboxes, que j'appellerai ici des bacs à sable. L'idée : chaque conteneur lancé sur une machine louée chez AWS peut désormais tourner dans sa propre petite machine virtuelle, avec son propre noyau, sans supplément de prix. AWS cite notamment les agents d'IA, qui exécutent du code que personne n'a relu. L'annonce revient sur un choix que mon cours de cloud computing présentait comme l'avantage des conteneurs.

## Deux façons de ranger plusieurs programmes sur une machine

Un fournisseur de cloud fait tourner les programmes de nombreux clients sur les mêmes serveurs. Le cours pose le dilemme simplement. Plusieurs services sur une même machine, c'est un bon usage des ressources mais une isolation limitée. Un service par machine, c'est l'inverse : bien isolé, mais du matériel gaspillé.

La première réponse est la machine virtuelle. Le cours la définit comme un environnement qui se comporte comme un ordinateur, avec son processeur, sa mémoire, son réseau et son disque. Un logiciel appelé hyperviseur gère les échanges entre ces machines virtuelles et le matériel réel. Chacune embarque un système d'exploitation complet, et donc son propre noyau, c'est-à-dire le programme central qui parle au matériel et arbitre entre les applications. Le défaut est le poids : le cours cite la formule d'un auteur pour qui emballer une seule application dans une machine virtuelle revient à affréter un navire géant pour un camion de bananes.

La seconde réponse est le conteneur : une boîte standard qui contient un programme et ses dépendances, et rien d'autre. Le cours le décrit comme une sorte de machine virtuelle légère, en précisant aussitôt que ce n'en est pas une. Docker, l'outil étudié en cours, parle d'un environnement « faiblement isolé ». La raison tient en une ligne du cours : Docker s'appuie sur des fonctions du noyau Linux, qui donnent à chaque conteneur une vue séparée du système et un plafond de ressources. Tous les conteneurs d'une machine s'adressent donc au même noyau.

```figure
file: fig-1.svg
caption: Une machine virtuelle embarque son noyau, les conteneurs se partagent celui de l'hôte
scroll: Les deux empilements se construisent côte à côte, puis les noyaux s'allument en orange
steps:
- À gauche, la machine virtuelle. Un hyperviseur répartit le matériel entre des machines qui embarquent chacune un système d'exploitation complet.
- À droite, les conteneurs. Ils ne contiennent que l'application et ses dépendances, et reposent tous sur le système de la machine hôte.
- La différence est le nombre de noyaux. Chaque machine virtuelle a le sien, alors que tous les conteneurs s'adressent au même.
```

## Ce que coûte le noyau partagé

C'est ce partage qui rend le conteneur rapide à construire et à démarrer. C'est aussi lui qui limite l'isolation. La séparation entre deux conteneurs est une règle appliquée par le noyau. Si un programme trouve une faille dans ce noyau, il n'y a plus de règle, et il peut atteindre ses voisins. L'ingénieur d'AWS qui signe l'annonce le dit ainsi : les conteneurs d'une même machine font tous confiance à un seul noyau Linux.

Tant que l'on fait tourner son propre code, relu et testé, le risque reste modéré. Il change de nature dans trois cas que cite AWS : les agents d'IA qui écrivent du code puis l'exécutent, les applications qui hébergent plusieurs clients sur les mêmes machines, et les chaînes de compilation qui lancent du code proposé par des inconnus.

```figure
file: fig-2.svg
caption: Avec un noyau partagé, une faille touche les voisins ; avec un noyau par bac, elle reste enfermée
scroll: Une attaque part du conteneur B, atteint le noyau commun, puis le dessin est remplacé par trois noyaux séparés
steps:
- Trois conteneurs tournent sur la même machine. Ils passent tous par le même noyau Linux.
- Le conteneur B exécute un code hostile, par exemple écrit par un agent d'IA manipulé. Ce code s'attaque au noyau.
- Si le noyau cède, la séparation entre conteneurs tombe avec lui. A et C sont exposés sans avoir rien fait.
- Avec un bac à sable par conteneur, B ne peut casser que son propre noyau. La frontière avec A et C est tenue par l'hyperviseur et le matériel.
```

## Ce que fait AWS, et à quel prix

Un Nitro Sandbox est une machine virtuelle légère lancée depuis une machine déjà louée, appelée instance parente. Elle tourne à côté de sa parente, directement sur l'hyperviseur d'AWS, et non à l'intérieur d'elle. On évite ainsi d'empiler deux couches de virtualisation, ce qui permet selon AWS des performances proches de celles d'une machine ordinaire. Aucun chiffre de mesure n'accompagne cette affirmation.

La documentation donne en revanche les limites. Le bac emprunte ses processeurs virtuels (vCPU, les fils d'exécution loués) et sa mémoire à l'instance parente. Sur une instance à 4 vCPU, on peut lancer jusqu'à 20 bacs d'un vCPU, soit 5 par vCPU. Chaque bac demande au moins 256 Mio de mémoire (un Mio vaut environ un million d'octets), plus 2 Mio de gestion. Vingt bacs réservent donc au minimum 20 × 256 = 5 120 Mio, soit 5 Gio. Un conteneur classique n'a pas ce plancher, puisqu'il n'a pas de noyau à loger.

```figure
file: fig-3.svg
caption: Ce qu'une instance à 4 vCPU peut porter, d'après la documentation d'AWS
scroll: Vingt bacs se posent sur quatre vCPU, puis apparaissent la mémoire de chacun et le nombre de cœurs réels
steps:
- L'instance parente loue 4 vCPU. Les bacs à sable n'ajoutent pas de puissance, ils se partagent celle-ci.
- AWS autorise 5 bacs par vCPU de la parente, donc 20 bacs d'un vCPU ici. Ils se relaient sur les mêmes processeurs.
- Chaque bac réserve au moins 256 Mio pour loger son noyau et son programme. Les 2 Mio de gestion sont à peine visibles à cette échelle.
- Sur les processeurs à deux fils par cœur, un cœur ne sert qu'un bac à la fois. Quatre vCPU font deux cœurs, donc deux bacs au plus calculent au même instant.
```

## Ce qu'il faut en retenir

Le navire à bananes du cours n'a pas disparu, il a été réduit : le bac reste plus lourd qu'un conteneur, mais on en range vingt sur une petite machine. Le raccourci du noyau partagé était acceptable tant que le code venait de l'équipe qui l'exploitait. Les agents d'IA changent cette hypothèse, et l'industrie remet un mur matériel là où elle l'avait retiré.

La notion ne dit pas tout. Un hyperviseur est aussi un logiciel, qui peut avoir ses propres failles. La documentation d'AWS signale d'ailleurs des fuites possibles par le réseau : un bac peut épuiser des ressources réseau communes à tous, et lire les identifiants de l'instance parente si l'on ne bloque pas cet accès. Isoler le noyau règle un problème précis, pas tous.

## Sources

- [Nitro Sandboxes: Hardware isolation for every EKS pod, ECS task, and EC2 workload (AWS Compute Blog)](https://aws.amazon.com/blogs/compute/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/)
- [Reprise intégrale du billet d'AWS, datée du 10 novembre 2026 (Noise)](https://noise.getoto.net/2026/11/10/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/)
- [Isolate workloads with AWS Nitro Sandboxes (documentation Amazon EC2)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nitro-sandboxes.html)
- [AWS Rolls Out Nitro Sandboxes to Give Containers Their Own VM Security Boundary (Cloud Native Now, 17 novembre 2026)](https://cloudnativenow.com/features/aws-rolls-out-nitro-sandboxes-to-give-containers-their-own-vm-security-boundary/)
