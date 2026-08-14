import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  User,
  Tag,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { getBlogs, getBlog, resolveImageUrl } from "../api/client";
import { Section } from "../components/Visibility";
import SEO, { SITE_URL, DEFAULT_OG_IMAGE } from "../components/SEO";

function BlogDetail({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBlog(slug).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading)
    return (
      <div className="py-20 text-center text-navy-400 text-sm">
        Loading article…
      </div>
    );
  if (!post) {
    return (
      <div className="py-20 text-center space-y-3">
        <SEO title="Article not found" path={`/blog/${slug}`} noindex />
        <p className="text-navy-500">This article couldn't be found.</p>
        <Link
          to="/blog"
          className="text-marigold-600 font-semibold hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    );
  }

  const postImage = post.imageUrl
    ? resolveImageUrl(post.imageUrl)
    : DEFAULT_OG_IMAGE;
  const description =
    post.excerpt ||
    (post.content ? post.content.slice(0, 160) : undefined) ||
    `${post.title} — Swastik College blog.`;

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <SEO
        title={post.title}
        description={description}
        path={`/blog/${post.slug || slug}`}
        image={postImage}
        type="article"
        keywords={`${post.title}, ${post.category || ""}, Swastik College blog`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          image: postImage,
          datePublished: post.createdAt,
          author: post.author
            ? { "@type": "Person", name: post.author }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "Swastik College",
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/swastik%20logo.png`,
            },
          },
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug || slug}`,
        }}
      />
      <Link
        to="/blog"
        className="text-sm text-navy-500 hover:text-marigold-600 inline-flex items-center gap-1 mb-6"
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>
      {post.imageUrl && (
        <img
          src={resolveImageUrl(post.imageUrl)}
          alt={post.title}
          className="w-full h-72 object-cover rounded-2xl mb-6"
        />
      )}
      <div className="flex items-center gap-4 text-xs text-navy-500 dark:text-navy-400 mb-3">
        {post.category && (
          <span className="inline-flex items-center gap-1">
            <Tag size={13} /> {post.category}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar size={13} />{" "}
          {new Date(post.createdAt || Date.now()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        {post.author && (
          <span className="inline-flex items-center gap-1">
            <User size={13} /> {post.author}
          </span>
        )}
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 dark:text-paper mb-6">
        {post.title}
      </h1>
      <div className="prose prose-navy dark:prose-invert max-w-none text-navy-700 dark:text-navy-200 whitespace-pre-line leading-relaxed">
        {post.content}
      </div>
    </article>
  );
}

export default function Blog() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (slug) return; // detail view fetches its own data
    getBlogs().then((data) => {
      setPosts(data || []);
      setLoading(false);
    });
  }, [slug]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(posts.map((p) => p.category).filter(Boolean)),
    );
    return ["All", ...unique];
  }, [posts]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (slug) return <BlogDetail slug={slug} />;

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      <SEO
        title="Blog — College Journal & Insights"
        description="Articles, tech guides, campus news and project showcases written by Swastik College faculty and students."
        path="/blog"
        keywords="Swastik College blog, Swastik College news, Swastik College articles"
      />
      {/* Header Banner */}
      <Section page="blog" section="hero">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-[#3B82F6] font-semibold uppercase">
            College Chronicles
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-navy-900 dark:text-paper font-bold">
            College Journal & Insights
          </h1>
          <p className="text-navy-600 dark:text-navy-300 max-w-2xl mx-auto text-sm sm:text-base">
            Articles, tech guides, campus news, and project showcases written by
            our faculty and students.
          </p>
        </div>
      </Section>

      <Section page="blog" section="list">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-paper dark:bg-navy-800 p-4 rounded-xl border border-navy-100 dark:border-navy-700 shadow-sm">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-marigold text-navy-900 font-semibold"
                    : "bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
            />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-900 text-navy-800 dark:text-paper focus:outline-none focus:ring-2 focus:ring-marigold"
            />
          </div>
        </div>

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="text-center py-16 text-navy-400 text-sm">
            Loading articles…
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredPosts.map((post) => (
              <article
                key={post._id}
                className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-100 dark:border-navy-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-48 overflow-hidden relative bg-navy-50 dark:bg-navy-900">
                  {post.imageUrl && (
                    <img
                      src={resolveImageUrl(post.imageUrl)}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur text-marigold text-xs font-mono font-semibold px-2.5 py-1 rounded-md">
                      {post.category}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-navy-500 dark:text-navy-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(
                          post.createdAt || Date.now(),
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User size={13} />
                          {post.author}
                        </span>
                      )}
                    </div>

                    <h2 className="font-display font-semibold text-lg text-navy-900 dark:text-paper line-clamp-2 hover:text-marigold transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-navy-100 dark:border-navy-700">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 dark:text-marigold hover:gap-2 transition-all"
                    >
                      Read Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-navy-500 dark:text-navy-400">
            <p className="text-lg">
              No articles published yet — check back soon.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
