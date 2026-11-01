import {
  UserProfile,
  Recipe,
  RecipeComment,
  ForumTopic,
  ForumReply,
  ModerationReport,
  AppNotification,
  RecipeCollection,
  UserAddress,
  PurchaseOrder
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-camila',
    name: 'Camila Ríos',
    username: 'camicocina',
    email: 'usuario.basico@gusto.app',
    password: 'GustoUser2026!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    role: 'usuario',
    bio: 'Aficionada a la cocina casera. Disfrutando del nivel básico y descubriendo nuevas recetas todos los días.',
    specialties: ['Meal Prep', 'Cenas Rápidas', 'Smoothie Bowls'],
    dietaryPreferences: ['vegetariano'],
    subprofiles: [],
    followersCount: 420,
    followingUserIds: ['user-mateo', 'user-lucia'],
    pinnedRecipeId: undefined,
    wishlistRecipeIds: ['rec-3'],
    preferredPostalCode: '5000',
    preferredCity: 'Córdoba Capital',
    preferredStoreId: 'vea',
    addresses: [
      {
        id: 'addr-camila-1',
        alias: 'Casa Córdoba',
        street: 'Bv. Chacabuco',
        number: '620',
        apartment: '2D',
        city: 'Nueva Córdoba',
        province: 'Córdoba',
        postalCode: '5000',
        isDefault: true,
        notes: 'Edificio Los Robles.',
        createdAt: '2026-09-12T16:00:00.000Z'
      }
    ],
    wishlistIngredientItems: []
  },
  {
    id: 'user-mateo',
    name: 'Mateo Rossi',
    username: 'mateochef',
    email: 'chef.premium@gusto.app',
    password: 'GustoPremium2026!',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    role: 'premium',
    bio: 'Chef pastelero y usuario Premium de Gusto. Suscripción activa con acceso a recetas destacadas y beneficios.',
    specialties: ['Panadería artesanal', 'Pastelería francesa', 'Fermentación'],
    dietaryPreferences: ['vegetariano'],
    subprofiles: [
      {
        id: 'sub-mateo-kids',
        name: 'Menú Infantil Mateo',
        relation: 'Hijos',
        avatarColor: 'bg-emerald-500',
        dietaryRestrictions: ['bajo_sodio']
      }
    ],
    followersCount: 1420,
    followingUserIds: ['user-lucia', 'user-camila'],
    pinnedRecipeId: 'rec-1',
    wishlistRecipeIds: ['rec-2', 'rec-4'],
    preferredPostalCode: '1414',
    preferredCity: 'CABA (Palermo / Colegiales)',
    preferredStoreId: 'coto',
    addresses: [
      {
        id: 'addr-mateo-1',
        alias: 'Casa Principal',
        street: 'Av. Santa Fe',
        number: '3420',
        apartment: '4B',
        city: 'Palermo, CABA',
        province: 'Ciudad Autónoma de Buenos Aires',
        postalCode: '1414',
        isDefault: true,
        notes: 'Timbre 4B. Tocar timbre y dejar en recepción si no atiendo.',
        createdAt: '2026-09-01T10:00:00.000Z'
      }
    ],
    wishlistIngredientItems: []
  },
  {
    id: 'user-lucia',
    name: 'Lucía Valenzuela',
    username: 'lucianutri',
    email: 'editor.recetas@gusto.app',
    password: 'GustoEditor2026!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    role: 'editor',
    bio: 'Editora gastronómica y nutricionista clínica en Gusto. Curaduría de contenido culinario y recetas Sin TACC.',
    specialties: ['Cocina Sin TACC', 'Nutrición Metabólica', 'Baking Vegano'],
    dietaryPreferences: ['celiaco', 'vegano'],
    subprofiles: [],
    followersCount: 3890,
    followingUserIds: ['user-mateo'],
    pinnedRecipeId: 'rec-2',
    wishlistRecipeIds: ['rec-1', 'rec-3'],
    preferredPostalCode: '1428',
    preferredCity: 'CABA (Belgrano / Núñez)',
    preferredStoreId: 'jumbo',
    addresses: [
      {
        id: 'addr-lucia-1',
        alias: 'Departamento Belgrano',
        street: 'Av. Cabildo',
        number: '2150',
        apartment: '8A',
        city: 'Belgrano, CABA',
        province: 'Ciudad Autónoma de Buenos Aires',
        postalCode: '1428',
        isDefault: true,
        notes: 'Seguridad 24 hs en garita.',
        createdAt: '2026-09-10T12:00:00.000Z'
      }
    ],
    wishlistIngredientItems: []
  },
  {
    id: 'user-ignacio',
    name: 'Ignacio Gómez',
    username: 'ignacioadmin',
    email: 'admin@gusto.app',
    password: 'GustoAdmin2026!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    role: 'admin',
    bio: 'Administrador general y moderador de la plataforma Gusto.',
    specialties: ['Gestión de Calidad', 'Seguridad Alimentaria'],
    dietaryPreferences: [],
    subprofiles: [],
    followersCount: 95,
    followingUserIds: [],
    wishlistRecipeIds: [],
    preferredPostalCode: '1414',
    preferredCity: 'CABA (Palermo / Colegiales)',
    preferredStoreId: 'coto',
    addresses: [
      {
        id: 'addr-ignacio-1',
        alias: 'Oficina Central Gusto',
        street: 'Av. Corrientes',
        number: '1250',
        apartment: 'Piso 10',
        city: 'San Nicolás, CABA',
        province: 'Ciudad Autónoma de Buenos Aires',
        postalCode: '1001',
        isDefault: true,
        notes: 'Horario comercial 09:00 a 18:00 hs.',
        createdAt: '2026-08-01T09:00:00.000Z'
      }
    ],
    wishlistIngredientItems: []
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Hogaza Rústica de Masa Madre 100% Casera',
    description: 'Corteza ultra crujiente y miga alveolada con un toque sutil de acidez natural. Fermentación en frío de 24 horas.',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    coAuthors: ['Lucía Valenzuela'],
    status: 'published',
    createdAt: '2026-09-15T12:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    prepTimeMin: 40,
    cookTimeMin: 50,
    servings: 8,
    difficulty: 'media',
    category: 'panaderia',
    tags: ['vegano', 'vegetariano'],
    isFeaturedDay: true,
    isFeaturedWeek: true,
    isPinned: true,
    videoUrl: 'https://www.youtube.com/watch?v=2SVvTz_Bw-g',
    likesCount: 234,
    dislikesCount: 3,
    likedUserIds: ['user-lucia', 'user-camila'],
    dislikedUserIds: [],
    commentsCount: 18,
    nutrition: {
      calories: 210,
      proteinG: 7,
      carbsG: 42,
      fatG: 1.2,
      fiberG: 3.5,
    },
    ingredients: [
      {
        id: 'ing-1',
        name: 'Harina de Fuerza Orgánica 000',
        quantity: 500,
        unit: 'g',
        estimatedPrice: 2450,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        suggestedSubstitute: 'Harina 0000 Tradicional',
        category: 'secos'
      },
      {
        id: 'ing-2',
        name: 'Masa Madre activa al 100% de hidratación',
        quantity: 100,
        unit: 'g',
        estimatedPrice: 1950,
        storeName: 'Coto Digital',
        storeLocation: 'Sucursal Abasto - Av. Corrientes 3247, CABA',
        inStock: true,
        stockLevel: 'medio',
        suggestedSubstitute: 'Levadura fresca prensada (15g)',
        category: 'frescos'
      },
      {
        id: 'ing-3',
        name: 'Agua filtrada a temperatura ambiente',
        quantity: 350,
        unit: 'ml',
        estimatedPrice: 450,
        storeName: 'Supermercados Dia',
        storeLocation: 'Honduras 4100, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-4',
        name: 'Sal marina fina sin aditivos',
        quantity: 10,
        unit: 'g',
        estimatedPrice: 650,
        storeName: 'Jumbo a Casa',
        storeLocation: 'Av. Int. Bullrich 345, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'especias'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Autólisis e hidratación inicial',
        description: 'Mezclar la harina orgánica con 330 ml de agua en un bowl de vidrio hasta que no queden restos secos. Cubrir y dejar reposar 45 minutos para desarrollar el gluten de forma pasiva.',
        durationMinutes: 45,
        tip: 'No añadir la sal todavía; retrasa la autólisis.',
        imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80'
      },
      {
        stepNumber: 2,
        title: 'Incorporación de Masa Madre y Sal',
        description: 'Verter la masa madre espumosa y el resto de agua (20 ml) con la sal disuelta. Amasar mediante pliegues franceses enérgicos durante 5 minutos hasta que la masa gane elasticidad.',
        durationMinutes: 10,
        tip: 'Si la masa se pega a tus dedos, humedece ligeramente tus manos con agua fría.',
        videoUrl: 'https://www.youtube.com/watch?v=2SVvTz_Bw-g'
      },
      {
        stepNumber: 3,
        title: 'Pliegues en bloque y fermentación en frío',
        description: 'Realizar 4 series de pliegues (stretch and fold) cada 30 minutos. Luego preformar una bola tensa, colocar en banneton enharinado con harina de arroz y llevar al refrigerador (4°C) por 18 a 24 horas.',
        durationMinutes: 120,
        tip: 'La harina de arroz evita totalmente que la masa se adhiera a la tela del cesto.'
      },
      {
        stepNumber: 4,
        title: 'Greñado y horneado en olla de hierro (Dutch Oven)',
        description: 'Precalentar el horno con la olla de hierro a 240°C durante 45 minutos. Volcar la hogaza, realizar un corte longitudinal inclinado con cuchilla afilada y hornear 20 min tapado, luego 25 min destapado a 210°C.',
        durationMinutes: 50,
        tip: 'Deja enfriar completamente sobre rejilla antes de rebanar para que la miga fije su estructura.'
      }
    ]
  },
  {
    id: 'rec-2',
    title: 'Pasta al Pesto Genovés Sin TACC (Apta Celíacos)',
    description: 'Penne rigati a base de harina de maíz y arroz con pesto fresco al mortero de albahaca fresca, piñones tostados y aceite de oliva virgen extra.',
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-lucia',
    authorName: 'Lucía Valenzuela',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    coAuthors: [],
    status: 'published',
    createdAt: '2026-09-28T09:30:00.000Z',
    updatedAt: '2026-09-29T11:15:00.000Z',
    prepTimeMin: 15,
    cookTimeMin: 12,
    servings: 4,
    difficulty: 'facil',
    category: 'pastas',
    tags: ['celiaco', 'vegetariano'],
    isFeaturedDay: true,
    isFeaturedWeek: true,
    isPinned: true,
    likesCount: 189,
    dislikesCount: 1,
    likedUserIds: ['user-mateo'],
    dislikedUserIds: [],
    commentsCount: 9,
    nutrition: {
      calories: 390,
      proteinG: 11,
      carbsG: 58,
      fatG: 14,
      fiberG: 4.2,
    },
    ingredients: [
      {
        id: 'ing-5',
        name: 'Pasta seca Penne Rigate certificada Sin TACC',
        quantity: 400,
        unit: 'g',
        estimatedPrice: 3200,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        suggestedSubstitute: 'Fideos Fusilli de Arroz Sin TACC',
        category: 'secos'
      },
      {
        id: 'ing-6',
        name: 'Albahaca fresca de hojas anchas',
        quantity: 60,
        unit: 'g',
        estimatedPrice: 1400,
        storeName: 'Supermercados Dia',
        storeLocation: 'Honduras 4100, CABA',
        inStock: true,
        stockLevel: 'medio',
        suggestedSubstitute: 'Rúcula fresca silvestre',
        category: 'frescos'
      },
      {
        id: 'ing-7',
        name: 'Piñones o nueces tostadas',
        quantity: 40,
        unit: 'g',
        estimatedPrice: 2800,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'medio',
        suggestedSubstitute: 'Nueces mariposa o almendras peladas',
        category: 'secos'
      },
      {
        id: 'ing-8',
        name: 'Queso Parmigiano Reggiano rallado fino (sin gluten)',
        quantity: 70,
        unit: 'g',
        estimatedPrice: 3900,
        storeName: 'Jumbo a Casa',
        storeLocation: 'Av. Int. Bullrich 345, CABA',
        inStock: true,
        stockLevel: 'alto',
        suggestedSubstitute: 'Queso Sardo estacionado',
        category: 'lacteos'
      },
      {
        id: 'ing-9',
        name: 'Aceite de Oliva Virgen Extra prensado en frío',
        quantity: 80,
        unit: 'ml',
        estimatedPrice: 2500,
        storeName: 'Coto Digital',
        storeLocation: 'Sucursal Abasto - Av. Corrientes 3247, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparación del Pesto al mortero o procesadora',
        description: 'Triturar el diente de ajo con una pizca de sal marina gruesa. Añadir los piñones tostados hasta formar una pasta. Incorporar las hojas de albahaca lavadas y bien secas, pulsando brevemente para evitar que se oxide por calor.',
        durationMinutes: 10,
        tip: 'Mantén el aceite frío en la nevera unos minutos para que el pesto conserve su verde vibrante.'
      },
      {
        stepNumber: 2,
        title: 'Cocción de la pasta Sin TACC',
        description: 'Hervir abundante agua con sal (1 litro de agua cada 100g de pasta). Cocinar la pasta sin TACC exactamente al dente según el paquete (generalmente 8-9 minutos).',
        durationMinutes: 10,
        tip: 'Guarda media taza del agua de cocción antes de colar; su almidón emulsionará el pesto.'
      },
      {
        stepNumber: 3,
        title: 'Emulsión y emplatado',
        description: 'Fuera del fuego, mezclar la pasta colada con el pesto y 2 cucharadas del agua de cocción tibia. Servir de inmediato con más Parmigiano rallado y hojas frescas.',
        durationMinutes: 5,
        tip: 'Nunca calientes el pesto directamente en la sartén, perdería su aroma fresco.'
      }
    ]
  },
  {
    id: 'rec-3',
    title: 'Bowl Arcoíris Vegano con Tofu Marinado y Aderezo Tahini',
    description: 'Equilibrado, rico en proteínas vegetales, fibra saciante y apto para diabéticos por su bajo índice glucémico y grasas saludables.',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    coAuthors: ['Mateo Rossi'],
    status: 'published',
    createdAt: '2026-10-01T15:20:00.000Z',
    updatedAt: '2026-10-01T15:20:00.000Z',
    prepTimeMin: 20,
    cookTimeMin: 15,
    servings: 2,
    difficulty: 'facil',
    category: 'ensaladas',
    tags: ['vegano', 'vegetariano', 'diabetico', 'sin_lactosa'],
    isFeaturedWeek: true,
    isFeaturedMonth: true,
    likesCount: 142,
    dislikesCount: 2,
    likedUserIds: ['user-lucia'],
    dislikedUserIds: [],
    commentsCount: 6,
    nutrition: {
      calories: 340,
      proteinG: 19,
      carbsG: 22,
      fatG: 16,
      fiberG: 8.5,
    },
    ingredients: [
      {
        id: 'ing-10',
        name: 'Tofu firme orgánico prensado',
        quantity: 250,
        unit: 'g',
        estimatedPrice: 3100,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        suggestedSubstitute: 'Tempeh orgánico o garbanzos asados',
        category: 'frescos'
      },
      {
        id: 'ing-11',
        name: 'Palta Hass en su punto',
        quantity: 1,
        unit: 'unidad',
        estimatedPrice: 1800,
        storeName: 'Supermercados Dia',
        storeLocation: 'Honduras 4100, CABA',
        inStock: true,
        stockLevel: 'medio',
        category: 'frescos'
      },
      {
        id: 'ing-12',
        name: 'Pasta de Sésamo (Tahini puro)',
        quantity: 35,
        unit: 'g',
        estimatedPrice: 2200,
        storeName: 'Jumbo a Casa',
        storeLocation: 'Av. Int. Bullrich 345, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-13',
        name: 'Espinacas baby y col lombarda rallada',
        quantity: 150,
        unit: 'g',
        estimatedPrice: 1600,
        storeName: 'Coto Digital',
        storeLocation: 'Sucursal Abasto - Av. Corrientes 3247, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Marinado y sellado del Tofu',
        description: 'Cortar el tofu en cubos de 2 cm. Marinar con 1 cucharada de salsa de soja baja en sodio y ajo en polvo. Dorar en sartén con gotas de aceite de sésamo hasta que esté crujiente por fuera.',
        durationMinutes: 15,
        tip: 'Secar muy bien el tofu con papel absorbente antes de cortar para lograr el máximo crujiente.'
      },
      {
        stepNumber: 2,
        title: 'Emulsión del aderezo cremoso',
        description: 'Batir el tahini con jugo de medio limón, un chorrito de agua tibia y una pizca de comino molido hasta obtener una crema sedosa.',
        durationMinutes: 5,
        tip: 'Al principio el tahini parece cuajar con el limón, sigue batiendo con agua tibia y se volverá suave.'
      },
      {
        stepNumber: 3,
        title: 'Montaje del bowl',
        description: 'Disponer una base de espinacas baby, col lombarda morada, palta en abanico y los cubos de tofu tibios. Bañar con el aderezo y semillas de sésamo tostadas.',
        durationMinutes: 5
      }
    ]
  },
  {
    id: 'rec-4',
    title: 'Cheesecake Keto de Frutos Rojos (Sin Azúcar / Low Carb)',
    description: 'Base de almendras tostadas con manteca de pastura y relleno cremoso endulzado con eritritol natural. Ideal para dieta cetogénica y diabéticos.',
    coverImage: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    coAuthors: [],
    status: 'published',
    createdAt: '2026-09-10T18:00:00.000Z',
    updatedAt: '2026-09-10T18:00:00.000Z',
    prepTimeMin: 25,
    cookTimeMin: 45,
    servings: 10,
    difficulty: 'media',
    category: 'postres',
    tags: ['keto', 'diabetico', 'celiaco', 'vegetariano'],
    isFeaturedMonth: true,
    likesCount: 312,
    dislikesCount: 5,
    likedUserIds: ['user-lucia', 'user-camila'],
    dislikedUserIds: [],
    commentsCount: 14,
    nutrition: {
      calories: 285,
      proteinG: 7.5,
      carbsG: 4.8,
      fatG: 26,
      fiberG: 2.1,
    },
    ingredients: [
      {
        id: 'ing-14',
        name: 'Harina de Almendras extra fina',
        quantity: 180,
        unit: 'g',
        estimatedPrice: 4200,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-15',
        name: 'Queso Crema entero estilo Casancrem / Finlandia',
        quantity: 450,
        unit: 'g',
        estimatedPrice: 3800,
        storeName: 'Coto Digital',
        storeLocation: 'Sucursal Abasto - Av. Corrientes 3247, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'lacteos'
      },
      {
        id: 'ing-16',
        name: 'Eritritol o Monkfruit en polvo',
        quantity: 90,
        unit: 'g',
        estimatedPrice: 3500,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: false,
        stockLevel: 'agotado',
        suggestedSubstitute: 'Stevia líquida pura concentrada o Xilitol',
        category: 'secos'
      },
      {
        id: 'ing-17',
        name: 'Mix de Frutos Rojos frescos de la Patagonia',
        quantity: 120,
        unit: 'g',
        estimatedPrice: 2900,
        storeName: 'Jumbo a Casa',
        storeLocation: 'Av. Int. Bullrich 345, CABA',
        inStock: true,
        stockLevel: 'medio',
        suggestedSubstitute: 'Frutillas frescas seleccionadas',
        category: 'frescos'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Base de almendras crocante',
        description: 'Mezclar la harina de almendras con 40g de manteca derretida y una pizca de sal. Presionar en el fondo de un molde desmontable de 20cm forrado con papel de hornear. Hornear 10 min a 170°C.',
        durationMinutes: 15,
        tip: 'Deja enfriar la base antes de volcar el relleno para que no se desarme.'
      },
      {
        stepNumber: 2,
        title: 'Batido delicado sin incorporar aire en exceso',
        description: 'Batir el queso crema a temperatura ambiente con el eritritol y esencia de vainilla. Incorporar 2 huevos de a uno a baja velocidad.',
        durationMinutes: 10,
        tip: 'No batas de más; demasiado aire provoca grietas al enfriar.'
      },
      {
        stepNumber: 3,
        title: 'Horneado suave y enfriado en etapas',
        description: 'Hornear a 150°C durante 40-45 minutos con una bandeja con agua abajo (baño maría pasivo). Apagar el horno y dejar entreabierto 1 hora.',
        durationMinutes: 60
      }
    ]
  },
  {
    id: 'rec-5',
    title: 'Curry Dorado de Garbanzos y Calabaza Asada',
    description: 'Guiso aromático con leche de coco, cúrcuma de Ceilán, jengibre fresco y espinacas tiernas. Reconfortante y libre de gluten y lácteos.',
    coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    coAuthors: [],
    status: 'published',
    createdAt: '2026-09-22T19:00:00.000Z',
    updatedAt: '2026-09-22T19:00:00.000Z',
    prepTimeMin: 15,
    cookTimeMin: 30,
    servings: 4,
    difficulty: 'facil',
    category: 'platos_fuertes',
    tags: ['vegano', 'vegetariano', 'celiaco', 'sin_lactosa'],
    isFeaturedDay: false,
    likesCount: 95,
    dislikesCount: 0,
    likedUserIds: [],
    dislikedUserIds: [],
    commentsCount: 4,
    nutrition: {
      calories: 320,
      proteinG: 10,
      carbsG: 38,
      fatG: 13,
      fiberG: 7.2,
    },
    ingredients: [
      {
        id: 'ing-18',
        name: 'Garbanzos cocidos seleccionados',
        quantity: 400,
        unit: 'g',
        estimatedPrice: 1800,
        storeName: 'Coto Digital',
        storeLocation: 'Sucursal Abasto - Av. Corrientes 3247, CABA',
        inStock: true,
        stockLevel: 'alto',
        suggestedSubstitute: 'Lentejas turcas o porotos negros',
        category: 'frescos'
      },
      {
        id: 'ing-19',
        name: 'Leche de Coco cremosa en lata',
        quantity: 400,
        unit: 'ml',
        estimatedPrice: 2600,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-20',
        name: 'Calabaza Kabocha o Anco en cubos',
        quantity: 300,
        unit: 'g',
        estimatedPrice: 1200,
        storeName: 'Supermercados Dia',
        storeLocation: 'Honduras 4100, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Sofrito especiado',
        description: 'Sofreír cebolla, ajo, jengibre y pasta de curry con una cucharada de aceite de coco hasta perfumar la cocina.',
        durationMinutes: 7
      },
      {
        stepNumber: 2,
        title: 'Cocción con leche de coco y calabaza',
        description: 'Añadir la calabaza en cubos, garbanzos y la leche de coco. Cocinar a fuego medio tapado durante 20 minutos hasta que la calabaza esté suave.',
        durationMinutes: 20
      }
    ]
  },
  {
    id: 'rec-6',
    title: 'Focaccia Alta con Romero Salvaje y Tomates Cherry Confitados',
    description: 'Receta especial programada para el fin de semana. Masa con 80% de hidratación y aceite de oliva virgen extra.',
    coverImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    coAuthors: ['Lucía Valenzuela'],
    status: 'scheduled',
    scheduledPublishDate: '2026-10-10T18:00:00.000Z',
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z',
    prepTimeMin: 30,
    cookTimeMin: 25,
    servings: 6,
    difficulty: 'media',
    category: 'panaderia',
    tags: ['vegano', 'vegetariano'],
    likesCount: 0,
    dislikesCount: 0,
    likedUserIds: [],
    dislikedUserIds: [],
    commentsCount: 0,
    nutrition: {
      calories: 250,
      proteinG: 6,
      carbsG: 39,
      fatG: 7.8,
      fiberG: 2.4,
    },
    ingredients: [
      {
        id: 'ing-21',
        name: 'Harina 000 para panadería',
        quantity: 400,
        unit: 'g',
        estimatedPrice: 1900,
        storeName: 'Dietética & Molino San Jorge',
        storeLocation: 'Av. Corrientes 1250, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-22',
        name: 'Tomates cherry perita maduros',
        quantity: 150,
        unit: 'g',
        estimatedPrice: 1500,
        storeName: 'Supermercados Dia',
        storeLocation: 'Honduras 4100, CABA',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Amasado y reposo en bandeja aceitada',
        description: 'Mezclar y hacer pliegues en fuente rectangular con abundante oliva. Dejar leudar hasta que forme burbujas gigantes.',
        durationMinutes: 180
      },
      {
        stepNumber: 2,
        title: 'Huella con los dedos y horneado',
        description: 'Hundir las yemas de los dedos, agregar romero fresco y hornear a 220°C hasta dorar.',
        durationMinutes: 25
      }
    ]
  },
  {
    id: 'rec-7',
    title: '[Borrador] Crema de Champiñones Portobello y Trufa Negra',
    description: 'Borrador en desarrollo de sopa invernal con hongos silvestres salteados y crema reducida.',
    coverImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    coAuthors: [],
    status: 'draft',
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z',
    prepTimeMin: 15,
    cookTimeMin: 20,
    servings: 3,
    difficulty: 'facil',
    category: 'sopas',
    tags: ['vegetariano', 'keto'],
    likesCount: 0,
    dislikesCount: 0,
    likedUserIds: [],
    dislikedUserIds: [],
    commentsCount: 0,
    nutrition: {
      calories: 190,
      proteinG: 4.5,
      carbsG: 6,
      fatG: 16,
      fiberG: 2,
    },
    ingredients: [
      {
        id: 'ing-23',
        name: 'Hongos Portobello frescos',
        quantity: 300,
        unit: 'g',
        estimatedPrice: 3400,
        storeName: 'Jumbo a Casa',
        storeLocation: 'Av. Int. Bullrich 345, CABA',
        inStock: true,
        stockLevel: 'medio',
        suggestedSubstitute: 'Champiñones París frescos',
        category: 'frescos'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Dorar hongos a fuego vivo',
        description: 'Saltear con manteca clarificada sin amontonar.',
        durationMinutes: 10
      }
    ]
  }
];

