import GroupedCategoryNav from '@/components/public/GroupedCategoryNav';
import MenuItemCard from '@/components/public/MenuItemCard';
import { supabase } from '@/lib/supabase';
import { Category, MenuItem } from '@/lib/types';
import { Clock, MapPin, Wifi, Sparkles } from 'lucide-react';

// Forzar que la página no use caché y siempre traiga datos frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Inline social icons
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill="currentColor">
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.495-1.318.114-.244.114-.515.114-.773 0-.4-.4-.55-.7-.7-.5-.244-1-.515-1.5-.745v.025zM16.515 30.5c-2.92 0-5.71-.83-8.07-2.4l-5.62 1.79 1.83-5.45A14.45 14.45 0 0 1 2.07 16.06C2.07 8.05 8.55 1.57 16.56 1.57c3.88 0 7.52 1.51 10.26 4.25 2.74 2.74 4.25 6.38 4.25 10.26 0 8.01-6.55 14.5-14.55 14.5zm-.04-26.43c-6.61 0-12 5.39-12 12 0 2.27.64 4.48 1.85 6.39l-1.06 3.18 3.29-1.05c1.85 1.21 4 1.85 6.21 1.85 6.61 0 12-5.39 12-12 0-3.21-1.25-6.22-3.52-8.49-2.27-2.27-5.28-3.52-8.49-3.52v-.36z"></path>
  </svg>
);

async function getMenuData() {
  const [
    { data: categories, error: catError },
    { data: restaurantInfo },
    { data: groupsData },
    { data: items },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('restaurant_info').select('*').single(),
    supabase.from('groups').select('*').order('sort_order', { ascending: true }),
    supabase.from('menu_items').select('*, prices (*)'),
  ]);

  if (catError || !categories) {
    return { categories: [], itemsByCategory: {}, restaurantInfo: null, groupedCategories: {}, orderedGroups: [] };
  }

  const itemsByCategory: Record<string, MenuItem[]> = {};
  items?.forEach((item: any) => {
    if (!itemsByCategory[item.category_id]) itemsByCategory[item.category_id] = [];
    itemsByCategory[item.category_id].push({
      ...item,
      prices: item.prices.map((p: any) => ({ id: p.id, label: p.label, price: p.price }))
    });
  });

  const visibleCategories = categories.filter(c => c.is_visible !== false);
  const formattedCategories: Category[] = visibleCategories.map(c => ({
    id: c.id, slug: c.slug, name: c.name,
    group: c.group || "General", sort_order: c.sort_order
  }));

  const itemsBySlug: Record<string, MenuItem[]> = {};
  formattedCategories.forEach(cat => {
    itemsBySlug[cat.slug] = itemsByCategory[cat.id] || [];
  });

  // Agrupar respetando el orden de la tabla groups
  const orderedGroupNames: string[] = groupsData?.map(g => g.name) ?? [];
  // Añadir grupos que existan en categorías pero no estén en la tabla groups
  formattedCategories.forEach(c => {
    if (c.group && !orderedGroupNames.includes(c.group)) orderedGroupNames.push(c.group);
  });

  const groupedCategories: Record<string, Category[]> = {};
  orderedGroupNames.forEach(g => { groupedCategories[g] = []; });
  formattedCategories.forEach(cat => {
    const g = cat.group || "General";
    if (!groupedCategories[g]) groupedCategories[g] = [];
    groupedCategories[g].push(cat);
  });
  // Eliminar grupos vacíos
  Object.keys(groupedCategories).forEach(k => {
    if (groupedCategories[k].length === 0) delete groupedCategories[k];
  });

  return {
    categories: formattedCategories,
    itemsByCategory: itemsBySlug,
    groupedCategories,
    orderedGroups: orderedGroupNames,
    restaurantInfo: restaurantInfo || {
      name: "Café Canella",
      tagline: "Cafetería, brunch y picadas para mañanas sin afán.",
      schedule: "Todos los días · 15:30 — 23:00",
      address: "Cra. 18 #13-58, Aguazul, Casanare",
      wifi_name: "Café Canella",
      wifi_password: "2GNGP4gk",
      whatsapp_number: "573000000000",
      instagram_url: "#",
      facebook_url: "#",
      footer_text: "Precios en pesos colombianos · COP",
      quote_text: '"El café es el lenguaje silencioso de un buen encuentro."',
      hero_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop'
    }
  };
}

