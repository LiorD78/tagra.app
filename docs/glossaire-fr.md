# TAGRA FR — glossaire terminologique contraignant (tachygraphe)

Source: Règlement (UE) 165/2014 + AETR, version française officielle.
Ces termes sont NON NÉGOCIABLES — un conducteur agit sur ce texte lors d'un
contrôle routier.

**Použití:** tenhle soubor jde celý do system promptu překladové dávky
(viz `CHECKLIST-novy-jazyk.md`, sekce 13). Každý nový jazyk dostane vlastní
`glossaire-{L}.md` postavený ze **znění nařízení v cílovém jazyce**, ne
z volného překladu téhle tabulky.

Ověřeno v praxi na `/fr/articles/symboles-tachygraphe/` (12. 9. 2026,
1 212 stringů, 0 terminologických flagů).

| EN | FR (obligatoire) | NE PAS utiliser |
|---|---|---|
| (digital) tachograph | tachygraphe (numérique) | chronotachygraphe, tachographe |
| smart tachograph | tachygraphe intelligent | tachygraphe malin |
| vehicle unit (VU) | unité embarquée (UEV) | unité véhicule |
| motion sensor | capteur de mouvement | capteur de vitesse |
| driver card | carte de conducteur | carte chauffeur |
| company card | carte d'entreprise | — |
| workshop card | carte d'atelier | — |
| control card | carte de contrôleur | carte de contrôle |
| event | événement | incident |
| fault | anomalie | défaut, panne, erreur |
| warning | avertissement | alerte |
| driving time warning | avertissement de temps de conduite | — |
| Driving | CONDUITE | — |
| Other work | AUTRE TÂCHE | autre travail |
| Availability | DISPONIBILITÉ | — |
| Break/rest | PAUSE/REPOS | — |
| daily rest period | temps de repos journalier | — |
| driving without a card | conduite sans carte | — |
| card insertion while driving | insertion de carte en conduite | — |
| security breach | atteinte à la sécurité | violation de sécurité |
| tampering | manipulation frauduleuse | trucage, sabotage |
| (approved) workshop | atelier agréé | garage |
| recalibrate / calibration | réétalonner / étalonnage | recalibrer, calibration |
| printout | ticket d'impression | impression papier |
| to print the day's activities | imprimer les activités de la journée | — |
| manual record / manual entry | saisie manuelle | enregistrement manuel |
| download (data) | téléchargement (des données) | déchargement |
| roadside check | contrôle routier | contrôle sur route |
| enforcement officer | agent de contrôle | contrôleur |
| member state | État membre | pays membre |
| fleet manager | gestionnaire de parc | responsable de flotte |
| slot 1 / slot 2 | lecteur 1 / lecteur 2 | fente, slot |
| co-driver | deuxième conducteur | co-conducteur |
| self-test | autotest | test automatique |
| chip contacts | contacts de la puce | — |
| time conflict | conflit horaire | — |
| vehicle motion conflict | conflit de mouvement du véhicule | — |
| internal fault | anomalie interne | défaut interne |
| power supply / power interruption | alimentation / coupure d'alimentation | — |
| fault memory | mémoire d'anomalies | mémoire de défauts |
| Bus Off | état « Bus Off » (garder tel quel) | — |
| articulated truck | semi-remorque | camion articulé |
| lorry / truck | poids lourd | camion (acceptable 1×) |

## Règles de style

- Vouvoiement neutre-professionnel ; s'adresser au conducteur (« vous »).
- Nombres: virgule décimale (7,5 t · 40 t · 56 h). Insécable avant les unités.
- Codes d'erreur, sigles produits (DTCO, SE5000, EFAS, VDO, GNSS, DSRC, ITS, CAN)
  et références de manuels: NE PAS traduire.
- « TAGRA », noms de produits et prix (49 €) inchangés.
- Messages affichés à l'écran de l'appareil (tout en MAJUSCULES): garder VERBATIM.
- Guillemets français « … » dans la prose ; garder les entités HTML telles quelles
  (`&amp;` `&nbsp;` `&rarr;` etc.) — ne jamais les décoder ni les traduire.
- Conserver EXACTEMENT la ponctuation structurante du source: les séparateurs
  « · », « — », « → », les parenthèses et les plages numériques (001–066).
- Ne jamais ajouter/retirer de balises: les chaînes sont du texte pur.