export const INITIAL_COMMENTS: RecipeComment[] = [
  {
    id: 'comm-1',
    recipeId: 'rec-1',
    authorId: 'user-lucia',
    authorName: 'Lucía Valenzuela',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    content: '¡Excelente técnica con la autólisis! Yo suelo reemplazar 50g con harina de centeno integral y el aroma que desprende es inigualable.',
    createdAt: '2026-09-16T14:20:00.000Z',
    likes: 12,
    likedUserIds: ['user-mateo', 'user-camila', 'user-ignacio'],
    dislikedUserIds: []
  },
  {
    id: 'comm-2',
    recipeId: 'rec-1',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    content: '¡Gran aporte Lucía! El centeno además le da un empuje enzimático fenomenal a la masa.',
    createdAt: '2026-09-16T15:10:00.000Z',
    likes: 8,
    likedUserIds: ['user-lucia'],
    dislikedUserIds: [],
    parentCommentId: 'comm-1'
  },
  {
    id: 'comm-3',
    recipeId: 'rec-2',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    content: 'Nunca me quedaba el pesto tan brillante. El truco de enfriar el aceite de oliva antes de emulsionar cambió todo.',
    createdAt: '2026-09-29T18:45:00.000Z',
    likes: 5,
    likedUserIds: ['user-mateo'],
    dislikedUserIds: []
  }
];

