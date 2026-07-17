import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { getJournalById } from "@/actions/journalActions";
import { Calendar, Clock, User, Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getJournalById(id);

  if (!post) {
    notFound();
  }

  // Format the date to look nice (e.g., May 17, 2026)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(post.createdAt);

  return (
    <main className="min-h-screen bg-[#040C08] text-white selection:bg-gold pb-24">
      <div className="pt-40 max-w-4xl mx-auto px-6 mb-16 text-center">
        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">
          {post.category}
        </span>
        <h1 className="text-4xl md:text-6xl font-serif leading-tight mb-8">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center text-white/50 text-xs tracking-widest uppercase gap-6 md:gap-10">
          <div className="flex items-center">
            <User size={14} className="mr-2 text-gold" /> {post.author}
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-gold" /> {formattedDate}
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-2 text-gold" /> {post.readTime}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mb-20">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-[50vh] md:h-[70vh] object-cover rounded-3xl border border-white/10"
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 mb-16">
        {post.content ? (
          <div
            className="prose prose-invert prose-lg max-w-none text-white/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-white/80 text-xl font-light leading-loose whitespace-pre-wrap">
            {post.excerpt}
          </p>
        )}
      </div>

      {post.gallery && post.gallery.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mb-20">
          <div className="flex items-center gap-3 mb-8">
            <ImageIcon className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-serif text-white">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {post.gallery.map((imageUrl: string, index: number) => (
              <div
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group"
              >
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
