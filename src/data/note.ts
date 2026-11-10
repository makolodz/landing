export const note = {
  name: 'Fabio',
  title: "Le compagnon de fablab qui sait ce qui est libre et si l'air est sain",
  subtitle: "Projet IoT / mobile / web / IA · projet d'école, 3 semaines, en solo",
  sensors: [
    { label: 'Puissance des machines', detail: 'Prises connectées Shelly : machine libre, en marche ou en panne' },
    { label: "Qualité de l'air", detail: 'Près de la découpeuse laser : particules, COV, température' },
    { label: 'Poids de la bobine', detail: 'Cellule de charge + HX711 : filament restant' },
    { label: "Présence dans l'atelier", detail: 'Radar Zigbee : occupation du lieu et alerte si une machine tourne seule' },
  ],
  actuator: { label: 'Relais / prise', detail: "Alimentation de l'imprimante 3D : démarrage et coupure" },
  mobile: [
    'Machines libres en temps réel et réservation de créneaux',
    "Suivi de l'impression 3D et notification de fin",
    '« Lancer à distance », disponible uniquement quand la machine est opérationnelle',
  ],
  backoffice: [
    "Machines, membres, réservations, seuils d'alerte (qualité de l'air, stock mini)",
    "Historique d'utilisation des machines et des alertes de sécurité",
    'Stocks de consommables (filament restant par bobine)',
  ],
  vitrine: [
    'Présentation du fablab, machines disponibles et horaires',
    "État du lieu en direct (machines libres, qualité de l'air) et inscription des nouveaux membres",
  ],
  ai: [
    {
      label: 'Règles dictées',
      who: 'makers',
      text: '« Préviens-moi quand mon impression est finie » ou « Alerte-moi si les particules dépassent X près de la laser ». Le modèle produit une règle JSON, le maker la relit et l\'active.',
    },
    {
      label: 'Résumé du soir',
      who: 'fabmanager',
      text: '« Laser très utilisée, deux alertes d\'air, il reste 180 g de PLA » : une notification en langage naturel chaque soir.',
    },
  ],
  guardrail:
    "Les règles dictées suivent un schéma JSON strict et ne peuvent que notifier, jamais commander le relais. L'IA conseille et rédige, les règles de sécurité décident.",
  rule:
    "Un maker lance son impression à distance : l'imprimante n'est lancée que si elle est libre. Coupure automatique en fin d'impression ou si la température dépasse le seuil de sécurité, et alerte si une machine tourne alors que l'atelier est vide.",
  challenge:
    "Dialoguer avec l'imprimante (Klipper/Moonraker ou OctoPrint) pour lire l'avancement réel, et garder le démarrage à distance réservé à l'imprimante 3D (jamais laser ni CNC).",
  validation: {
    sentence:
      "Un compagnon qui permet aux makers de savoir, réserver et piloter les machines d'un fablab, et au fabmanager de surveiller la sécurité et les stocks.",
    checks: ['Utilisateurs réels : makers et fabmanager', '4 types de capteurs', '1 actionneur', '1 règle automatique concrète'],
  },
};

export const versions = [
  { slug: 'atelier', name: 'Atelier', tagline: 'Papier kraft, encre et orange sécurité' },
  { slug: 'terminal', name: 'Terminal', tagline: 'Fond sombre, vert phosphore, monospace' },
  { slug: 'pop', name: 'Pop', tagline: 'Aplats vifs, formes rondes, ton joueur' },
  { slug: 'slides', name: 'Pop · Diaporama', tagline: 'Pop en slides, avec Fabi la mascotte (← → pour naviguer)' },
  { slug: 'materiel', name: 'Le matériel', tagline: 'Les capteurs retenus, pourquoi ils comptent, et où les acheter' },
];

export const hardwareDate = '10/11/2026';