export const INITIAL_FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'top-1',
    category: 'panaderia',
    title: '¿Cómo mantener activa la masa madre si viajas por 2 semanas?',
    content: 'Hola comunidad! La próxima semana salgo de viaje 15 días y me preocupa que mi masa madre de 3 años pierda fuerza. ¿Recomiendan deshidratarla, congelarla o simplemente un refresco espeso en frío a 3°C?',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    authorRole: 'usuario',
    createdAt: '2026-10-02T14:15:00.000Z',
    repliesCount: 4,
    viewsCount: 310,
    tags: ['Masa Madre', 'Conservación', 'Pan Casero'],
    isPinned: true
  },
  {
    id: 'top-2',
    category: 'dietas',
    title: 'Guía de sustitución de gomas (xántica vs guar) en repostería Sin TACC',
    content: 'Comparto mi experiencia clínica con pacientes celíacos. La goma xántica aporta más elasticidad para masas que requieren estirado (pastas, panes), mientras que la goma guar funciona mejor en preparaciones frías o aireadas como bizcochuelos.',
    authorId: 'user-lucia',
    authorName: 'Lucía Valenzuela',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    authorRole: 'editor',
    createdAt: '2026-09-25T11:00:00.000Z',
    repliesCount: 8,
    viewsCount: 680,
    tags: ['Sin TACC', 'Celíacos', 'Técnicas Harinas'],
    isPinned: true
  },
  {
    id: 'top-3',
    category: 'tecnicas',
    title: 'Marmitas de hierro fundido esmaltado vs acero al carbono: ¿Cuál prefieren para hornear pan?',
    content: 'Tengo una Le Creuset redonda pero estoy evaluando un horno campana (Challenger bread pan). ¿Alguien hizo pruebas comparativas de expansión de greña en ambas?',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    authorRole: 'premium',
    createdAt: '2026-09-30T17:40:00.000Z',
    repliesCount: 5,
    viewsCount: 420,
    tags: ['Dutch Oven', 'Equipamiento', 'Greñado']
  }
];

