import { CoverArt } from "@/components/CoverArt";
import { MeetSections } from "@/components/MeetSection";
import { SplitReveal } from "@/components/SplitReveal";
import { getCategories, getSite } from "@/lib/content";
import { getPhotos } from "@/lib/photos";

export default function HomePage() {
  const site = getSite();
  const rawCategories = getCategories();

  // На первую страницу попадают только разделы, в которых уже лежат
  // настоящие фотографии. Пустой раздел (сейчас — «ИИ-проекты») остаётся в
  // меню и в портфолио, но серую заглушку на главной не показывает.
  const categories = rawCategories
    .map((cat) => ({
      ...cat,
      cover: cat.cover || getPhotos(cat.slug).find((photo) => Boolean(photo.src))?.src,
    }))
    .filter((cat) => Boolean(cat.cover));

  return (
    <>
      <SplitReveal wordLeft="АННА" wordRight="МАНАСАРЯН">
        <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-paper px-4 py-16 sm:px-6 md:px-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative aspect-[928/1216] h-[52svh] max-h-[540px] w-auto overflow-hidden rounded-xs shadow-md shadow-ink/10 ring-1 ring-ink/10 transition-transform duration-700 hover:scale-[1.01] sm:h-[56svh] md:h-[60svh]">
              <CoverArt
                slug="home-hero"
                title={site.owner}
                src={site.portrait || "/Anna_Hero.jpeg"}
              />
            </div>
            <h1 className="mt-5 font-display text-2xl tracking-tight text-ink sm:mt-6 sm:text-3xl md:text-4xl lg:text-5xl">
              Мои фотографии
            </h1>
          </div>
        </div>
      </SplitReveal>

      <MeetSections categories={categories} />
    </>
  );
}

