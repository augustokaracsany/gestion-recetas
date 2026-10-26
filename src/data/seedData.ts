import { UserProfile, Recipe, RecipeComment, ForumTopic, ForumReply, ModerationReport, AppNotification, RecipeCollection } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-mateo',
    name: 'Mateo Rossi',
    username: 'mateochef',
    email: 'mateo.rossi@gusto.app',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    role: 'premium',
    bio: 'Chef pastelero y entusiasta de la masa madre rústica. Compartiendo recetas caseras con rigor profesional.',
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
  },
  {
    id: 'user-lucia',
    name: 'Lucía Valenzuela',
    username: 'lucianutri',
    email: 'lucia.valenzuela@gusto.app',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    role: 'editor',
    bio: 'Nutricionista clínica y editora gastronómica. Enfocada en recetas para celíacos, diabéticos y cocina basada en plantas.',
    specialties: ['Cocina Sin TACC', 'Nutrición Metabólica', 'Baking Vegano'],
    dietaryPreferences: ['celiaco', 'vegano'],
    subprofiles: [
      {
        id: 'sub-lucia-papa',
        name: 'Abuelo Roberto',
        relation: 'Padre',
        avatarColor: 'bg-sky-500',
        dietaryRestrictions: ['diabetico', 'bajo_sodio']
      }
    ],
    followersCount: 3890,
    followingUserIds: ['user-mateo'],
    pinnedRecipeId: 'rec-2',
    wishlistRecipeIds: ['rec-1', 'rec-3'],
  },
  {
    id: 'user-camila',
    name: 'Camila Ríos',
    username: 'camicocina',
    email: 'camila.rios@gusto.app',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    role: 'usuario',
    bio: 'Aficionada a la cocina rápida de entresemana. Amante de los bowls coloridos y postres sencillos sin horno.',
    specialties: ['Meal Prep', 'Cenas Rápidas', 'Smoothie Bowls'],
    dietaryPreferences: ['vegetariano'],
    subprofiles: [],
    followersCount: 420,
    followingUserIds: ['user-mateo', 'user-lucia'],
    pinnedRecipeId: undefined,
    wishlistRecipeIds: ['rec-3'],
  },
  {
    id: 'user-ignacio',
    name: 'Ignacio Gómez (Admin)',
    username: 'ignacioadmin',
    email: 'admin@gusto.app',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    role: 'admin',
    bio: 'Administrador de plataforma y moderador de comunidad en Gusto.',
    specialties: ['Gestión de Calidad', 'Seguridad Alimentaria'],
    dietaryPreferences: [],
    subprofiles: [],
    followersCount: 95,
    followingUserIds: [],
    wishlistRecipeIds: [],
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
        estimatedPrice: 2.10,
        storeName: 'Molino & Cereal San Jorge',
        storeLocation: 'Av. Corrientes 1250',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-2',
        name: 'Masa Madre activa al 100% de hidratación',
        quantity: 100,
        unit: 'g',
        estimatedPrice: 1.50,
        storeName: 'Panadería Artesanal El Trigal',
        storeLocation: 'Calle Palma 432',
        inStock: true,
        stockLevel: 'medio',
        category: 'frescos'
      },
      {
        id: 'ing-3',
        name: 'Agua filtrada a temperatura ambiente',
        quantity: 350,
        unit: 'ml',
        estimatedPrice: 0.10,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-4',
        name: 'Sal marina fina sin aditivos',
        quantity: 10,
        unit: 'g',
        estimatedPrice: 0.80,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
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
        estimatedPrice: 3.20,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-6',
        name: 'Albahaca fresca de hojas anchas',
        quantity: 60,
        unit: 'g',
        estimatedPrice: 1.40,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
        inStock: true,
        stockLevel: 'medio',
        category: 'frescos'
      },
      {
        id: 'ing-7',
        name: 'Piñones o nueces tostadas',
        quantity: 40,
        unit: 'g',
        estimatedPrice: 2.80,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: true,
        stockLevel: 'bajo',
        suggestedSubstitute: 'Nueces de Castilla o almendras peladas',
        category: 'secos'
      },
      {
        id: 'ing-8',
        name: 'Queso Parmigiano Reggiano rallado fino (sin gluten)',
        quantity: 70,
        unit: 'g',
        estimatedPrice: 3.90,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'lacteos'
      },
      {
        id: 'ing-9',
        name: 'Aceite de Oliva Virgen Extra prensado en frío',
        quantity: 80,
        unit: 'ml',
        estimatedPrice: 2.50,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
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
        estimatedPrice: 3.10,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      },
      {
        id: 'ing-11',
        name: 'Aguacate Hass en su punto',
        quantity: 1,
        unit: 'unidad',
        estimatedPrice: 1.80,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
        inStock: true,
        stockLevel: 'medio',
        category: 'frescos'
      },
      {
        id: 'ing-12',
        name: 'Pasta de Sésamo (Tahini puro)',
        quantity: 35,
        unit: 'g',
        estimatedPrice: 2.20,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-13',
        name: 'Espinacas baby y col lombarda rallada',
        quantity: 150,
        unit: 'g',
        estimatedPrice: 1.60,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
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
        description: 'Disponer una base de espinacas baby, col lombarda morada, aguacate en abanico y los cubos de tofu tibios. Bañar con el aderezo y semillas de sésamo tostadas.',
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
        estimatedPrice: 4.20,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-15',
        name: 'Queso Crema entero estilo Philadelphia',
        quantity: 450,
        unit: 'g',
        estimatedPrice: 3.80,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'lacteos'
      },
      {
        id: 'ing-16',
        name: 'Eritritol o Monkfruit en polvo',
        quantity: 90,
        unit: 'g',
        estimatedPrice: 3.50,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: false,
        stockLevel: 'agotado',
        suggestedSubstitute: 'Stevia líquida pura concentrada o Xilitol',
        category: 'secos'
      },
      {
        id: 'ing-17',
        name: 'Mix de Frutos Rojos silvestres frescos',
        quantity: 120,
        unit: 'g',
        estimatedPrice: 2.90,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
        inStock: true,
        stockLevel: 'medio',
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
        name: 'Garbanzos cocidos orgánicos',
        quantity: 400,
        unit: 'g',
        estimatedPrice: 1.80,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      },
      {
        id: 'ing-19',
        name: 'Leche de Coco cremosa en lata',
        quantity: 400,
        unit: 'ml',
        estimatedPrice: 2.60,
        storeName: 'Dietética El Trébol Verde',
        storeLocation: 'Calle Mayor 98',
        inStock: true,
        stockLevel: 'alto',
        category: 'otros'
      },
      {
        id: 'ing-20',
        name: 'Calabaza Kabocha o Anco en cubos',
        quantity: 300,
        unit: 'g',
        estimatedPrice: 1.20,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
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
        estimatedPrice: 1.90,
        storeName: 'Molino & Cereal San Jorge',
        storeLocation: 'Av. Corrientes 1250',
        inStock: true,
        stockLevel: 'alto',
        category: 'secos'
      },
      {
        id: 'ing-22',
        name: 'Tomates cherry perita maduros',
        quantity: 150,
        unit: 'g',
        estimatedPrice: 1.50,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
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
        estimatedPrice: 3.40,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
        inStock: true,
        stockLevel: 'medio',
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
    likes: 12
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
    likes: 5
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