export const INITIAL_FORUM_REPLIES: ForumReply[] = [
  {
    id: 'rep-1',
    topicId: 'top-1',
    authorId: 'user-mateo',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    content: '¡Para 15 días lo más seguro es hacer un refresco rígido (50% de hidratación en vez de 100%), meterlo bien al fondo de la nevera donde la temperatura es constante a 3-4°C. Al volver, con dos refrescos seguidos vuelve a duplicar en 4 horas!',
    createdAt: '2026-10-02T16:20:00.000Z',
    likesCount: 15,
    isBestAnswer: true
  },
  {
    id: 'rep-2',
    topicId: 'top-2',
    authorId: 'user-camila',
    authorName: 'Camila Ríos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    content: '¡Maravillosa explicación Lucía! Siempre tenía dudas de las proporciones exactas. ¿Cuánto porcentaje recomendás por kilo de mezcla de harinas sin gluten?',
    createdAt: '2026-09-25T14:30:00.000Z',
    likesCount: 6
  }
];

export const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: 'rep-mod-1',
    targetType: 'recipe',
    targetId: 'rec-spam-example',
    targetTitleOrName: 'Receta Mágica Quemagrasas en 24 Horas sin Esfuerzo',
    targetAuthorOrOwner: 'bot_suplementos99',
    reporterId: 'user-lucia',
    reporterName: 'Lucía Valenzuela',
    reason: 'spam',
    details: 'Contiene enlaces a sitios externos de suplementos dudosos y desinformación sobre salud metabólica.',
    status: 'pending',
    createdAt: '2026-10-03T18:10:00.000Z'
  },
  {
    id: 'rep-mod-2',
    targetType: 'profile',
    targetId: 'user-fake-chef',
    targetTitleOrName: 'ChefGordonFake',
    targetAuthorOrOwner: 'ChefGordonFake',
    reporterId: 'user-mateo',
    reporterName: 'Mateo Rossi',
    reason: 'inapropiado',
    details: 'Suplantación de identidad de cocinero profesional publicando contenido obsceno en comentarios.',
    status: 'pending',
    createdAt: '2026-10-04T09:40:00.000Z'
  }
];