export const hardware = [
  {
    id: 'plug',
    icon: '🔌',
    color: '#4dabf7',
    category: 'Prise connectée',
    name: 'Sonoff S60ZBTPF (iPlug S60)',
    status: 'Déjà en main',
    price: '12,99 € chez Domadoo · 18,24 € chez Kubii (en stock)',
    why: [
      'Zigbee 3.0 en local : pas de cloud, et pas de wifi à régler pour les prises, ce qui contourne le problème du wifi d\'école.',
      'Elle mesure la puissance en watts : un seuil suffit pour dire « libre », « en marche » ou « en panne ».',
      'Elle sert aussi d\'actionneur : couper ou rétablir le courant de l\'imprimante selon la règle phare, sans toucher au 230 V.',
      'Chaque prise relaie le signal Zigbee : plus il y en a dans l\'atelier, plus le réseau est solide.',
      'Elle est prise en charge par Zigbee2MQTT : les mesures arrivent sur MQTT, comme dans l\'architecture prévue.',
    ],
    watch: [
      '16 A et 4 000 W maximum : compare avec la plaque de la découpeuse laser et de la CNC.',
      'Une prise par machine suivie : prévoir 2 de plus pour 3 machines.',
    ],
    links: [
      { label: 'Domadoo', url: 'https://www.domadoo.fr/fr/produits-zigbee/7851-sonoff-s60zbtpf-prise-connectee-zigbee-16a-mesure-consommation.html' },
      { label: 'Kubii', url: 'https://www.kubii.com/en/power-supplies/4865-sonoff-iplug-zigbee-smart-plug-s60-series-6920075743005.html' },
      { label: 'Sonoff (fabricant)', url: 'https://sonoff.tech/fr-eu/products/sonoff-iplug-zigbee-smart-plug-s60-series' },
      { label: 'Compatibilité Zigbee2MQTT', url: 'https://www.zigbee2mqtt.io/devices/S60ZBTPF.html' },
    ],
  },
  {
    id: 'dongle',
    icon: '📡',
    color: '#ffd43b',
    category: 'Passerelle Zigbee',
    name: 'Sonoff ZBDongle-E (clé coordinateur Zigbee)',
    status: 'À prendre : nécessaire avec une prise Zigbee',
    price: '25,40 € sur le site Sonoff (page boutique FR)',
    why: [
      'C\'est la pièce qui fait parler la prise Zigbee : une clé USB branchée sur le Raspberry Pi qui héberge déjà Mosquitto.',
      'Avec Zigbee2MQTT, tout ce qui est Zigbee (prises, capteurs) devient des messages MQTT : le reste de l\'architecture ne change pas.',
      'Une seule clé gère toutes les prises et les capteurs de l\'atelier.',
    ],
    watch: [
      'Sonoff recommande une rallonge USB pour éloigner la clé du Raspberry Pi (interférences).',
      'Si tu as déjà un hub Zigbee compatible, tu peux t\'en passer : à vérifier avec ton matériel.',
    ],
    links: [
      { label: 'Sonoff (fabricant)', url: 'https://sonoff.tech/fr-eu/products/sonoff-zigbee-3-0-usb-dongle-plus-zbdongle-e' },
    ],
  },
  {
    id: 'air',
    icon: '🌫️',
    color: '#ff6b6b',
    category: 'Qualité de l\'air',
    name: 'Moniteur de qualité de l\'air 5 en 1 UTTASU (Tuya, version Zigbee)',
    status: 'À prendre (choisir l\'option « Zig Bee »)',
    price: 'Prix non affiché : indisponible sur Amazon.fr le 10/11/2026, à confirmer',
    why: [
      'Un seul boîtier annonce particules PM2.5, COV (TVOC), température et humidité, avec CO2 et formaldéhyde (HCHO) selon la fiche.',
      'La fiche propose une version Zigbee : il s\'appaire à la même clé que les prises, sans ESP32 ni câblage.',
      'Les valeurs arrivent sur MQTT et déclenchent les alertes du fabmanager et le résumé du soir de l\'IA.',
      'Alimentation USB 5 V : pas de pile à surveiller.',
    ],
    watch: [
      'Compatibilité Zigbee2MQTT à vérifier : ce modèle générique Tuya n\'a pas de page dédiée trouvée. Vérifie qu\'il est reconnu et que tous ses capteurs remontent avant de compter dessus.',
      'La fiche Amazon est une traduction automatique incohérente (CO2, HCHO, plages de mesure) et ne donne aucune précision : à confirmer auprès du vendeur.',
      'Vendeur unique, produit en ligne depuis août 2026, sans avis visible : prévoir un plan B (Heiman HS2AQ-EF-3.0).',
      'Alimentation USB : prévoir une prise secteur près de la laser, hors du flux direct d\'aspiration.',
    ],
    links: [
      { label: 'Amazon.fr', url: 'https://www.amazon.fr/dp/B0HGNW1J6H' },
      { label: 'Plan B : Heiman HS2AQ-EF-3.0', url: 'https://www.zigbee2mqtt.io/devices/HS2AQ-EF-3.0.html' },
    ],
  },
  {
    id: 'presence',
    icon: '🧍',
    color: '#69db7c',
    category: 'Présence dans l\'atelier',
    name: 'Sonoff SNZB-06P (capteur de présence radar Zigbee)',
    status: 'À prendre',
    price: '11,99 € chez Domadoo (un autre relevé indique 16,19 €) · 13,90 € chez Expert4House',
    why: [
      'Un radar 5,8 GHz détecte les personnes en mouvement mais aussi immobiles : un maker penché sur sa découpe est bien vu, contrairement à un simple détecteur de mouvement.',
      'Il sait si l\'atelier est occupé : l\'info alimente l\'état du lieu en direct sur la vitrine et l\'application.',
      'Sécurité : si une machine tourne (puissance mesurée par la prise) alors que l\'atelier est vide, le fabmanager est alerté, surtout pour la laser.',
      'Il parle Zigbee : même réseau que les prises, aucune soudure, aucun ESP32 en plus.',
    ],
    watch: [
      'Compatibilité : il peut apparaître comme un capteur de mouvement sur certaines plateformes, à vérifier sur la page Zigbee2MQTT avant achat.',
      'Alimenté par pile : à surveiller dans le tableau de bord du fabmanager.',
      'À placer face à la zone de travail ; le radar traverse les cloisons fines, donc éviter de viser un couloir.',
    ],
    links: [
      { label: 'Domadoo', url: 'https://www.domadoo.fr/fr/securite/6827-capteur-de-presence-humaine-zigbee-30-technologie-radar-sonoff.html' },
      { label: 'Sonoff (fabricant)', url: 'https://sonoff.tech/fr-eu/products/sonoff-zigbee-human-presence-sensor-snzb-06p' },
      { label: 'Compatibilité Zigbee2MQTT', url: 'https://www.zigbee2mqtt.io/devices/SNZB-06P.html' },
    ],
  },
];

export const budget = {
  lines: [
    ['Capteur d\'air UTTASU 5 en 1', 'prix à confirmer'],
    ['Capteur de présence SNZB-06P', '11,99 €'],
  ],
  total: '11,99 € + air',
  note: 'Le prix du capteur d\'air n\'est pas affiché (produit indisponible) : le total ne le compte pas. Le prix de la présence est celui de Domadoo (jusqu\'à 16,19 € selon les relevés). Hors clé Zigbee ZBDongle-E (25,40 €, déjà prévue), hors prises supplémentaires (12,99 € pièce chez Domadoo) et frais de port.',
};
