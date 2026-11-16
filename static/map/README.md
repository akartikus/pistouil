# Style de la carte

Fichiers servis tels quels par l'application. Direction artistique : `docs/design/direction.md`. Changement : `add-map-identity`.

| Chemin | Contenu |
| --- | --- |
| `style-light.json`, `style-dark.json` | Styles MapLibre (version 8), écrits à la main (ou dans Maputnik) ; **même structure** (mêmes sources, mêmes couches dans le même ordre, mêmes glyphes), seules les couleurs changent. `src/lib/map/style.spec.ts` le vérifie |
| `fonts/IBM Plex Mono {Regular,Bold}/` | Glyphes (`.pbf`) : Latin de base et Latin-1 (`0-255`), Latin étendu A (`256-511`), ponctuation générale (`8192-8447` : ’ « » – €) ; licence OFL dans `fonts/LICENSE-IBM-Plex-Mono.txt` |
| `icons/{famille}.png`, `@2x.png` | Disque coloré et symbole blanc par famille d'icône du catalogue (`health`, `food`, `shop`, `culture`, `service`, `nature`, `transport`, `leisure`, `neutral`) et `generic` (repli) ; sources SVG dans `icons/src/` |

L'adresse du fichier de tuiles (`pmtiles://zone.pmtiles`) et celle des glyphes sont relatives : le composant de carte les remplace à l'exécution par les adresses réelles.

## Couches de tuiles utilisées (schéma Protomaps v4)

`earth`, `landuse` (`kind` : parcs, jardins, bois, école, hôpital, cimetière, plage…), `water` (polygones et lignes), `buildings` (`kind` ≠ `address`, bâtiments individuels à partir du zoom 15, fusionnés avant), `roads` (`kind` : `highway`, `major_road`, `minor_road`, `path`), `places` (`kind_detail` : city, town, village, hamlet, neighbourhood, quarter). Les couches `pois`, `boundaries` et `landcover` ne sont pas affichées : les lieux viennent de nos propres fichiers.

## Fabriquer les glyphes

Dans un dossier temporaire :

```bash
npm install fontnik @ibm/plex-mono
node /chemin/du/dépôt/tools/map-tiles/build-glyphs.mjs node_modules/@ibm/plex-mono/fonts/complete/woff/IBMPlexMono-Bold.woff "/chemin/du/dépôt/static/map/fonts/IBM Plex Mono Bold"
```

(idem avec `IBMPlexMono-Regular.woff` pour `IBM Plex Mono Regular`). Le nom du dossier est celui utilisé dans `text-font` des styles.