export const INITIAL_COLLECTIONS: RecipeCollection[] = [
  {
    id: 'col-1',
    name: 'Desayunos y Panificados del Domingo',
    description: 'Nuestras mejores recetas para preparar el fin de semana con tiempo y calma.',
    userId: 'user-mateo',
    recipeIds: ['rec-1', 'rec-6'],
    isPrivate: false,
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'col-2',
    name: 'Cenas Saludables y Sin TACC',
    description: 'Platos ligeros, nutritivos y 100% seguros libres de gluten para toda la familia.',
    userId: 'user-lucia',
    recipeIds: ['rec-2', 'rec-3'],
    isPrivate: false,
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-mateo',
    title: '¡Nueva interacción en tu receta!',
    message: 'A Lucía Valenzuela le gustó tu "Hogaza Rústica de Masa Madre".',
    createdAt: '2026-10-04T12:00:00.000Z',
    read: false,
    type: 'like',
    linkTarget: 'rec-1'
  },
  {
    id: 'notif-2',
    userId: 'user-mateo',
    title: 'Nuevo comentario en el foro',
    message: 'Camila Ríos agradeció tu respuesta sobre conservación de masa madre.',
    createdAt: '2026-10-04T08:30:00.000Z',
    read: false,
    type: 'comment',
    linkTarget: 'top-1'
  },
  {
    id: 'notif-3',
    userId: 'user-lucia',
    title: 'Reporte enviado a moderación',
    message: 'El equipo de seguridad ha recibido tu reporte de receta sospechosa.',
    createdAt: '2026-10-03T18:12:00.000Z',
    read: true,
    type: 'moderation'
  }
];