export async function generateMetadata() {
  const { restaurantInfo } = await getMenuData();
  return {
    title: `Menú - ${restaurantInfo.name}`,
    description: restaurantInfo.tagline,
    openGraph: {
      images: [restaurantInfo.hero_image_url],
    },
  };
}

export default async function PublicMenuPage() {
  const { categories, itemsByCategory, groupedCategories, restaurantInfo } = await getMenuData();

  if (restaurantInfo.is_closed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-parchment bg-[var(--line-pattern)] bg-fixed">
        <div className="menu-card p-10 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-roast"></div>
          <div className="w-16 h-16 mx-auto mb-6 bg-cream border border-latte rounded-full flex items-center justify-center text-roast shadow-warm">
            <span className="font-serif text-3xl">☕</span>
          </div>
          <h2 className="text-3xl font-serif mb-4 text-espresso tracking-tight">{restaurantInfo.name}</h2>
          <div className="ornament mb-4"><span className="text-latte text-sm">✦</span></div>
          <p className="text-espresso/80 italic font-serif text-lg leading-relaxed">
            Estamos cerrados por el momento o realizando tareas de mantenimiento.
          </p>
          <p className="text-muted-foreground font-sans text-xs mt-6 tracking-wide uppercase">
            Vuelve pronto
          </p>
        </div>
      </main>
    );
  }

  if (categories.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-parchment bg-[var(--line-pattern)] bg-fixed">
        <div className="menu-card p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-serif mb-4 text-espresso">Menú no disponible</h2>
          <p className="text-muted-foreground italic font-serif">Estamos actualizando nuestra carta. Vuelve pronto.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header / Hero */}
      <header className="relative">
        <div className="relative h-[28vh] min-h-[220px] max-h-[320px] w-full overflow-hidden">
          <img 
            src={restaurantInfo.hero_image_url} 
            alt="Interior de Café Canella" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-espresso/55 to-espresso/85"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
            <p className="label-stamp text-latte/90 text-[0.65rem] sm:text-xs">Establecido en el aroma del café</p>
            <h1 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {restaurantInfo.name.split(' ')[0]} <span className="italic font-normal">{restaurantInfo.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="ornament my-3 sm:my-4 w-full max-w-xs sm:max-w-md">
              <span className="text-latte text-base font-serif">❦</span>
            </div>
            <p className="max-w-md mx-auto font-serif italic text-cream/90 text-sm sm:text-base px-2">
              {restaurantInfo.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2.5 sm:gap-3">
              <a href={restaurantInfo.instagram_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-full border border-cream/40 text-cream hover:bg-cream hover:text-espresso transition-colors">
                <InstagramIcon />
              </a>
              <a href={restaurantInfo.facebook_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-full border border-cream/40 text-cream hover:bg-cream hover:text-espresso transition-colors">
                <FacebookIcon />
              </a>
              <a href={`https://wa.me/${restaurantInfo.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-full border border-cream/40 text-cream hover:bg-cream hover:text-espresso transition-colors">
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-cream border-y border-latte">
          <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-5 sm:gap-10 w-fit sm:w-full">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 grid place-items-center rounded-full bg-parchment text-roast border border-latte shrink-0">
                <Clock size={16} />
              </div>
              <div className="text-left">
                <div className="label-stamp text-roast text-[0.62rem]">Horarios</div>
                <div className="text-espresso font-serif text-sm">{restaurantInfo.schedule}</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-latte/50" />
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 grid place-items-center rounded-full bg-parchment text-roast border border-latte shrink-0">
                <MapPin size={16} />
              </div>
              <div className="text-left">
                <div className="label-stamp text-roast text-[0.62rem]">Dirección</div>
                <div className="text-espresso font-serif text-sm">{restaurantInfo.address}</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-latte/50" />
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 grid place-items-center rounded-full bg-parchment text-roast border border-latte shrink-0">
                <Wifi size={16} />
              </div>
              <div className="text-left">
                <div className="label-stamp text-roast text-[0.62rem]">Wifi</div>
                <div className="text-espresso font-mono tracking-wider text-sm">{restaurantInfo.wifi_password}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="max-w-4xl mx-auto px-6 mt-8">
          <div className="menu-card p-5 sm:p-7 text-center">
            <div className="flex items-center justify-center gap-2 text-roast">
              <Sparkles size={14} />
              <span className="label-stamp text-[0.65rem] sm:text-xs">Recomendación del día</span>
              <Sparkles size={14} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {(restaurantInfo.recommendations ?? "Ice Latte, Limonada de Lychee, Granizado Mango")
                .split(",")
                .map((r: string) => r.trim())
                .filter(Boolean)
                .map((rec: string, idx: number, arr: string[]) => (
                  <span key={idx} className="flex items-center gap-x-5">
                    <span className="font-serif text-lg sm:text-xl text-espresso italic">{rec}</span>
                    {idx < arr.length - 1 && <span className="text-latte hidden sm:inline">✦</span>}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-30 mt-12 bg-parchment/85 backdrop-blur-md border-y border-latte/70">
        <GroupedCategoryNav groupedCategories={groupedCategories} />
      </nav>

      {/* Menu Sections grouped by Group Name */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-20">
        {Object.entries(groupedCategories).map(([groupName, cats]) => (
          <div key={groupName} className="space-y-8">
            {/* Separador de grupo — estilo Recomendación del Día */}
            <div className="menu-card p-6 sm:p-8 text-center">
              <div className="flex items-center justify-center gap-3 text-latte">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-latte to-transparent max-w-24" />
                <span className="label-stamp text-roast text-[0.65rem] sm:text-xs tracking-[0.25em]">{groupName}</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-latte to-transparent max-w-24" />
              </div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso italic tracking-tight">
                {groupName}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              {cats.map((cat) => (
                <section
                  key={cat.id}
                  id={`sec-${cat.slug}`}
                  className="menu-card p-5 sm:p-7 md:p-9 scroll-mt-24"
                >
                  <div className="text-center mb-4 sm:mb-5">
                    <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-espresso">
                      {cat.name}
                    </h3>
                    <div className="ornament mt-3">
                      <span className="text-roast text-sm">✦</span>
                    </div>
                  </div>

                  <ul>
                    {itemsByCategory[cat.slug]?.map((item) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        showImage={restaurantInfo.show_item_images !== false} 
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ))}

        <div className="ornament my-12">
          <span className="text-lg font-serif">❧</span>
        </div>

        <footer className="text-center pb-8 space-y-4">
          <p className="label-stamp text-roast">{restaurantInfo.footer_text}</p>
          <p className="mt-3 font-serif italic text-muted-foreground">
            {restaurantInfo.quote_text}
          </p>
          <p className="mt-6 font-serif text-espresso font-semibold">— {restaurantInfo.name} —</p>
          <div className="pt-8">
            <p className="text-[0.65rem] sm:text-xs font-sans text-muted-foreground opacity-60">
              Powered by <span className="font-semibold tracking-wide">Codify</span>
            </p>
          </div>
        </footer>
      </main>

      <a 
        href={`https://wa.me/${restaurantInfo.whatsapp_number}${restaurantInfo.whatsapp_message ? `?text=${encodeURIComponent(restaurantInfo.whatsapp_message)}` : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white hover:scale-105 transition-transform shadow-lg"
      >
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
