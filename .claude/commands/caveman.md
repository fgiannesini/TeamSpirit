Réécris le fichier cible (par défaut CLAUDE.md) en style "caveman" pour réduire les tokens :

**Règles :**
- Supprimer articles (le, la, les, un, une, des, the, a, an)
- Supprimer auxiliaires (est, sont, a, ont, is, are, has, have)
- Supprimer prépositions superflues
- Supprimer formules de politesse ("assure-toi de", "veille à", "make sure to")
- Supprimer phrases d'intro génériques (ex: "This file provides guidance...")
- Compresser descriptions verbeuses en formules courtes
- Préférer listes aux phrases complètes
- Conserver blocs de code et chemins de fichiers intacts
- Conserver les informations critiques (comportements non-évidents, contraintes)

**Ne pas appliquer à :** messages utilisateur, explications complexes, docstrings publiques.

Afficher le gain estimé en tokens (avant/après) une fois terminé.
