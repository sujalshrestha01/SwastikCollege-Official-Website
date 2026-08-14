import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import RichEditor from "../../components/RichEditor";
import {
  Card,
  Field,
  Input,
  Textarea,
  Button,
  IconButton,
  Banner,
} from "../../components/admin/Ui";
import { blogAdmin, resolveImageUrl } from "../../api/client";
import ImageUpload from "../../components/admin/ImageUpload";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState({
    _id: "",
    title: "",
    slug: "",
    category: "Technology",
    author: "Swastik College",
    excerpt: "",
    content: "",
    imageUrl: "",
  });
  const [message, setMessage] = useState(null);

  // Fetch blogs directly from the MongoDB database on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await blogAdmin.list();
      setPosts(data);
    } catch (err) {
      setMessage({
        type: "danger",
        text: "Failed to load blog posts from server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentPost({
      _id: "",
      title: "",
      slug: "",
      category: "Technology",
      author: "Swastik College",
      excerpt: "",
      content: "",
      imageUrl: "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await blogAdmin.remove(id);
        setPosts((prev) => prev.filter((p) => (p._id || p.id) !== id));
        setMessage({
          type: "success",
          text: "Blog post deleted from database.",
        });
      } catch (err) {
        setMessage({ type: "danger", text: "Failed to delete blog post." });
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentPost.title) return;

    try {
      const isExisting = Boolean(currentPost._id || currentPost.id);

      if (isExisting) {
        const targetId = currentPost._id || currentPost.id;
        const updated = await blogAdmin.update(targetId, currentPost);
        setPosts((prev) =>
          prev.map((p) => ((p._id || p.id) === targetId ? updated : p)),
        );
        setMessage({
          type: "success",
          text: "Blog post updated successfully!",
        });
      } else {
        const newPost = await blogAdmin.create(currentPost);
        setPosts((prev) => [newPost, ...prev]);
        setMessage({
          type: "success",
          text: "Blog post created and saved to database!",
        });
      }

      setIsEditing(false);
    } catch (err) {
      setMessage({
        type: "danger",
        text: "Error saving blog post to database.",
      });
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-800 dark:text-paper font-bold">
            Blog Management
          </h1>
          <p className="text-sm text-navy-500">
            Create, edit, or remove articles from the database.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleNew}>
            <Plus size={16} /> New Article
          </Button>
        )}
      </div>

      {message && <Banner type={message.type}>{message.text}</Banner>}

      {isEditing ? (
        <Card
          title={
            currentPost._id || currentPost.id ? "Edit Article" : "New Article"
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Post Title">
              <Input
                value={currentPost.title}
                onChange={(e) =>
                  setCurrentPost({ ...currentPost, title: e.target.value })
                }
                placeholder="e.g., Guide to Full-Stack Development"
                required
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Category">
                <Input
                  value={currentPost.category}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, category: e.target.value })
                  }
                  placeholder="Technology, Events, Career"
                />
              </Field>

              <Field label="Author / Department">
                <Input
                  value={currentPost.author}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, author: e.target.value })
                  }
                  placeholder="e.g., Department of Computer Science"
                />
              </Field>
            </div>

            <Field label="Cover Image">
              <ImageUpload
                value={currentPost.imageUrl}
                onChange={(url) =>
                  setCurrentPost({ ...currentPost, imageUrl: url })
                }
              />
            </Field>

            <Field label="Short Excerpt">
              <Textarea
                rows={2}
                value={currentPost.excerpt}
                onChange={(e) =>
                  setCurrentPost({ ...currentPost, excerpt: e.target.value })
                }
                placeholder="Brief summary..."
              />
            </Field>

            <Field label="Full Content">
              <RichEditor
                value={currentPost.content}
                onChange={(content) =>
                  setCurrentPost({ ...currentPost, content })
                }
                placeholder="Write full article here..."
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Post</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="mb-4 relative max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
            />
            <Input
              className="pl-9"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="py-4 text-sm text-navy-500">
              Loading articles from database...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className="py-4 text-sm text-navy-500">
              No articles found in database.
            </p>
          ) : (
            <div className="divide-y divide-navy-100">
              {filteredPosts.map((post) => {
                const postId = post._id || post.id;
                const postDate = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : post.date;

                return (
                  <div
                    key={postId}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {post.imageUrl && (
                        <img
                          src={resolveImageUrl(post.imageUrl)}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-navy-100 font-semibold px-2 py-0.5 rounded text-navy-800">
                            {post.category}
                          </span>
                          <span className="text-xs text-navy-400">
                            {postDate}
                          </span>
                        </div>
                        <h3 className="font-semibold text-navy-800">
                          {post.title}
                        </h3>
                        <p className="text-xs text-navy-500">
                          By {post.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconButton onClick={() => handleEdit(post)}>
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        onClick={() => handleDelete(postId)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
