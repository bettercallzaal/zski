"use client";

import { useState, useEffect, useRef } from "react";

interface SkiPost {
  id: string;
  image: string;
  location: string;
  caption: string;
  author: string;
  timestamp: number;
  likes: number;
  liked: boolean;
}

const SAMPLE_POSTS: SkiPost[] = [
  {
    id: "s1",
    image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
    location: "Whistler Blackcomb, BC",
    caption: "Fresh powder day! Waist deep and still coming down",
    author: "PowderHound",
    timestamp: Date.now() - 3600000,
    likes: 24,
    liked: false,
  },
  {
    id: "s2",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&q=80",
    location: "Chamonix, France",
    caption: "Bluebird day in the Alps. Can't beat these views",
    author: "AlpineRider",
    timestamp: Date.now() - 7200000,
    likes: 42,
    liked: false,
  },
  {
    id: "s3",
    image: "https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&q=80",
    location: "Park City, Utah",
    caption: "Sunset runs hit different",
    author: "SkiBum99",
    timestamp: Date.now() - 14400000,
    likes: 18,
    liked: false,
  },
];

function Snow() {
  const [flakes, setFlakes] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    const f = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 0.5 + Math.random() * 1,
    }));
    setFlakes(f);
  }, []);

  return (
    <>
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            fontSize: `${f.size}rem`,
          }}
        >
          *
        </div>
      ))}
    </>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const [posts, setPosts] = useState<SkiPost[]>(SAMPLE_POSTS);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [author, setAuthor] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("zski-posts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SkiPost[];
        setPosts([...parsed, ...SAMPLE_POSTS]);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const saveUserPosts = (allPosts: SkiPost[]) => {
    const userPosts = allPosts.filter((p) => !p.id.startsWith("s"));
    localStorage.setItem("zski-posts", JSON.stringify(userPosts));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!preview || !location) return;
    const newPost: SkiPost = {
      id: crypto.randomUUID(),
      image: preview,
      location,
      caption,
      author: author || "Anonymous Skier",
      timestamp: Date.now(),
      likes: 0,
      liked: false,
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    saveUserPosts(updated);
    setShowUpload(false);
    setPreview(null);
    setLocation("");
    setCaption("");
    setAuthor("");
  };

  const toggleLike = (id: string) => {
    const updated = posts.map((p) =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    );
    setPosts(updated);
    saveUserPosts(updated);
  };

  return (
    <div className="min-h-screen relative">
      <Snow />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b1120]/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⛷️</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              ZSki
            </h1>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            {showUpload ? "Cancel" : "+ Share Photo"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        {/* Upload Form */}
        {showUpload && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Share your ski moment</h2>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400/50 transition-colors mb-4"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
              ) : (
                <div className="text-white/50">
                  <span className="text-4xl block mb-2">📸</span>
                  <p>Tap to add your ski photo</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
              />
              <input
                type="text"
                placeholder="Location (e.g. Aspen, Colorado) *"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
              />
              <textarea
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 resize-none"
              />
              <button
                onClick={handlePost}
                disabled={!preview || !location}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all cursor-pointer"
              >
                Post to ZSki
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold">
                  {post.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{post.author}</p>
                  <p className="text-xs text-white/40">{timeAgo(post.timestamp)}</p>
                </div>
              </div>

              <div className="relative">
                <img
                  src={post.image}
                  alt={post.caption || "Ski photo"}
                  className="w-full max-h-[500px] object-cover"
                  loading="lazy"
                />
              </div>

              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1.5 text-sm cursor-pointer hover:scale-110 transition-transform"
                  >
                    <span className={post.liked ? "text-red-400" : "text-white/50"}>
                      {post.liked ? "❤️" : "🤍"}
                    </span>
                    <span className="text-white/60">{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-sm text-cyan-300/80">
                    <span>📍</span>
                    <span>{post.location}</span>
                  </div>
                </div>
                {post.caption && (
                  <p className="text-sm text-white/70">
                    <span className="font-semibold text-white/90">{post.author}</span>{" "}
                    {post.caption}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="text-center py-12 text-white/20 text-sm">
          Made with fresh powder by ZSki
        </footer>
      </main>
    </div>
  );
}
