import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";

export const revalidate = 0;

export default async function VideosPage() {
  const query = `*[_type == "featuredVideo"] | order(order asc, _createdAt asc) {
    _id,
    title,
    videoType,
    "videoFileUrl": videoFile.asset->url,
    youtubeUrl,
    "coverImage": coverImage,
    format
  }`;
  
  const videos = await client.fetch(query);

  return (
    <div className="w-full space-y-20 pb-20">
      <div className="pt-8 space-y-4 text-center">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
          &larr; Voltar
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">Vídeos</h1>
      </div>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400 py-20 border border-dashed border-gray-200">
          Nenhum vídeo encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => {
            const isLandscape = video.format === 'Horizontal (ex: YouTube/Cinema)';
            const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
            
            return (
              <div className="w-full" key={video._id}>
                <VideoCard 
                  video={{
                    ...video,
                    coverImage: video.coverImage ? urlForImage(video.coverImage).url() : ''
                  }} 
                  aspectClass={aspectClass}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