export const INITIAL_ORDERS: PurchaseOrder[] = [
  {
    id: 'ord-101',
    userId: 'user-mateo',
    orderNumber: '#GST-94821',
    storeId: 'coto',
    storeName: 'Coto Digital',
    status: 'en_camino',
    createdAt: '2026-10-04T11:20:00.000Z',
    estimatedDeliveryTime: 'Hoy, entre 16:30 y 17:30 hs (A tiempo)',
    deliveryAddress: {
      id: 'addr-mateo-1',
      alias: 'Casa Principal',
      street: 'Av. Santa Fe',
      number: '3420',
      apartment: '4B',
      city: 'Palermo, CABA',
      province: 'Ciudad Autónoma de Buenos Aires',
      postalCode: '1414',
      isDefault: true,
      notes: 'Timbre 4B. Tocar timbre y dejar en recepción si no atiendo.',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    items: [
      {
        id: 'ord-item-1',
        name: 'Harina de Fuerza Orgánica 000',
        quantity: 500,
        unit: 'g',
        priceARS: 2450,
        recipeTitle: 'Hogaza Rústica de Masa Madre',
        storeName: 'Coto Digital'
      },
      {
        id: 'ord-item-2',
        name: 'Masa Madre activa al 100% de hidratación',
        quantity: 100,
        unit: 'g',
        priceARS: 1950,
        recipeTitle: 'Hogaza Rústica de Masa Madre',
        storeName: 'Coto Digital'
      },
      {
        id: 'ord-item-3',
        name: 'Sal marina fina sin aditivos',
        quantity: 10,
        unit: 'g',
        priceARS: 650,
        recipeTitle: 'Hogaza Rústica de Masa Madre',
        storeName: 'Coto Digital'
      }
    ],
    subtotalARS: 5050,
    deliveryFeeARS: 2850,
    pantrySavingsARS: 450,
    totalARS: 7900,
    statusHistory: [
      {
        status: 'pendiente_pago',
        timestamp: '2026-10-04T11:20:00.000Z',
        note: 'Pago verificado con tarjeta de débito bancaria.'
      },
      {
        status: 'en_preparacion',
        timestamp: '2026-10-04T11:45:00.000Z',
        note: 'Sucursal Coto Abasto comenzó el armado de la canasta de frescos y secos.'
      },
      {
        status: 'despachado',
        timestamp: '2026-10-04T14:10:00.000Z',
        note: 'Pedido empaquetado y transferido al transportista de reparto.'
      },
      {
        status: 'en_camino',
        timestamp: '2026-10-04T15:00:00.000Z',
        note: 'El repartidor está en ruta hacia Palermo (Av. Santa Fe 3420 4B).'
      }
    ]
  },
  {
    id: 'ord-102',
    userId: 'user-mateo',
    orderNumber: '#GST-81204',
    storeId: 'jumbo',
    storeName: 'Jumbo a Casa',
    status: 'entregado',
    createdAt: '2026-09-28T09:15:00.000Z',
    estimatedDeliveryTime: 'Entregado con éxito el 28 de Septiembre',
    deliveryAddress: {
      id: 'addr-mateo-1',
      alias: 'Casa Principal',
      street: 'Av. Santa Fe',
      number: '3420',
      apartment: '4B',
      city: 'Palermo, CABA',
      province: 'Ciudad Autónoma de Buenos Aires',
      postalCode: '1414',
      isDefault: true,
      notes: 'Timbre 4B. Tocar timbre y dejar en recepción si no atiendo.',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    items: [
      {
        id: 'ord-item-4',
        name: 'Queso Parmigiano Reggiano rallado fino (sin gluten)',
        quantity: 70,
        unit: 'g',
        priceARS: 3900,
        recipeTitle: 'Pasta al Pesto Genovés Sin TACC',
        storeName: 'Jumbo a Casa'
      },
      {
        id: 'ord-item-5',
        name: 'Mix de Frutos Rojos frescos de la Patagonia',
        quantity: 120,
        unit: 'g',
        priceARS: 2900,
        recipeTitle: 'Cheesecake Keto de Frutos Rojos',
        storeName: 'Jumbo a Casa'
      }
    ],
    subtotalARS: 6800,
    deliveryFeeARS: 0,
    pantrySavingsARS: 1200,
    totalARS: 6800,
    statusHistory: [
      {
        status: 'pendiente_pago',
        timestamp: '2026-09-28T09:15:00.000Z',
        note: 'Orden recibida y procesada.'
      },
      {
        status: 'en_preparacion',
        timestamp: '2026-09-28T09:40:00.000Z',
        note: 'Selección de productos en cámara fría.'
      },
      {
        status: 'despachado',
        timestamp: '2026-09-28T11:10:00.000Z',
        note: 'Despachado en camioneta refrigerada.'
      },
      {
        status: 'en_camino',
        timestamp: '2026-09-28T12:00:00.000Z',
        note: 'Próxima parada: Palermo.'
      },
      {
        status: 'entregado',
        timestamp: '2026-09-28T12:45:00.000Z',
        note: 'Entregado en mano en domicilio. Recepción firmada.'
      }
    ]
  }
];

