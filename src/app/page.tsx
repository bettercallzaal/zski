"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Post {
  id: number;
  image_url: string;
  caption: string;
  author: string;
  created_at: string;
}

function Snow() {
  const [flakes, setFlakes] = useState<
    { id: number; left: number; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 0.5 + Math.random() * 1,
      }))
    );
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [author, setAuthor] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      /* offline or not set up yet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handlePost = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("author", author || "Anonymous");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        setShowUpload(false);
        setPreview(null);
        setFile(null);
        setCaption("");
        setAuthor("");
        fetchPosts();
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error}`);
      }
    } catch {
      alert("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Snow />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b1120]/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛷️</span>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent leading-tight">
                ZSki
              </h1>
              <p className="text-[11px] text-white/40 tracking-wide">
                Attitash 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            {showUpload ? "Cancel" : "+ Post"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        {/* Upload Form */}
        {showUpload && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Drop a photo</h2>

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
                  <p>Tap to add your photo</p>
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
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
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
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all cursor-pointer"
              >
                {uploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="text-center py-20 text-white/30">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🏔️</span>
            <p className="text-white/40 text-lg">No photos yet</p>
            <p className="text-white/25 text-sm mt-1">
              Be the first to post from Attitash!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {post.author[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.author}</p>
                    <p className="text-xs text-white/40">
                      {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>

                <img
                  src={post.image_url}
                  alt={post.caption || "Ski photo"}
                  className="w-full max-h-[500px] object-cover"
                  loading="lazy"
                />

                {post.caption && (
                  <div className="px-4 py-3">
                    <p className="text-sm text-white/70">
                      <span className="font-semibold text-white/90">
                        {post.author}
                      </span>{" "}
                      {post.caption}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <footer className="text-center py-12 text-white/20 text-sm">
          Attitash 2026 — ZSki
        </footer>
      </main>
    </div>
  );
}
